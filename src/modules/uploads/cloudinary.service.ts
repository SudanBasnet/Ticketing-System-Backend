import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { config } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

const isConfigured = () =>
  Boolean(config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET);

const configureCloudinary = () => {
  if (!isConfigured()) {
    throw new AppError(503, "Cloudinary is not configured", "CLOUDINARY_NOT_CONFIGURED");
  }

  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true
  });
};

export const uploadBuffer = async (
  file: Express.Multer.File,
  options: { folder: string; publicId?: string; resourceType?: "image" | "raw" | "auto" }
) => {
  configureCloudinary();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: options.resourceType ?? "auto",
        overwrite: Boolean(options.publicId)
      },
      (error, result) => {
        if (error || !result) {
          const status = typeof error?.http_code === "number" ? error.http_code : 502;
          const message =
            status === 403
              ? "Cloudinary rejected the upload. Check that the API key and secret belong to the correct product environment and have Upload API access."
              : error?.message || "File upload failed";

          reject(new AppError(status === 403 ? 502 : status, message, "UPLOAD_FAILED", error));
          return;
        }
        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

export const deleteCloudinaryAsset = async (publicId?: string, resourceType: "image" | "raw" = "image") => {
  if (!publicId || !isConfigured()) return;

  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
