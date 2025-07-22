import { RateLimiterMemory } from "rate-limiter-flexible";

export function getUserIP(req: any): string {
  const headers = req?.headers ?? {};

  const xForwardedFor = headers["x-forwarded-for"] || headers["X-Forwarded-For"];
  const ip = Array.isArray(xForwardedFor)
    ? xForwardedFor[0]
    : xForwardedFor?.split(",")[0]?.trim();

  return ip || "127.0.0.1";
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