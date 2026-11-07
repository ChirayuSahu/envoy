import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      mfaVerified: boolean;
      totpEnabled: boolean;
      revoked: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    name?: string;
    email?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    /** user.sessionVersion at sign-in; a mismatch means the session was revoked. */
    sv?: number;
    totpEnabled?: boolean;
    mfaVerified?: boolean;
    revoked?: boolean;
  }
}
