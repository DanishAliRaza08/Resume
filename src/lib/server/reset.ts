import { prisma } from "./db";
import { newToken, sha256 } from "./passwords";

/** Issue a one-hour, single-use reset token (only the hash is stored). Not a server action. */
export async function issueResetToken(userId: string): Promise<string> {
  const token = newToken();
  await prisma.passwordResetToken.create({ data: { id: sha256(token), userId, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  return token;
}
