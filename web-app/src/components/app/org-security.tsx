"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ToneBadge } from "@/components/common";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { api, fetcher } from "@/lib/api-client";

type Security = { require2fa: boolean; membersWithout2fa: { name: string; email: string }[] | null };

/** The org's "require two-factor" switch. Owner only; everyone else sees the current setting. */
export function OrgSecurity({ slug, isOwner }: { slug: string; isOwner: boolean }) {
    const { data, mutate } = useSWR<Security>(`/api/orgs/${slug}/security`, fetcher);
    const [pending, setPending] = useState<boolean | null>(null);

    if (!data) return <Skeleton className="h-20 w-full max-w-2xl" />;
    const without = data.membersWithout2fa ?? [];

    async function apply(require2fa: boolean) {
        try {
            const res = await api<Security>(`/api/orgs/${slug}/security`, { method: "PATCH", body: { require2fa } });
            await mutate(res, { revalidate: false });
            toast.success(require2fa ? "Two-factor authentication is now required" : "Two-factor authentication is now optional");
        } catch (e: any) {
            toast.error(e.message);
            throw e;
        }
    }

    return (
        <div className="flex max-w-2xl flex-col gap-3">
            <div className="flex items-start gap-3 rounded-lg border p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                    <ShieldCheck className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <label htmlFor="require-2fa" className="flex items-center gap-2 text-sm font-medium text-foreground">
                        Require two-factor authentication
                        {data.require2fa ? <ToneBadge tone="mint">On</ToneBadge> : <ToneBadge tone="neutral">Off</ToneBadge>}
                    </label>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                        Members must use a <strong className="font-medium text-foreground">passkey or an authenticator app</strong> to open anything in
                        this organization. Turning it off never removes anyone&apos;s passkeys or apps; people who have them keep using them.
                    </p>
                    {without.length > 0 && (
                        <p className="mt-2 text-[13px] text-muted-foreground">
                            <strong className="font-medium text-foreground">
                                {without.length} member{without.length === 1 ? "" : "s"}
                            </strong>{" "}
                            {without.length === 1 ? "hasn't" : "haven't"} set up two-factor yet
                            {data.require2fa ? " and can't open the organization until they do" : ""}:{" "}
                            {without
                                .slice(0, 3)
                                .map((m) => m.name)
                                .join(", ")}
                            {without.length > 3 ? ` and ${without.length - 3} more` : ""}.{" "}
                            <Link href={`/o/${slug}/settings/members`} className="text-foreground underline underline-offset-4">
                                See members
                            </Link>
                        </p>
                    )}
                    {!isOwner && <p className="mt-2 text-[12.5px] text-muted-foreground">Only the owner can change this.</p>}
                </div>
                <Switch
                    id="require-2fa"
                    checked={data.require2fa}
                    disabled={!isOwner}
                    onCheckedChange={(v) => setPending(v)}
                />
            </div>

            <ConfirmDialog
                open={pending !== null}
                onOpenChange={(o) => !o && setPending(null)}
                danger={pending === false}
                title={pending ? "Require two-factor authentication?" : "Make two-factor optional?"}
                description={
                    pending ? (
                        without.length ? (
                            <>
                                <strong className="font-medium text-foreground">
                                    {without.length} member{without.length === 1 ? "" : "s"}
                                </strong>{" "}
                                without a passkey or authenticator app will be asked to add one before they can open anything here.
                            </>
                        ) : (
                            "Everyone in the organization already has two-factor set up, so nobody is interrupted."
                        )
                    ) : (
                        "Members without a passkey or authenticator app will be able to open the organization. Anyone who has one keeps using it."
                    )
                }
                actionLabel={pending ? "Require two-factor" : "Make optional"}
                onConfirm={() => apply(!!pending)}
            />
        </div>
    );
}
