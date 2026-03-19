import { promises as fs } from "fs";
import path from "path";

/**
 * Saves a File object locally to the public/uploads folder.
 * Returns the public URL path.
 */
export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Ensure the uploads directory exists
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Create a unique filename
  const extension = path.extname(file.name) || "";
  const baseName = path.basename(file.name, extension).replace(/[^a-zA-Z0-9]/g, "_");
  const uniqueName = `${Date.now()}_${baseName}${extension}`;
  
  const filePath = path.join(uploadDir, uniqueName);
  await fs.writeFile(filePath, buffer);

  // Return the web-accessible path
  return `/uploads/${uniqueName}`;
}
