import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

/**
 * AES-256-GCM at-rest encryption for secrets we must be able to read back
 * (e.g. an organization's own AI provider API key) — unlike ApiKey/invitation
 * tokens, which only ever need a one-way hash, a BYOK key must be sent to the
 * provider on every request, so it can't be hashed.
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const secret = process.env.AI_KEY_ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error(
      "AI_KEY_ENCRYPTION_SECRET n'est pas configuré — impossible de chiffrer/déchiffrer les clés IA des organisations.",
    );
  }
  // Derive a fixed 32-byte key regardless of the raw secret's length/encoding.
  return createHash("sha256").update(secret).digest();
}

/** Returns `iv:authTag:ciphertext`, each base64url, colon-separated. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64url"), authTag.toString("base64url"), ciphertext.toString("base64url")].join(":");
}

export function decryptSecret(encoded: string): string {
  const [ivPart, authTagPart, ciphertextPart] = encoded.split(":");
  if (!ivPart || !authTagPart || !ciphertextPart) {
    throw new Error("Format de secret chiffré invalide.");
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(authTagPart, "base64url"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextPart, "base64url")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** For display only, e.g. "sk-abcd••••••••wxyz" — never logs or returns the full key. */
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 8) return "••••••••";
  return `${plaintext.slice(0, 4)}••••••••${plaintext.slice(-4)}`;
}
