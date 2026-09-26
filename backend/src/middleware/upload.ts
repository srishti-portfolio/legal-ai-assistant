import { randomUUID } from "node:crypto";
import path from "node:path";
import multer, { type FileFilterCallback } from "multer";
import { env } from "../config/env.js";
import { SUPPORTED_MIME_TYPES } from "../services/extract.js";
import { BadRequestError } from "../utils/AppError.js";

// Storage keys are random UUIDs, never the user-supplied filename — this closes off
// path traversal (`../../etc`) and collisions between uploads with the same name.
const storage = multer.diskStorage({
  destination: env.uploads.dir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(_req: unknown, file: Express.Multer.File, cb: FileFilterCallback): void {
  if ((SUPPORTED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new BadRequestError(`Unsupported file type: ${file.mimetype}. Allowed: PDF, JPG/JPEG, DOCX.`));
}

export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.uploads.maxUploadMb * 1024 * 1024,
    files: 1,
  },
}).single("file");
