import multer from "multer";

const mediaOnly = (_req, file, callback) => {
  if (file.mimetype?.startsWith("image/") || file.mimetype?.startsWith("video/")) {
    callback(null, true);
    return;
  }

  callback(new Error("Only image and video files are allowed"));
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: mediaOnly,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
});

export default upload.array("media", 10);