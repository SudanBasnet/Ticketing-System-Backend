import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
export const randomToken = () => crypto.randomBytes(48).toString("base64url");
export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
export const signAccessToken = (user) => jwt.sign({
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion
}, config.ACCESS_TOKEN_SECRET, {
    subject: user.id,
    expiresIn: config.ACCESS_TOKEN_TTL
});
