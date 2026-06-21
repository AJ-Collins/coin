import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOAD_DIR = path.join(__dirname, '../../uploads/kyc');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ['application/pdf', 'image/jpeg', 'image/png'];

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id;
    if (!userId) {
      return cb(new Error('User not authenticated'), '');
    }
    const userDir = path.join(UPLOAD_DIR, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uuid}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error(`Only PDF, JPG, PNG files accepted. Got: ${file.mimetype}`));
  }
  cb(null, true);
};

export const kycUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2,
  },
});
