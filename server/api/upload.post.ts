import { defineEventHandler, readMultipartFormData } from "h3";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const MAX_SIZE = 1024 * 1000; // 1MB

  const files = await readMultipartFormData(event);

  if (!files || files.length === 0) {
    return { success: false, message: "No file uploaded" };
  }

  const file = files[0];

  if (file.data.length > MAX_SIZE) {
    return {
      success: false,
      message: "File is too large. Max size is 1MB.",
    };
  }
  const ext = file.filename!.split(".").pop()?.toLowerCase();
  if (!["yaml", "yml"].includes(ext ?? "")) {
    return {
      success: false,
      message: "Only .yaml and .yml files are allowed.",
    };
  }

  if (!file.filename || !file.data) {
    return { success: false, message: "Invalid file" };
  }

  const content = file.data.toString("utf-8").replace(/\u0000/g, "");

  try {
    const existing = await prisma.scriptFile.findUnique({
      where: { filename: file.filename },
    });

    if (existing) {
      return {
        success: false,
        message: `File with the same name already exists: ${file.filename}`,
      };
    }

    const script = await prisma.scriptFile.create({
      data: {
        filename: file.filename,
        content,
      },
    });

    return {
      success: true,
      message: "File uploaded successfully",
      filename: script.filename,
      uploadedDate: script.createdAt,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: `Error uploading file: ${err}`,
    };
  }
});
