import multer from "multer";

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
	storage: multer.memoryStorage(),
	fileFilter: mediaOnly,
	limits: { fileSize: 10 * 1024 * 1024, files: 6 },
});

export default upload.array("media", 6);