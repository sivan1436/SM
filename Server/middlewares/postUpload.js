import crypto from "crypto";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const uploadDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../uploads"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const mediaOnly = (_req, file, callback) => {
  if (file.mimetype?.startsWith("image/") || file.mimetype?.startsWith("video/")) {
    callback(null, true);
    return;
  }

  callback(new Error("Only image and video files are allowed"));
};

const upload = multer({
  storage,
  fileFilter: mediaOnly,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
});

export default upload.array("media", 10);