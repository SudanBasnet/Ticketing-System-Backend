import nodemailer from "nodemailer";
import { config } from "../config/env.js";
import { logger } from "./logger.js";
const hasSmtp = config.SMTP_HOST && config.SMTP_PORT && config.SMTP_USER && config.SMTP_PASS;
export const sendMail = async (options) => {
    if (!hasSmtp) {
        logger.info({ to: options.to, subject: options.subject, text: options.text }, "Email skipped: SMTP not configured");
        return;
    }
    const transporter = nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        secure: config.SMTP_PORT === 465,
        auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS
        }
    });
    await transporter.sendMail({
        from: config.SMTP_FROM ?? config.SMTP_USER,
        ...options
    });
};
