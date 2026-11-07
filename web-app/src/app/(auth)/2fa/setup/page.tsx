"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton, copyText } from "@/components/common";
import { OtpField } from "@/components/otp-field";
import { AuthHeading, FormError, safeCallback } from "@/components/auth/auth-bits";
import { api } from "@/lib/api-client";

type Setup = { secret: string; uri: string; qr: string };

function downloadCodes(codes: string[], email?: string | null) {
    const blob = new Blob(
        [`Envoy backup codes${email ? ` for ${email}` : ""}\nEach code works once.\n\n${codes.join("\n")}\n`],
        { type: "text/plain" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "envoy-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(a.href);
}

const linkButton = "h-auto p-0 text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground";

function SetupFlow() {
    const params = useSearchParams();
    const callbackUrl = safeCallback(params.get("callbackUrl"));
    const { data: session, update } = useSession();
    const [setup, setSetup] = useState<Setup | null>(null);
    const [showKey, setShowKey] = useState(false);
    const [code, setCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [saved, setSaved] = useState(false);
    const started = useRef(false);
    const email = session?.user?.email;

    useEffect(() => {
        if (started.current) return;
        started.current = true;
        api<Setup>("/api/2fa/setup", { method: "POST" })
            .then(setSetup)
            .catch((e) => setError(e.message));
    }, []);

    async function enable(value: string) {
        if (value.length !== 6) {
            setError("Enter all 6 digits.");
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const res = await api<{ backupCodes: string[]; mfaTicket: string }>("/api/2fa/enable", { body: { code: value } });
            await update({ mfaTicket: res.mfaTicket });
            setBackupCodes(res.backupCodes);
        } catch (e: any) {
            setError(e.message);
            setCode("");
        } finally {
            setBusy(false);
        }
    }

    if (backupCodes) {
        return (
            <>
                <AuthHeading title="Save your backup codes">Each code signs you in once if you lose your phone.</AuthHeading>
                <ol className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-sm">
                    {backupCodes.map((c) => (
                        <li key={c}>{c}</li>
                    ))}
                </ol>
                <div className="mt-4 flex gap-4">
                    <Button variant="link" className={linkButton} onClick={() => copyText(backupCodes.join("\n"), "Backup codes copied")}>
                        Copy
                    </Button>
                    <Button variant="link" className={linkButton} onClick={() => downloadCodes(backupCodes, email)}>
                        Download
                    </Button>
                </div>
                <div className="mt-8 flex items-center gap-2.5">
                    <Checkbox id="saved-codes" checked={saved} onCheckedChange={(v) => setSaved(v === true)} />
                    <Label htmlFor="saved-codes" className="font-normal">
                        I&apos;ve saved them
                    </Label>
                </div>
                <Button size="lg" className="mt-4 w-full" disabled={!saved} onClick={() => window.location.assign(callbackUrl)}>
                    Continue
                </Button>
            </>
        );
    }

    return (
        <>
            <AuthHeading title="Set up two-factor authentication">
                Scan the code with your authenticator app, then enter the 6-digit code it shows.
            </AuthHeading>

            <FormError message={error} />

            <div className="size-40 rounded-lg bg-white p-2">
                {setup ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={setup.qr} alt="QR code for your authenticator app" width={144} height={144} className="size-full" />
                ) : (
                    <Skeleton className="size-full bg-neutral-200" />
                )}
            </div>

            {setup &&
                (showKey ? (
                    <div className="mt-3 flex items-center gap-1">
                        <code className="font-mono text-[13px] tracking-wide text-muted-foreground">{setup.secret.match(/.{1,4}/g)?.join(" ")}</code>
                        <CopyButton value={setup.secret} label="Setup key" />
                    </div>
                ) : (
                    <Button variant="link" className={`${linkButton} mt-3`} onClick={() => setShowKey(true)}>
                        Can&apos;t scan it?
                    </Button>
                ))}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    enable(code);
                }}
                className="mt-8 flex flex-col gap-4"
            >
                <OtpField
                    value={code}
                    onChange={(v) => {
                        setCode(v);
                        if (error) setError(null);
                    }}
                    onComplete={enable}
                    disabled={busy || !setup}
                    invalid={!!error}
                />
                <Button type="submit" size="lg" loading={busy} className="w-full">
                    Verify
                </Button>
            </form>

            <Button variant="link" className={`${linkButton} mt-8`} onClick={() => signOut({ callbackUrl: "/login" })}>
                Use a different account
            </Button>
        </>
    );
}

export default function TwoFactorSetupPage() {
    return (
        <Suspense>
            <SetupFlow />
        </Suspense>
    );
}
