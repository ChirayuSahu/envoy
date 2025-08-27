import CryptoJS from "crypto-js";

const secret = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || "fallback-secret";

export function encrypt(value: string): string {
  return CryptoJS.AES.encrypt(value, secret).toString();
}

export function decrypt(ciphertext: string): string {
  return CryptoJS.AES.decrypt(ciphertext, secret).toString(CryptoJS.enc.Utf8);
}
