import { defineEventHandler } from "h3";
import { promises as fs } from "fs";
import path from "path";

const METADATA_FILE = path.resolve("public/uploads/metadata.json");

export default defineEventHandler(async () => {
  try {
    const data = await fs.readFile(METADATA_FILE, "utf-8");
    const files = JSON.parse(data);
    return { success: true, files };
  } catch (error) {
    return {
      success: false,
      message: "Could not read files",
      error: error instanceof Error ? error.message : error,
    };
  }
});
