import fs from "fs";
import path from "path";
import { defineEventHandler, getRouterParam } from "h3";

const metadataFilePath = path.resolve("public/uploads", "metadata.json");

export default defineEventHandler(async (event) => {
  const encodedFilename = getRouterParam(event, "filename");
  if (!encodedFilename) {
    return { success: false, message: "Filename is required" };
  }

  const filename = decodeURIComponent(encodedFilename);
  if (!filename || filename === "") {
    return { success: false, message: "Invalid filename" };
  }

  const filePath = path.resolve("public/uploads", filename);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      const metadata = JSON.parse(fs.readFileSync(metadataFilePath, "utf-8"));

      const updatedMetadata = metadata.filter(
        (entry: { filename: string }) => entry.filename !== filename,
      );

      fs.writeFileSync(
        metadataFilePath,
        JSON.stringify(updatedMetadata, null, 2),
      );

      return {
        success: true,
        message: `File ${filename} deleted successfully`,
      };
    } else {
      return { success: false, message: "File not found" };
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: "Error deleting file",
        error: error.message,
      };
    } else {
      return { success: false, message: "Unknown error deleting file" };
    }
  }
});
