import type { RequestHandler } from "express";

import { sendSuccess } from "../../utils/apiResponse.js";
import * as userService from "./user.service.js";

export const getProfile: RequestHandler = async (req, res) => {
  sendSuccess(res, 200, "Profile fetched", { user: await userService.getProfile(req.user!.id) });
};

export const updateProfile: RequestHandler = async (req, res) => {
  sendSuccess(res, 200, "Profile updated", { user: await userService.updateProfile(req.user!.id, req.body) });
};

export const updateAvatar: RequestHandler = async (req, res) => {
  sendSuccess(res, 200, "Avatar updated", { user: await userService.updateAvatar(req.user!.id, req.file) });
};

export const changePassword: RequestHandler = async (req, res) => {
  await userService.changePassword(req.user!.id, req.body);
  sendSuccess(res, 200, "Password changed. Please login again.");
};

export const deleteAccount: RequestHandler = async (req, res) => {
  await userService.deleteAccount(req.user!.id);
  sendSuccess(res, 200, "Account deleted");
};

export const listUsers: RequestHandler = async (req, res) => {
  const result = await userService.listUsers(req.query as never);
  sendSuccess(res, 200, "Users fetched", result.items, result.meta);
};

export const updateRole: RequestHandler = async (req, res) => {
  sendSuccess(res, 200, "Role updated", {
    user: await userService.updateRole(String(req.params.userId), req.body.role)
  });
};

export const updateStatus: RequestHandler = async (req, res) => {
  sendSuccess(res, 200, "Status updated", {
    user: await userService.updateStatus(String(req.params.userId), req.body.status)
  });
};
