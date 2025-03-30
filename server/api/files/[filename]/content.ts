import { defineEventHandler, getRouterParam, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const filename = decodeURIComponent(getRouterParam(event, "filename") ?? "");
  if (!filename) {
    throw createError({ statusCode: 400, message: "Filename is required" });
  }

  if (event.method === "GET") {
    const file = await prisma.scriptFile.findUnique({
      where: { filename },
    });

    if (!file) {
      throw createError({ statusCode: 404, message: "File not found" });
    }

    return { content: file.content };
  }

  if (event.method === "PUT") {
    const body = await readBody<{ content: string }>(event);

    const updated = await prisma.scriptFile.update({
      where: { filename },
      data: { content: body.content },
    });

    return { success: true, message: "File updated", updated };
  }

  throw createError({ statusCode: 405, message: "Method not allowed" });
});
