"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageContainer } from "@/components/app/app-shell";
import { LoadingPage } from "@/components/app/states";
import { api, fetcher } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { FormField, copyText, PageHeader, Section, ToneBadge, UserAvatar } from "@/components/common";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { OtpField } from "@/components/otp-field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Me = {
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        username?: string;
        provider: "credentials" | "google";
        emailVerified: boolean;
        totpEnabled: boolean;
        backupCodesRemaining: number;
        createdAt: string;
        apiTokens: number;
    };
};

function RegenerateCodesDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
    const [code, setCode] = useState("");
    const [codes, setCodes] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) {
            setCode("");
            setCodes(null);
            setError(null);
        }
    }, [open]);

    async function submit(value: string) {
        setBusy(true);
        setError(null);
        try {
            const res = await api<{ backupCodes: string[] }>("/api/2fa/backup-codes", { body: { code: value } });
            setCodes(res.backupCodes);
            onDone();
        } catch (e: any) {
            setError(e.message);
            setCode("");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{codes ? "Your new backup codes" : "Generate new backup codes"}</DialogTitle>
                    <DialogDescription>{
                    codes
                        ? "Your old codes no longer work. Save these somewhere safe; they won't be shown again."
                        : "Enter a code from your authenticator app to confirm. Your current backup codes will stop working."
                }</DialogDescription>
                </DialogHeader>
                {codes ? (
                    <>
                        <ol className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-lg border border-border p-4 font-mono text-[13px] text-foreground">
                            {codes.map((c) => (
                                <li key={c}>{c}</li>
                            ))}
                        </ol>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => copyText(codes.join("\n"), "Backup codes copied")}>
                                Copy codes
                            </Button>
                            <Button variant="default" onClick={() => onOpenChange(false)}>
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="flex flex-col gap-3">
                        <OtpField value={code} onChange={setCode} onComplete={submit} disabled={busy} invalid={!!error} />
                        {error && <p className="text-[13px] text-destructive">{error}</p>}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function AccountPage() {
    const { data, mutate } = useSWR<Me>("/api/me", fetcher);
    const [name, setName] = useState("");
    const [savingName, setSavingName] = useState(false);
    const [regenOpen, setRegenOpen] = useState(false);
    const [signOutAllOpen, setSignOutAllOpen] = useState(false);
    const [pw, setPw] = useState({ current: "", next: "" });
    const [pwBusy, setPwBusy] = useState(false);
    const [pwError, setPwError] = useState<string | null>(null);

    useEffect(() => {
        if (data) setName(data.user.name);
    }, [data]);

    if (!data) return <LoadingPage />;
    const { user } = data;

    return (
        <PageContainer>
            <PageHeader title="Account and security" description={`Signed in as ${user.email}`} />

            <Section title="Profile" description="Your name is shown to people in your organizations." className="border-t-0 pt-0">
                <div className="mb-6 flex items-center gap-4">
                    <UserAvatar name={user.name} src={user.image} className="size-14 text-base" />
                    <p className="text-[13px] text-muted-foreground">
                        {user.image ? "Your photo comes from your Google account." : "Sign in with Google to use your Google profile photo."}
                    </p>
                </div>
                <form
                    className="flex max-w-md flex-col gap-4"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setSavingName(true);
                        try {
                            await api("/api/me", { method: "PATCH", body: { name } });
                            toast.success("Profile updated. It shows everywhere after your next sign-in.");
                            mutate();
                        } catch (err: any) {
                            toast.error(err.message);
                        } finally {
                            setSavingName(false);
                        }
                    }}
                >
                    <FormField label="Name" htmlFor="name">
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={64} required />
                    </FormField>
                    <FormField
                        label="Email"
                        htmlFor="email"
                        hint={
                            user.emailVerified
                                ? "Verified through Google. You can accept email invitations."
                                : "Not verified. Join organizations with invite links, or sign in with Google using this address to verify it."
                        }
                    >
                        <Input id="email" value={user.email} disabled />
                    </FormField>
                    <div>
                        <Button type="submit" variant="default" loading={savingName} disabled={name === user.name}>
                            Save profile
                        </Button>
                    </div>
                </form>
            </Section>

            <Section
                title="Two-factor authentication"
                description="Required on every sign-in. If you lose your phone, a backup code gets you in once."
            >
                <div id="two-factor" className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                        <ShieldCheck className="size-5 text-foreground" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Authenticator app</p>
                            <p className="text-[13px] text-muted-foreground">Enabled</p>
                        </div>
                        <ToneBadge tone="mint">On</ToneBadge>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">Backup codes</p>
                            <p className={user.backupCodesRemaining <= 3 ? "text-[13px] text-destructive" : "text-[13px] text-muted-foreground"}>
                                {user.backupCodesRemaining} of 10 remaining
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setRegenOpen(true)}>
                            Generate new codes
                        </Button>
                    </div>
                </div>
            </Section>

            {user.provider === "credentials" && (
                <Section title="Password" description="Changing your password signs you out everywhere, including here.">
                    <form
                        className="flex max-w-md flex-col gap-4"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setPwBusy(true);
                            setPwError(null);
                            try {
                                await api("/api/account/password", { body: { currentPassword: pw.current, newPassword: pw.next } });
                                toast.success("Password changed. Sign in again with your new password.");
                                await signOut({ callbackUrl: "/login" });
                            } catch (err: any) {
                                setPwError(err.message);
                                setPwBusy(false);
                            }
                        }}
                    >
                        <FormField label="Current password" htmlFor="pw-current">
                            <Input id="pw-current" type="password" autoComplete="current-password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                        </FormField>
                        <FormField label="New password" htmlFor="pw-next" error={pwError} hint="At least 10 characters.">
                            <Input id="pw-next" type="password" autoComplete="new-password" minLength={10} required value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
                        </FormField>
                        <div>
                            <Button type="submit" variant="default" loading={pwBusy}>
                                Change password
                            </Button>
                        </div>
                    </form>
                </Section>
            )}

            <Section title="API tokens" description="Personal tokens for the CLI, scripts and CI. They act with your access.">
                <div className="flex items-center gap-3">
                    <p className="flex-1 text-sm text-foreground">
                        {user.apiTokens} active token{user.apiTokens === 1 ? "" : "s"}
                    </p>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/account/tokens">Manage tokens</Link>
                    </Button>
                </div>
            </Section>

            <Section title="Sessions" description="Sign out on every device and browser, including this one.">
                <div className="flex flex-col items-start gap-2">
                    <Button variant="outline" onClick={() => setSignOutAllOpen(true)}>
                        Sign out everywhere
                    </Button>
                    <p className="text-xs text-muted-foreground">Account created {formatDate(user.createdAt)}.</p>
                </div>
            </Section>

            <RegenerateCodesDialog open={regenOpen} onOpenChange={setRegenOpen} onDone={() => mutate()} />
            <ConfirmDialog
                open={signOutAllOpen}
                onOpenChange={setSignOutAllOpen}
                title="Sign out everywhere?"
                description="Every session on every device ends now. API tokens keep working; revoke them separately."
                actionLabel="Sign out everywhere"
                onConfirm={async () => {
                    await api("/api/account/sessions", { method: "DELETE" });
                    await signOut({ callbackUrl: "/login" });
                }}
            />
        </PageContainer>
    );
}
