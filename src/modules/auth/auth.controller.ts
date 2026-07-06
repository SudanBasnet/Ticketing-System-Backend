import type { RequestHandler } from "express";

import { sendSuccess } from "../../utils/apiResponse.js";
import * as authService from "./auth.service.js";

const cookieToken = (req: Parameters<RequestHandler>[0]) => req.cookies?.refreshToken as string | undefined;

export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body, res, req.ip, req.header("user-agent"));
  sendSuccess(res, 201, "User registered", result);
};

export const login: RequestHandler = async (req, res) => {
  const result = await authService.login(req.body, res, req.ip, req.header("user-agent"));
  sendSuccess(res, 200, "Login successful", result);
};

export const refreshToken: RequestHandler = async (req, res) => {
  const result = await authService.refresh(cookieToken(req), res, req.ip, req.header("user-agent"));
  sendSuccess(res, 200, "Token refreshed", result);
};

export const logout: RequestHandler = async (req, res) => {
  await authService.logout(cookieToken(req), res, req.ip);
  sendSuccess(res, 200, "Logged out");
};

export const verifyEmail: RequestHandler = async (req, res) => {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, 200, "Email verified");
};

export const resendVerification: RequestHandler = async (req, res) => {
  await authService.resendVerification(req.user!.id);
  sendSuccess(res, 200, "Verification email sent if needed");
};

export const forgotPassword: RequestHandler = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, 200, "If an account exists, a reset email has been sent");
};

export const resetPassword: RequestHandler = async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  sendSuccess(res, 200, "Password reset successful");
};

export const me: RequestHandler = async (req, res) => {
  const user = await authService.getMe(req.user!.id);
  sendSuccess(res, 200, "Authenticated user", { user });
};
