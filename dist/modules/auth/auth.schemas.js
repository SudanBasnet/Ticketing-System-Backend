import { z } from "zod";
export const registerSchema = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(8).max(128)
});
export const loginSchema = z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1)
});
export const tokenSchema = z.object({
    token: z.string().min(20)
});
export const forgotPasswordSchema = z.object({
    email: z.string().trim().email().toLowerCase()
});
export const resetPasswordSchema = z.object({
    token: z.string().min(20),
    password: z.string().min(8).max(128)
});
