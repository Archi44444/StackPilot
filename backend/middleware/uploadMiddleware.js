import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import fs from 'fs';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const allowedMimeTypes = new Map([
  ['pdf', ['application/pdf']],
  ['docx', ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']],
  ['md', ['text/markdown', 'text/plain', 'text/x-markdown']],
  ['txt', ['text/plain']],
]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).slice(1).toLowerCase();
  const validExt = env.allowedFileTypes.includes(ext);
  const validMime = allowedMimeTypes.get(ext)?.includes(file.mimetype);
  if (!validExt || !validMime) {
    cb(new AppError('Only PDF, DOCX, Markdown, and TXT files are allowed.', { statusCode: 400, code: 'UNSUPPORTED_FILE_TYPE' }));
    return;
  }
  cb(null, true);
};

export const uploadDocument = multer({
  storage,
  limits: { fileSize: env.maxFileSizeBytes, files: 1 },
  fileFilter,
});
