import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_ROOT = path.join(__dirname, "..", "..", "media");

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 4 * 1024 * 1024; // 4MB

const ALLOWED_CHANNEL_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];
const CHANNEL_MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Creates a multer upload middleware for a specific subdirectory.
 * Usage: createUpload("profiles"), createUpload("projects"), etc.
 */
export function createUpload(subdir) {
  const dest = path.join(MEDIA_ROOT, subdir);
  fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_SIZE },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only PNG, JPEG, and JPG images are allowed"));
      }
    },
  });
}

/**
 * Creates a multer upload middleware for channel files (images, PDF, DOCX, DOC).
 * Usage: createChannelUpload("channels")
 */
export function createChannelUpload(subdir) {
  const dest = path.join(MEDIA_ROOT, subdir);
  fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: CHANNEL_MAX_SIZE },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_CHANNEL_TYPES.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only images, PDF, DOCX, and DOC files are allowed"));
      }
    },
  });
}
