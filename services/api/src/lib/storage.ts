import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface StoredFile {
  storageKey: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
}

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), env.STORAGE_LOCAL_DIR);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Saves a buffer to local private storage.
   */
  async saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<StoredFile> {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(
        `Unsupported file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds maximum limit of 5MB`);
    }

    // Generate non-guessable private storage key
    const ext = path.extname(originalName) || '.bin';
    const storageKey = `${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(this.uploadDir, storageKey);

    await fs.promises.writeFile(targetPath, buffer);
    logger.info({ storageKey, size: buffer.length }, 'File saved to private storage');

    return {
      storageKey,
      originalName,
      contentType: mimeType,
      sizeBytes: buffer.length,
    };
  }

  /**
   * Gets absolute path of stored file.
   */
  getFilePath(storageKey: string): string {
    // Prevent directory traversal attacks
    const safeKey = path.basename(storageKey);
    const fullPath = path.join(this.uploadDir, safeKey);
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found in storage');
    }
    return fullPath;
  }

  /**
   * Deletes a file from storage.
   */
  async deleteFile(storageKey: string): Promise<void> {
    const safeKey = path.basename(storageKey);
    const fullPath = path.join(this.uploadDir, safeKey);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }
}

export const storageService = new StorageService();
