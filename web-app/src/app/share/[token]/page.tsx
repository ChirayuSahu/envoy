"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Copy, Download, Eye, EyeOff, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton, EmptyState, PageHeader, copyText } from "@/components/common";
import { fetcher } from "@/lib/api-client";
import { stringifyDotenv } from "@/lib/dotenv";
import { formatDate, timeAgo } from "@/lib/format";

type Share = { expiresAt: string; vars: { key: string; value: string }[] };

export default function SharedVariablesPage() {
    const { token } = useParams<{ token: string }>();
    const { data, error } = useSWR<Share>(`/api/share/${token}`, fetcher, { revalidateOnFocus: false });
    const [reveal, setReveal] = useState(false);

    if (error) {
        return (
            <EmptyState
                icon={<Timer />}
                title="This link has expired"
                action={
                    <Button asChild variant="outline" size="sm">
                        <Link href="/share">Create a new link</Link>
                    </Button>
                }
            >
                Shared links delete themselves after their time is up. Ask the sender for a new one.
            </EmptyState>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col gap-2">
                <Skeleton className="mb-6 h-8 w-64" />
                {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                ))}
            </div>
        );
    }

    const dotenv = stringifyDotenv(data.vars);

    return (
        <>
            <PageHeader
                title="Shared variables"
                description={
                    <>
                        Someone shared {data.vars.length} variable{data.vars.length === 1 ? "" : "s"} with you.{" "}
                        <span title={formatDate(data.expiresAt)}>This link expires {timeAgo(data.expiresAt)}.</span>
                    </>
                }
                actions={
                    <ButtonGroup>
                        <Button variant="outline" size="sm" onClick={() => setReveal((r) => !r)}>
                            {reveal ? <EyeOff /> : <Eye />} {reveal ? "Hide" : "Reveal"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => copyText(dotenv, "Copied as .env")}>
                            <Copy /> Copy
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const a = document.createElement("a");
                                a.href = URL.createObjectURL(new Blob([dotenv], { type: "text/plain" }));
                                a.download = ".env";
                                a.click();
                                URL.revokeObjectURL(a.href);
                            }}
                        >
                            <Download /> Download
                        </Button>
                    </ButtonGroup>
                }
            />
            <ol className="divide-y overflow-hidden rounded-lg border font-mono text-[13px]">
                {data.vars.map((v, i) => (
                    <li key={v.key} className="group flex items-center">
                        <span aria-hidden className="w-10 shrink-0 select-none border-r bg-muted/40 pr-2.5 text-right text-[11.5px] leading-9 text-muted-foreground/70">
                            {i + 1}
                        </span>
                        <span className="w-[38%] shrink-0 truncate px-3 font-medium leading-9">{v.key}</span>
                        <span className={reveal ? "min-w-0 flex-1 truncate leading-9" : "min-w-0 flex-1 select-none leading-9 text-muted-foreground"}>
                            {reveal ? v.value : "••••••••••••"}
                        </span>
                        <CopyButton value={v.value} label={v.key} className="mr-1" />
                    </li>
                ))}
            </ol>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-muted-foreground">
                <Badge variant="outline">Tip</Badge>
                Copy these into your own .env file. The link stops working when it expires.
            </p>
        </>
    );
}
