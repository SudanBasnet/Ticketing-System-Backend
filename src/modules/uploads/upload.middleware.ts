import multer from "multer";

import { AppError } from "../../utils/AppError.js";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain"
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError(400, "Unsupported file type", "UNSUPPORTED_FILE_TYPE"));
      return;
    }

    cb(null, true);
  }
});
