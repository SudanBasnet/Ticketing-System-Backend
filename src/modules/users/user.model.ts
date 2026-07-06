import bcrypt from "bcryptjs";
import mongoose, { type HydratedDocument, Schema } from "mongoose";

export type UserRole = "user" | "agent" | "admin";
export type UserStatus = "active" | "disabled" | "deleted";

export type User = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  avatarUrl?: string;
  avatarPublicId?: string;
  isEmailVerified: boolean;
  status: UserStatus;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = HydratedDocument<User> & {
  comparePassword(candidate: string): Promise<boolean>;
};

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "agent", "admin"], default: "user", index: true },
    avatarUrl: { type: String },
    avatarPublicId: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "disabled", "deleted"], default: "active", index: true },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    tokenVersion: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
