import { defineEventHandler, getRouterParam } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const filename = decodeURIComponent(getRouterParam(event, "filename") ?? "");

  if (!filename) {
    return { success: false, message: "Filename is required" };
  }

  try {
    await prisma.scriptFile.delete({
      where: { filename },
    });

    return {
      success: true,
      message: `File ${filename} deleted successfully`,
    };
  } catch (err) {
    return {
      success: false,
      message: "File not found or could not be deleted",
    };
  }
});
