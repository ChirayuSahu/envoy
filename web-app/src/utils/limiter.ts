import { RateLimiterMemory } from "rate-limiter-flexible";
import { headers } from "next/headers";

export async function getUserIP() {
    const headersList = await headers();

    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || '127.0.0.1';
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