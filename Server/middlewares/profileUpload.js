import multer from "multer";

const imageOnly = (_req, file, callback) => {
  if (file.mimetype?.startsWith("image/")) {
    callback(null, true);
    return;
  }

  callback(new Error("Only image files are allowed"));
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload.fields([
  { name: "profile_picture", maxCount: 1 },
  { name: "cover_photo", maxCount: 1 },
]);
