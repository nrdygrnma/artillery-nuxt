import prisma from "~~/lib/prisma";

export default defineEventHandler(async () => {
  const files = await prisma.scriptFile.findMany({
    orderBy: { createdAt: "desc" },
  });

  return { success: true, files };
});
