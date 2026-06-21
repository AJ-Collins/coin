import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads/kyc');

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const filePath = path.join(UPLOAD_DIR, fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
}

export async function deleteUserKYCDirectory(userId: string): Promise<void> {
  try {
    const userDir = path.join(UPLOAD_DIR, userId);
    if (fs.existsSync(userDir)) {
      fs.rmSync(userDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error('Error deleting user KYC directory:', err);
  }
}

export function getFileUrl(userId: string, filename: string): string {
  return path.join(userId, filename);
}

export function getFullFilePath(fileUrl: string): string {
  return path.join(UPLOAD_DIR, fileUrl);
}
