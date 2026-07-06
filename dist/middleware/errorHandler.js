import multer from "multer";
import { MongoServerError } from "mongodb";
import { ZodError } from "zod";
import { isProduction } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
export const notFound = (req, _res, next) => {
    next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, "NOT_FOUND"));
};
export const errorHandler = (error, req, res, _next) => {
    let statusCode = error instanceof AppError ? error.statusCode : 500;
    let message = error instanceof AppError ? error.message : "Internal server error";
    let errors;
    if (error instanceof ZodError) {
        statusCode = 400;
        message = "Validation failed";
        errors = error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
        }));
    }
    if (error instanceof MongoServerError && error.code === 11000) {
        statusCode = 409;
        message = "A record with that value already exists";
    }
    if (error instanceof multer.MulterError) {
        statusCode = 400;
        message = error.code === "LIMIT_FILE_SIZE" ? "File is too large. Maximum upload size is 5 MB." : error.message;
    }
    logger.error({
        err: error,
        requestId: req.id,
        method: req.method,
        path: req.originalUrl
    }, message);
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors ? { errors } : {}),
        requestId: req.id,
        ...(!isProduction && statusCode === 500 ? { stack: error.stack } : {})
    });
};
