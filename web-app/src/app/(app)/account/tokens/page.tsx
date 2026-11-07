"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageContainer } from "@/components/app/app-shell";
import { api } from "@/lib/api-client";
import { usePaginated } from "@/lib/use-paginated";
import { formatDate, timeAgo } from "@/lib/format";
import { FormField, CopyButton, EmptyState, LoadMore, PageHeader } from "@/components/common";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Token = { id: string; name: string; prefix: string; createdAt: string; lastUsedAt: string | null; expiresAt: string | null };

function CreateTokenDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
    const [name, setName] = useState("");
    const [days, setDays] = useState("90");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const close = (o: boolean) => {
        onOpenChange(o);
        if (!o) {
            setName("");
            setToken(null);
            setError(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{token ? "Copy your token" : "Create API token"}</DialogTitle>
                    <DialogDescription>{
                    token
                        ? "This is the only time it's shown. Store it in your password manager or CI secrets."
                        : "The token can read every project you can read. If you lose access to a team, so does the token."
                }</DialogDescription>
                </DialogHeader>
                {token ? (
                    <>
                        <div className="flex items-center gap-1 rounded-md border border-foreground bg-muted/40 py-1 pl-3 pr-1">
                            <code className="flex-1 break-all font-mono text-[12.5px] text-foreground">{token}</code>
                            <CopyButton value={token} label="Token" />
                        </div>
                        <p className="mt-3 text-[13px] text-muted-foreground">
                            Try it: <code className="font-mono text-[12px] text-foreground">export ENVOY_TOKEN=…</code> then use the
                            command from a project&apos;s &ldquo;Use from CLI&rdquo; button.
                        </p>
                        <DialogFooter>
                            <Button variant="default" onClick={() => close(false)}>
                                Done
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setBusy(true);
                            setError(null);
                            try {
                                const res = await api<{ token: string }>("/api/tokens", {
                                    body: { name, expiresInDays: days === "never" ? null : Number(days) },
                                });
                                setToken(res.token);
                                onCreated();
                            } catch (err: any) {
                                setError(err.message);
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        <FormField label="Name" htmlFor="token-name" hint="Where it's used, so you know what breaks if you revoke it." error={error}>
                            <Input id="token-name" autoFocus required maxLength={64} placeholder="GitHub Actions deploy" value={name} onChange={(e) => setName(e.target.value)} />
                        </FormField>
                        <FormField label="Expires" htmlFor="token-exp">
                            <Select value={days} onValueChange={setDays}>
                                <SelectTrigger id="token-exp" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">In 7 days</SelectItem>
                                    <SelectItem value="30">In 30 days</SelectItem>
                                    <SelectItem value="90">In 90 days</SelectItem>
                                    <SelectItem value="365">In 1 year</SelectItem>
                                    <SelectItem value="never">Never</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => close(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="default" loading={busy} disabled={!name.trim()}>
                                Create token
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default function TokensPage() {
    const list = usePaginated<Token>("/api/tokens", "tokens");
    const data = list.isLoading ? undefined : { tokens: list.items };
    const mutate = list.mutate;
    const [createOpen, setCreateOpen] = useState(false);
    const [revoking, setRevoking] = useState<Token | null>(null);

    return (
        <PageContainer>
            <PageHeader
                title="API tokens"
                description="Fetch variables from the CLI, scripts and CI with a personal access token."
                actions={
                    <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
                        <Plus /> New token
                    </Button>
                }
            />

            {!data ? (
                <Skeleton className="h-28 w-full" />
            ) : data.tokens.length === 0 ? (
                <EmptyState
                    icon={<KeyRound />}
                    title="No tokens yet"
                    action={
                        <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
                            <Plus /> New token
                        </Button>
                    }
                >
                    Create one per machine or pipeline, so you can revoke it without affecting anything else.
                </EmptyState>
            ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                    {data.tokens.map((t) => {
                        const expired = t.expiresAt && new Date(t.expiresAt).getTime() < Date.now();
                        return (
                            <li key={t.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                                <KeyRound className="size-4 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-foreground">{t.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        <code className="font-mono">{t.prefix}…</code>, created {timeAgo(t.createdAt)}, last used{" "}
                                        {timeAgo(t.lastUsedAt)}
                                    </p>
                                </div>
                                <span className={expired ? "text-xs text-destructive" : "text-xs text-muted-foreground"} title={t.expiresAt ? formatDate(t.expiresAt) : undefined}>
                                    {t.expiresAt ? (expired ? "Expired" : `Expires ${timeAgo(t.expiresAt)}`) : "No expiry"}
                                </span>
                                <Button variant="destructive" size="sm" onClick={() => setRevoking(t)}>
                                    Revoke
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            )}
            <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />

            <CreateTokenDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => mutate()} />
            <ConfirmDialog
                open={!!revoking}
                onOpenChange={(o) => !o && setRevoking(null)}
                title={`Revoke ${revoking?.name}?`}
                description="Anything using this token stops working immediately."
                actionLabel="Revoke token"
                onConfirm={async () => {
                    try {
                        await api(`/api/tokens/${revoking!.id}`, { method: "DELETE" });
                        toast.success("Token revoked");
                        mutate();
                    } catch (e: any) {
                        toast.error(e.message);
                    }
                }}
            />
        </PageContainer>
    );
}
