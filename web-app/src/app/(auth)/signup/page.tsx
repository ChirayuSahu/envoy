"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AuthHeading, FormError, GoogleButton, OrDivider, safeCallback } from "@/components/auth/auth-bits";
import { api, ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { FormField } from "@/components/common";
import { Input } from "@/components/ui/input";

function passwordStrength(pw: string) {
    if (!pw) return { score: 0, label: "" };
    let score = 0;
    if (pw.length >= 10) score++;
    if (pw.length >= 14) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length < 10) return { score: 1, label: "Too short: use at least 10 characters" };
    return { score, label: ["Weak", "Weak", "Fair", "Good", "Strong"][score] };
}

function SignupForm() {
    const params = useSearchParams();
    const callbackUrl = safeCallback(params.get("callbackUrl"));
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [usernameTouched, setUsernameTouched] = useState(false);
    const strength = useMemo(() => passwordStrength(password), [password]);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const body = {
            name: String(form.get("name") ?? ""),
            username: String(form.get("username") ?? ""),
            email: String(form.get("email") ?? ""),
            password,
        };
        setBusy(true);
        setError(null);
        try {
            await api("/api/register", { body });
            const res = await signIn("credentials", { username: body.email, password, redirect: false });
            if (!res || res.error) throw new Error("Account created, but sign-in failed. Try signing in.");
            window.location.assign(`/2fa/setup?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        } catch (err) {
            setError(err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong.");
            setBusy(false);
        }
    }

    return (
        <>
            <AuthHeading title="Create your account">
                Every Envoy account uses two-factor authentication. You&apos;ll connect an authenticator app next.
            </AuthHeading>

            <FormError message={error} />

            <GoogleButton label="Sign up with Google" callbackUrl={callbackUrl} />
            <OrDivider />

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <FormField label="Full name" htmlFor="name">
                    <Input
                        id="name"
                        name="name"
                        autoComplete="name"
                        required
                        autoFocus
                        onChange={(e) => {
                            if (!usernameTouched) {
                                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 24));
                            }
                        }}
                    />
                </FormField>
                <FormField label="Username" htmlFor="username" hint="Letters, numbers, dots, dashes and underscores.">
                    <Input
                        id="username"
                        name="username"
                        autoComplete="username"
                        required
                        minLength={3}
                        maxLength={32}
                        pattern="[a-zA-Z0-9_.\-]{3,32}"
                        value={username}
                        onChange={(e) => {
                            setUsernameTouched(true);
                            setUsername(e.target.value);
                        }}
                    />
                </FormField>
                <FormField label="Work email" htmlFor="email">
                    <Input id="email" name="email" type="email" autoComplete="email" required />
                </FormField>
                <FormField label="Password" htmlFor="password">
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={10}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {password && (
                        <div className="mt-1 flex items-center gap-3" aria-live="polite">
                            <div className="flex flex-1 gap-1">
                                {[1, 2, 3, 4].map((i) => (
                                    <span
                                        key={i}
                                        className={cn(
                                            "h-1 flex-1 rounded-full",
                                            i <= strength.score ? (strength.score <= 1 ? "bg-destructive" : "bg-primary") : "bg-border"
                                        )}
                                    />
                                ))}
                            </div>
                            <span className="shrink-0 text-xs text-muted-foreground">{strength.label}</span>
                        </div>
                    )}
                </FormField>
                <Button type="submit" variant="default" size="lg" loading={busy} className="mt-2">
                    Create account
                </Button>
            </form>

            <p className="mt-6 text-[13px] leading-relaxed text-muted-foreground">
                Accounts created with email and password can join organizations through invite links. To accept
                email invites, sign up with Google so we know the address is yours.
            </p>

            <p className="mt-6 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-foreground">
                    Sign in
                </Link>
            </p>
        </>
    );
}

export default function SignupPage() {
    return (
        <Suspense>
            <SignupForm />
        </Suspense>
    );
}
