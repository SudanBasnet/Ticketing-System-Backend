import crypto from "node:crypto";
export const requestId = (req, res, next) => {
    const id = req.header("x-request-id") ?? crypto.randomUUID();
    req.id = id;
    res.setHeader("x-request-id", id);
    next();
};
