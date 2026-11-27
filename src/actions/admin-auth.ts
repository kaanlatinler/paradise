"use server";

import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
});

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string | null
): Promise<boolean> {
  if (!storedHash) return false;
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;

  const [salt, keyHex] = parts;
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, "hex");

  if (derivedBuf.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derivedBuf, keyBuf);
}

export async function loginAdminAction(rawInput: { email: string; password: string }) {
  const headerList = await headers();
  const clientIp =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "local";

  const limiter = checkRateLimit(`admin-login:${clientIp}`, 5, 15 * 60_000);
  if (!limiter.allowed) {
    return {
      success: false,
      error: `Çok fazla başarısız giriş denemesi. Lütfen ${limiter.retryAfterSeconds} saniye sonra tekrar dene.`,
    };
  }

  const parsed = loginSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Giriş bilgileri geçersiz.",
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });

  const isAuthorizedRole = user?.role === "ADMIN" || user?.role === "STAFF";
  const passwordOk = user ? verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !isAuthorizedRole || !passwordOk) {
    return {
      success: false,
      error: "E-posta veya şifre hatalı.",
    };
  }

  const maxAgeSeconds = 60 * 60 * 24 * 7;
  const token = signSessionToken(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    maxAgeSeconds
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return { success: true };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}