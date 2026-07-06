import { sendSuccess } from "../../utils/apiResponse.js";
import * as authService from "./auth.service.js";
const cookieToken = (req) => req.cookies?.refreshToken;
export const register = async (req, res) => {
    const result = await authService.register(req.body, res, req.ip, req.header("user-agent"));
    sendSuccess(res, 201, "User registered", result);
};
export const login = async (req, res) => {
    const result = await authService.login(req.body, res, req.ip, req.header("user-agent"));
    sendSuccess(res, 200, "Login successful", result);
};
export const refreshToken = async (req, res) => {
    const result = await authService.refresh(cookieToken(req), res, req.ip, req.header("user-agent"));
    sendSuccess(res, 200, "Token refreshed", result);
};
export const logout = async (req, res) => {
    await authService.logout(cookieToken(req), res, req.ip);
    sendSuccess(res, 200, "Logged out");
};
export const verifyEmail = async (req, res) => {
    await authService.verifyEmail(req.body.token);
    sendSuccess(res, 200, "Email verified");
};
export const resendVerification = async (req, res) => {
    await authService.resendVerification(req.user.id);
    sendSuccess(res, 200, "Verification email sent if needed");
};
export const forgotPassword = async (req, res) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, 200, "If an account exists, a reset email has been sent");
};
export const resetPassword = async (req, res) => {
    await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, 200, "Password reset successful");
};
export const me = async (req, res) => {
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, 200, "Authenticated user", { user });
};
