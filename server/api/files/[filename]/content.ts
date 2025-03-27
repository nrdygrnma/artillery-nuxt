import path from "path";
import fs from "fs/promises";
import { createError, defineEventHandler, getRouterParam, sendError } from "h3";

const scriptsDir = path.join(process.cwd(), "public", "uploads");

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, "filename");

  console.log("Requested filename:", filename);

  if (!filename || filename.includes("..") || filename.includes("/")) {
    throw createError({ statusCode: 400, message: "Invalid filename" });
  }

  const filePath = path.join(scriptsDir, filename);

  if (event.method === "GET") {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return { content };
    } catch (err) {
      return sendError(
        event,
        createError({ statusCode: 404, statusMessage: "File not found." }),
      );
    }
  }

  if (event.method === "PUT") {
    try {
      const body = await readBody<{ content: string }>(event);

      if (typeof body.content !== "string") {
        return sendError(
          event,
          createError({
            statusCode: 400,
            statusMessage: "Content must be a string.",
          }),
        );
      }

      await fs.writeFile(filePath, body.content, "utf-8");

      return { success: true, message: "File updated successfully." };
    } catch (err) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: "Failed to write file.",
        }),
      );
    }
  }

  return sendError(
    event,
    createError({ statusCode: 405, statusMessage: "Method Not Allowed." }),
  );
});
