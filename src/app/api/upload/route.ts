import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB / dosya
const MAX_FILES_PER_REQUEST = 15;

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const rawFiles = formData.getAll("files");
    const files = rawFiles.filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return NextResponse.json({ error: "Yüklenecek en az bir görsel seçilmelidir." }, { status: 400 });
    }

    if (files.length > MAX_FILES_PER_REQUEST) {
      return NextResponse.json(
        { error: `Tek seferde en fazla ${MAX_FILES_PER_REQUEST} görsel yüklenebilir.` },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const uploaded: { url: string; fileName: string; size: number }[] = [];

    for (const file of files) {
      const ext = ALLOWED_MIME_TYPES.get(file.type);
      if (!ext) {
        return NextResponse.json(
          { error: `Desteklenmeyen dosya türü: ${file.type}. Sadece JPEG, PNG, WebP ve AVIF kabul edilir.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `"${file.name}" dosyası 8 MB sınırını aşıyor.` },
          { status: 400 }
        );
      }

      const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());

      await fs.writeFile(filePath, buffer);

      uploaded.push({
        url: `/uploads/${fileName}`,
        fileName,
        size: file.size,
      });
    }

    return NextResponse.json({ success: true, files: uploaded }, { status: 201 });
  } catch (err) {
    console.error("Görsel yükleme hatası:", err);
    return NextResponse.json({ error: "Görseller yüklenirken sunucu hatası oluştu." }, { status: 500 });
  }
}