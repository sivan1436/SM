import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const uploadDirectory = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../uploads"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
	destination: uploadDirectory,
	filename: (_req, file, callback) => {
		const extension = path.extname(file.originalname).toLowerCase();
		callback(null, `${crypto.randomUUID()}${extension}`);
	},
});

const mediaOnly = (_req, file, callback) => {
	if (file.mimetype?.startsWith("image/") ||
		file.mimetype?.startsWith("video/") ||
		file.mimetype?.startsWith("audio/")) {
		callback(null, true);
		return;
	}

	callback(new Error("Only image, video, and audio files are allowed"));
};

const upload = multer({
	storage,
	fileFilter: mediaOnly,
	limits: { fileSize: 10 * 1024 * 1024, files: 6 },
});

export default upload.array("media", 6);