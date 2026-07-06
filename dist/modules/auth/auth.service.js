import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { config, isProduction } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { sendMail } from "../../utils/email.js";
import { hashToken, randomToken, signAccessToken } from "../../utils/tokens.js";
import { UserModel } from "../users/user.model.js";
import { EmailVerificationTokenModel, PasswordResetTokenModel, RefreshTokenModel } from "./auth.models.js";
const refreshCookieName = "refreshToken";
const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    status: user.status
});
const setRefreshCookie = (res, token) => {
    res.cookie(refreshCookieName, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        domain: config.COOKIE_DOMAIN,
        maxAge: config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth"
    });
};
export const clearRefreshCookie = (res) => {
    res.clearCookie(refreshCookieName, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        domain: config.COOKIE_DOMAIN,
        path: "/api/v1/auth"
    });
};
const createRefreshToken = async (user, ip, userAgent, familyId) => {
    const resolvedFamilyId = familyId ?? crypto.randomUUID();
    const token = randomToken();
    const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    const record = await RefreshTokenModel.create({
        userId: user._id,
        tokenHash: hashToken(token),
        familyId: resolvedFamilyId,
        expiresAt,
        createdByIp: ip,
        userAgent
    });
    return { token, record };
};
const issueTokenPair = async (user, res, ip, userAgent, familyId) => {
    const accessToken = signAccessToken(user);
    const { token, record } = await createRefreshToken(user, ip, userAgent, familyId);
    setRefreshCookie(res, token);
    return { accessToken, refreshTokenRecord: record };
};
export const register = async (input, res, ip, userAgent) => {
    const existing = await UserModel.exists({ email: input.email });
    if (existing)
        throw new AppError(409, "Email already exists", "EMAIL_EXISTS");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await UserModel.create({ name: input.name, email: input.email, passwordHash });
    const verificationToken = randomToken();
    await EmailVerificationTokenModel.create({
        userId: user._id,
        tokenHash: hashToken(verificationToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await sendMail({
        to: user.email,
        subject: "Verify your ticketing system account",
        text: `Use this verification token: ${verificationToken}`
    });
    const tokens = await issueTokenPair(user, res, ip, userAgent);
    return { user: sanitizeUser(user), accessToken: tokens.accessToken };
};
export const login = async (input, res, ip, userAgent) => {
    const user = await UserModel.findOne({ email: input.email, status: { $ne: "deleted" } }).select("+passwordHash");
    if (!user || !(await user.comparePassword(input.password))) {
        throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
    }
    if (user.status === "disabled")
        throw new AppError(403, "Account is disabled", "ACCOUNT_DISABLED");
    user.lastLoginAt = new Date();
    await user.save();
    const tokens = await issueTokenPair(user, res, ip, userAgent);
    return { user: sanitizeUser(user), accessToken: tokens.accessToken };
};
export const refresh = async (refreshToken, res, ip, userAgent) => {
    if (!refreshToken)
        throw new AppError(401, "Refresh token required", "REFRESH_REQUIRED");
    const existing = await RefreshTokenModel.findOne({ tokenHash: hashToken(refreshToken) });
    if (!existing)
        throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    if (existing.revokedAt || existing.replacedByTokenId || existing.expiresAt <= new Date()) {
        await RefreshTokenModel.updateMany({ familyId: existing.familyId }, { $set: { revokedAt: new Date(), revokedByIp: ip } });
        clearRefreshCookie(res);
        throw new AppError(401, "Refresh token reuse detected. Please login again.", "REFRESH_REUSE_DETECTED");
    }
    const user = await UserModel.findById(existing.userId);
    if (!user || user.status !== "active")
        throw new AppError(401, "User not available", "USER_UNAVAILABLE");
    const tokens = await issueTokenPair(user, res, ip, userAgent, existing.familyId);
    existing.revokedAt = new Date();
    existing.revokedByIp = ip;
    existing.replacedByTokenId = tokens.refreshTokenRecord._id;
    await existing.save();
    return { user: sanitizeUser(user), accessToken: tokens.accessToken };
};
export const logout = async (refreshToken, res, ip) => {
    if (refreshToken) {
        await RefreshTokenModel.updateOne({ tokenHash: hashToken(refreshToken), revokedAt: { $exists: false } }, { $set: { revokedAt: new Date(), revokedByIp: ip } });
    }
    clearRefreshCookie(res);
};
export const verifyEmail = async (token) => {
    const record = await EmailVerificationTokenModel.findOne({ tokenHash: hashToken(token), usedAt: { $exists: false } });
    if (!record || record.expiresAt <= new Date())
        throw new AppError(400, "Invalid or expired verification token", "INVALID_VERIFICATION_TOKEN");
    const user = await UserModel.findById(record.userId);
    if (!user)
        throw new AppError(404, "User not found", "USER_NOT_FOUND");
    user.isEmailVerified = true;
    record.usedAt = new Date();
    await Promise.all([user.save(), record.save()]);
};
export const resendVerification = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user)
        throw new AppError(404, "User not found", "USER_NOT_FOUND");
    if (user.isEmailVerified)
        return;
    const token = randomToken();
    await EmailVerificationTokenModel.create({
        userId: user._id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await sendMail({ to: user.email, subject: "Verify your account", text: `Use this verification token: ${token}` });
};
export const forgotPassword = async (email) => {
    const user = await UserModel.findOne({ email, status: "active" });
    if (!user)
        return;
    const token = randomToken();
    const frontendOrigin = config.CLIENT_ORIGIN.split(",")[0];
    const resetUrl = config.CLIENT_RESET_PASSWORD_URL ?? `${frontendOrigin}/reset-password`;
    const resetLink = `${resetUrl}?token=${encodeURIComponent(token)}`;
    await PasswordResetTokenModel.create({
        userId: user._id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });
    await sendMail({
        to: user.email,
        subject: "Reset your password",
        text: [
            "Use this link to reset your password:",
            resetLink,
            "",
            "This link expires in 1 hour.",
            "",
            "If the link does not open, paste this token into the reset page:",
            token
        ].join("\n")
    });
};
export const resetPassword = async (token, password) => {
    const record = await PasswordResetTokenModel.findOne({ tokenHash: hashToken(token), usedAt: { $exists: false } });
    if (!record || record.expiresAt <= new Date())
        throw new AppError(400, "Invalid or expired reset token", "INVALID_RESET_TOKEN");
    const user = await UserModel.findById(record.userId).select("+passwordHash");
    if (!user)
        throw new AppError(404, "User not found", "USER_NOT_FOUND");
    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordChangedAt = new Date();
    user.tokenVersion += 1;
    record.usedAt = new Date();
    await RefreshTokenModel.updateMany({ userId: user._id }, { $set: { revokedAt: new Date() } });
    await Promise.all([user.save(), record.save()]);
};
export const getMe = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user)
        throw new AppError(404, "User not found", "USER_NOT_FOUND");
    return sanitizeUser(user);
};
