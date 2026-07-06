import { sendSuccess } from "../../utils/apiResponse.js";
import * as userService from "./user.service.js";
export const getProfile = async (req, res) => {
    sendSuccess(res, 200, "Profile fetched", { user: await userService.getProfile(req.user.id) });
};
export const updateProfile = async (req, res) => {
    sendSuccess(res, 200, "Profile updated", { user: await userService.updateProfile(req.user.id, req.body) });
};
export const updateAvatar = async (req, res) => {
    sendSuccess(res, 200, "Avatar updated", { user: await userService.updateAvatar(req.user.id, req.file) });
};
export const changePassword = async (req, res) => {
    await userService.changePassword(req.user.id, req.body);
    sendSuccess(res, 200, "Password changed. Please login again.");
};
export const deleteAccount = async (req, res) => {
    await userService.deleteAccount(req.user.id);
    sendSuccess(res, 200, "Account deleted");
};
export const listUsers = async (req, res) => {
    const result = await userService.listUsers(req.query);
    sendSuccess(res, 200, "Users fetched", result.items, result.meta);
};
export const updateRole = async (req, res) => {
    sendSuccess(res, 200, "Role updated", {
        user: await userService.updateRole(String(req.params.userId), req.body.role)
    });
};
export const updateStatus = async (req, res) => {
    sendSuccess(res, 200, "Status updated", {
        user: await userService.updateStatus(String(req.params.userId), req.body.status)
    });
};
