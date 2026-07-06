import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import { config } from "../config/env.js";
import type { UserDocument } from "../modules/users/user.model.js";

export const randomToken = () => crypto.randomBytes(48).toString("base64url");

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const signAccessToken = (user: UserDocument) =>
  jwt.sign(
    {
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion
    },
    config.ACCESS_TOKEN_SECRET,
    {
      subject: user.id,
      expiresIn: config.ACCESS_TOKEN_TTL as StringValue
    }
  );
