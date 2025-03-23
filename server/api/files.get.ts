import fs from "fs";
import path from "path";
import { defineEventHandler } from "h3";

const metadataFilePath = path.resolve("public/uploads", "metadata.json");

export default defineEventHandler(async () => {
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataFilePath, "utf-8"));
    return { success: true, files: metadata };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: "Error reading metadata",
        error: error.message,
      };
    }
  }
});
