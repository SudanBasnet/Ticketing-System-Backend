import bcrypt from "bcryptjs";

import { AppError } from "../../utils/AppError.js";
import { RefreshTokenModel } from "../auth/auth.models.js";
import { deleteCloudinaryAsset, uploadBuffer } from "../uploads/cloudinary.service.js";
import { UserModel, type UserDocument, type UserRole, type UserStatus } from "./user.model.js";

const sanitizeUser = (user: UserDocument) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl,
  isEmailVerified: user.isEmailVerified,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const getProfile = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  return sanitizeUser(user);
};

export const updateProfile = async (userId: string, input: { name?: string; avatarUrl?: string }) => {
  const user = await UserModel.findByIdAndUpdate(userId, input, { new: true, runValidators: true });
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  return sanitizeUser(user);
};

export const updateAvatar = async (userId: string, file: Express.Multer.File | undefined) => {
  if (!file) throw new AppError(400, "Avatar image is required", "FILE_REQUIRED");
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(400, "Avatar must be an image", "AVATAR_MUST_BE_IMAGE");
  }

  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");

  const uploaded = await uploadBuffer(file, {
    folder: "ticketing-system/avatars",
    publicId: user.id,
    resourceType: "image"
  });

  if (user.avatarPublicId && user.avatarPublicId !== uploaded.public_id) {
    await deleteCloudinaryAsset(user.avatarPublicId, "image");
  }

  user.avatarUrl = uploaded.secure_url;
  user.avatarPublicId = uploaded.public_id;
  await user.save();

  return sanitizeUser(user);
};

export const changePassword = async (userId: string, input: { currentPassword: string; newPassword: string }) => {
  const user = await UserModel.findById(userId).select("+passwordHash");
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  if (!(await user.comparePassword(input.currentPassword))) {
    throw new AppError(400, "Current password is incorrect", "INVALID_CURRENT_PASSWORD");
  }

  user.passwordHash = await bcrypt.hash(input.newPassword, 12);
  user.passwordChangedAt = new Date();
  user.tokenVersion += 1;
  await RefreshTokenModel.updateMany({ userId: user._id }, { $set: { revokedAt: new Date() } });
  await user.save();
};

export const deleteAccount = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  user.status = "deleted";
  user.email = `deleted-${user.id}-${user.email}`;
  user.tokenVersion += 1;
  await RefreshTokenModel.updateMany({ userId: user._id }, { $set: { revokedAt: new Date() } });
  await user.save();
};

export const listUsers = async (query: { page: number; limit: number; role?: UserRole; status?: UserStatus; search?: string }) => {
  const filter: Record<string, unknown> = {};
  if (query.role) filter.role = query.role;
  if (query.status) filter.status = query.status;
  if (query.search) filter.$or = [{ name: new RegExp(query.search, "i") }, { email: new RegExp(query.search, "i") }];

  const [items, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit),
    UserModel.countDocuments(filter)
  ]);

  return {
    items: items.map(sanitizeUser),
    meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) }
  };
};

export const updateRole = async (userId: string, role: UserRole) => {
  const user = await UserModel.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true });
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  return sanitizeUser(user);
};

export const updateStatus = async (userId: string, status: Exclude<UserStatus, "deleted">) => {
  const user = await UserModel.findByIdAndUpdate(userId, { status }, { new: true, runValidators: true });
  if (!user) throw new AppError(404, "User not found", "USER_NOT_FOUND");
  if (status === "disabled") {
    await RefreshTokenModel.updateMany({ userId: user._id }, { $set: { revokedAt: new Date() } });
  }
  return sanitizeUser(user);
};
