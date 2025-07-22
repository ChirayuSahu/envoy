import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

export function getUserIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  console.log("User IP:", ip);
  return ip;
}


export const generalLimiter = new RateLimiterMemory({
  points: 10,
  duration: 1,
});

export const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
  blockDuration: 60 * 5,
});