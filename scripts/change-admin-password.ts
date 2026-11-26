/**
 * Admin / personel kullanıcısının şifresini güvenli şekilde değiştirir.
 *
 * Kullanım (proje kökünde):
 *   npx tsx scripts/change-admin-password.ts
 *
 * - Şifre terminalde gizli girilir (ekrana yazılmaz, komut geçmişine düşmez).
 * - Şifre, src/actions/admin-auth.ts içindeki verifyPassword ile uyumlu biçimde
 *   scrypt + rastgele salt ("salt:hash") olarak saklanır.
 * - DİKKAT: prisma/seed.ts her çalıştığında admin şifresini tekrar "Admin1234!" yapar.
 *   Seed'i yeniden çalıştırmayın ya da seed'in şifreyi ortam değişkeninden okumasını sağlayın.
 */
import "dotenv/config";
import crypto from "crypto";
import readline from "readline";
import { prisma } from "../src/lib/prisma";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function ask(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    // Yazılan karakterleri ekrana basma
    const r = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WritableStream; line: string };
    r._writeToOutput = (s: string) => {
      if (s === "\r\n" || s === "\n") r.output.write(s);
      // Satır yenilemelerinde (ör. silme tuşu) gerçek metni değil yıldızları yeniden çiz
      else if (s.includes(question)) r.output.write(`\r${question}${"*".repeat(r.line.length)}\x1b[K`);
      else r.output.write("*".repeat(s.length));
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    }),
  );
}

function checkStrength(pw: string): string | null {
  if (pw.length < 12) return "Şifre en az 12 karakter olmalı.";
  if (!/[a-zçğıöşü]/.test(pw) || !/[A-ZÇĞİÖŞÜ]/.test(pw)) return "Büyük ve küçük harf içermeli.";
  if (!/\d/.test(pw)) return "En az bir rakam içermeli.";
  if (!/[^A-Za-z0-9çğıöşüÇĞİÖŞÜ]/.test(pw)) return "En az bir özel karakter içermeli (ör. ! ? * -).";
  if (/admin1234/i.test(pw)) return "Eski varsayılan şifreye benzememeli.";
  return null;
}

async function main() {
  const email = (await ask("Admin e-posta adresi: ")).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });

  if (!user) {
    console.error(`"${email}" adresiyle kayıtlı kullanıcı bulunamadı.`);
    process.exitCode = 1;
    return;
  }
  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    console.error("Bu kullanıcı admin/personel değil; işlem iptal edildi.");
    process.exitCode = 1;
    return;
  }

  const pw = await ask("Yeni şifre: ", true);
  const problem = checkStrength(pw);
  if (problem) {
    console.error(`Şifre yeterince güçlü değil: ${problem}`);
    process.exitCode = 1;
    return;
  }

  const again = await ask("Yeni şifre (tekrar): ", true);
  if (pw !== again) {
    console.error("Şifreler eşleşmiyor; hiçbir şey değiştirilmedi.");
    process.exitCode = 1;
    return;
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(pw) } });
  console.log(`✔ ${email} için şifre güncellendi. Açık admin oturumları geçerliliğini korur; gerekirse AUTH_SECRET'i değiştirerek hepsini kapatabilirsiniz.`);
}

main()
  .catch((err) => {
    console.error("Şifre güncellenemedi:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
