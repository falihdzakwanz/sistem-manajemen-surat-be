import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya PDF dan DOCX yang diizinkan"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, 
});