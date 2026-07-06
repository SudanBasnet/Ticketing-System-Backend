import mongoose, { Schema } from "mongoose";
const refreshTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    familyId: { type: String, required: true, index: true },
    replacedByTokenId: { type: Schema.Types.ObjectId, ref: "RefreshToken" },
    revokedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: true },
    createdByIp: { type: String },
    revokedByIp: { type: String },
    userAgent: { type: String }
}, { timestamps: true });
const emailVerificationTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date }
}, { timestamps: true });
const passwordResetTokenSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date }
}, { timestamps: true });
export const RefreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);
export const EmailVerificationTokenModel = mongoose.model("EmailVerificationToken", emailVerificationTokenSchema);
export const PasswordResetTokenModel = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
