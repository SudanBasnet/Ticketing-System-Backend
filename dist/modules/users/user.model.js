import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "agent", "admin", "super_admin"], default: "user", index: true },
    avatarUrl: { type: String },
    avatarPublicId: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "disabled", "deleted"], default: "active", index: true },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });
userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.passwordHash);
};
export const UserModel = mongoose.model("User", userSchema);
