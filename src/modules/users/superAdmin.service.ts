import bcrypt from "bcryptjs";

import { config } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { UserModel } from "./user.model.js";

export const ensureSuperAdmin = async () => {
  if (!config.SUPER_ADMIN_EMAIL || !config.SUPER_ADMIN_PASSWORD) return;

  const email = config.SUPER_ADMIN_EMAIL.toLowerCase();
  const existing = await UserModel.findOne({ email });
  if (existing) {
    if (existing.role !== "super_admin") {
      existing.role = "super_admin";
      existing.status = "active";
      await existing.save();
    }
    return;
  }

  await UserModel.create({
    name: config.SUPER_ADMIN_NAME || "System Owner",
    email,
    passwordHash: await bcrypt.hash(config.SUPER_ADMIN_PASSWORD, 12),
    role: "super_admin",
    status: "active",
    isEmailVerified: true,
  });
  logger.info({ email }, "Super admin account created");
};
