"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthHeading, FormError, safeCallback } from "@/components/auth/auth-bits";
import { OtpField } from "@/components/otp-field";
import { api } from "@/lib/api-client";

const linkButton = "h-auto p-0 text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground";

function VerifyFlow() {
    const params = useSearchParams();
    const callbackUrl = safeCallback(params.get("callbackUrl"));
    const { update } = useSession();
    const [mode, setMode] = useState<"totp" | "backup">("totp");
    const [code, setCode] = useState("");
    const [backup, setBackup] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function verify(body: { code: string } | { backupCode: string }) {
        if ("code" in body && body.code.length !== 6) {
            setError("Enter all 6 digits.");
            return;
        }
        if ("backupCode" in body && body.backupCode.trim().length < 10) {
            setError("Enter a full backup code.");
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const res = await api<{ mfaTicket: string; backupCodesRemaining?: number }>("/api/2fa/verify", { body });
            const next = await update({ mfaTicket: res.mfaTicket });
            if (!next?.user?.mfaVerified) throw new Error("Verification expired. Enter a new code.");
            if (typeof res.backupCodesRemaining === "number" && res.backupCodesRemaining <= 3) {
                sessionStorage.setItem("envoy:lowBackupCodes", String(res.backupCodesRemaining));
            }
            window.location.assign(callbackUrl);
        } catch (e: any) {
            setError(e.message);
            setCode("");
            setBusy(false);
        }
    }

    return (
        <>
            <AuthHeading title="Two-factor authentication">
                {mode === "totp" ? "Enter the 6-digit code from your authenticator app." : "Enter one of your backup codes."}
            </AuthHeading>

            <FormError message={error} />

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    verify(mode === "totp" ? { code } : { backupCode: backup });
                }}
                className="flex flex-col gap-4"
            >
                {mode === "totp" ? (
                    <OtpField
                        value={code}
                        onChange={(v) => {
                            setCode(v);
                            if (error) setError(null);
                        }}
                        onComplete={(v) => verify({ code: v })}
                        disabled={busy}
                        invalid={!!error}
                    />
                ) : (
                    <Input
                        autoFocus
                        aria-label="Backup code"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="xxxxx-xxxxx"
                        className="h-12 font-mono text-base"
                        value={backup}
                        onChange={(e) => setBackup(e.target.value)}
                    />
                )}
                <Button type="submit" size="lg" loading={busy} className="w-full">
                    Verify
                </Button>
            </form>

            <div className="mt-8 flex gap-5">
                <Button
                    variant="link"
                    className={linkButton}
                    onClick={() => {
                        setMode(mode === "totp" ? "backup" : "totp");
                        setError(null);
                    }}
                >
                    {mode === "totp" ? "Use a backup code" : "Use authenticator app"}
                </Button>
                <Button variant="link" className={linkButton} onClick={() => signOut({ callbackUrl: "/login" })}>
                    Sign out
                </Button>
            </div>
        </>
    );
}

export default function TwoFactorVerifyPage() {
    return (
        <Suspense>
            <VerifyFlow />
        </Suspense>
    );
}
