export const sendSuccess = (res, statusCode, message, data = null, meta) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta ? { meta } : {})
    });
};
