import { defineEventHandler, H3Event, readMultipartFormData } from "h3";
import { promises as fs } from "fs";
import path from "path";

const uploadDir = path.resolve("public/uploads");
const metadataFilePath = path.resolve(uploadDir, "metadata.json");

const ALLOWED_EXTENSIONS = [".yaml", ".yml"];

export default defineEventHandler(async (event: H3Event) => {
  const files = await readMultipartFormData(event);
  if (!files || files.length === 0) {
    return { success: false, message: "No file uploaded" };
  }

  const file = files[0];
  if (!file.filename || !file.data) {
    return { success: false, message: "Invalid file" };
  }

  const fileExt = path.extname(file.filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return {
      success: false,
      message: "Only YAML files (.yaml, .yml) are allowed",
    };
  }

  const filePath = path.join(uploadDir, file.filename);
  await fs.writeFile(filePath, file.data);

  const uploadedDate = new Date().toISOString();
  const metadata = { filename: file.filename, uploadedDate };

  let existingMetadata = [];
  try {
    const data = await fs.readFile(metadataFilePath, "utf-8");
    existingMetadata = JSON.parse(data);
  } catch (error) {
    console.log(error);
    return { success: false, message: "Could not create metadata" };
  }

  existingMetadata.push(metadata);
  await fs.writeFile(
    metadataFilePath,
    JSON.stringify(existingMetadata, null, 2),
  );

  return {
    success: true,
    message: "File uploaded successfully",
    filename: file.filename,
    uploadedDate,
  };
});
