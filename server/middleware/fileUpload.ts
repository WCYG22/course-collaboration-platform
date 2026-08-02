/**
 * File Upload Middleware
 * Handles file uploads with validation and storage
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const materialsDir = path.join(uploadsDir, 'materials');
const submissionsDir = path.join(uploadsDir, 'submissions');
const avatarsDir = path.join(uploadsDir, 'avatars');

[materialsDir, submissionsDir, avatarsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    let folder = uploadsDir;
    
    if (req.path.includes('/materials')) {
      folder = materialsDir;
    } else if (req.path.includes('/submissions')) {
      folder = submissionsDir;
    } else if (req.path.includes('/avatar')) {
      folder = avatarsDir;
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for validation
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimeTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Archives
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    // Code files
    'text/javascript',
    'text/html',
    'text/css',
    'application/json',
    'application/xml',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// Specific upload configurations
export const uploadMaterial = upload.single('file');
export const uploadSubmission = upload.single('file');
export const uploadAvatar = upload.single('avatar');
export const uploadMultiple = upload.array('files', 10); // Max 10 files

// Helper function to delete file
export function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Helper function to get file size in readable format
export function getFileSizeFormatted(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Validate file extension against allowed types
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = path.extname(filename).toLowerCase().substring(1);
  return allowedExtensions.includes(ext);
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Check if file exists
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// Get file stats
export function getFileStats(filePath: string): fs.Stats | null {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}
