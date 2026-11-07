/**
 * Temporary share links: the only way to show variables without signing in.
 * They always expire, never later than MAX_SHARE_TTL_SECONDS after creation.
 */
export const SHARE_TTL_OPTIONS = [
    { seconds: 10 * 60, label: "10 minutes" },
    { seconds: 60 * 60, label: "1 hour" },
    { seconds: 24 * 60 * 60, label: "24 hours" },
] as const;

export const MAX_SHARE_TTL_SECONDS = 24 * 60 * 60;
