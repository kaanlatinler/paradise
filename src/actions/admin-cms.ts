"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

const cmsItemSchema = z.object({
  key: z.string().trim().min(1, "Anahtar (key) boş olamaz."),
  value: z.string(),
  group: z.string().trim().default("general"),
});

const updateCmsBatchSchema = z.array(cmsItemSchema).min(1, "Güncellenecek içerik bulunamadı.");

export async function updateSiteContentsAction(rawItems: unknown) {
  await requireAdminSession();

  const parsed = updateCmsBatchSchema.safeParse(rawItems);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "CMS verileri geçersiz.",
    };
  }

  try {
    await prisma.$transaction(
      parsed.data.map((item) =>
        prisma.siteContent.upsert({
          where: { key: item.key },
          update: { value: item.value, group: item.group },
          create: { key: item.key, value: item.value, group: item.group },
        })
      )
    );

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/admin/content");

    return { success: true };
  } catch {
    return { success: false, error: "Site içerikleri güncellenirken hata oluştu." };
  }
}

export async function getSiteContentMap() {
  const rows = await prisma.siteContent.findMany();
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
}