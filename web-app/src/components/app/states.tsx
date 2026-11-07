"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, X } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageContainer } from "./app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function NotFoundState({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <PageContainer>
            <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                {children ?? "It may have been deleted, renamed, or you may not have access to it."}
            </p>
            <Button asChild variant="outline" className="mt-6">
                <Link href="/dashboard">Go to your organization</Link>
            </Button>
        </PageContainer>
    );
}

export function LoadingPage() {
    return (
        <PageContainer>
            <Skeleton className="mb-3 h-4 w-40" />
            <Skeleton className="mb-10 h-8 w-64" />
            <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-11 w-full" />
                ))}
            </div>
        </PageContainer>
    );
}

/** Shown after signing in with a backup code when few remain. */
export function LowBackupCodesBanner() {
    const [remaining, setRemaining] = useState<number | null>(null);
    useEffect(() => {
        const v = sessionStorage.getItem("envoy:lowBackupCodes");
        if (v !== null) setRemaining(Number(v));
    }, []);
    if (remaining === null) return null;
    return (
        <Alert className="mb-8">
            <ShieldAlert />
            <AlertTitle>
                You have {remaining} backup code{remaining === 1 ? "" : "s"} left
            </AlertTitle>
            <AlertDescription>
                <Link href="/account#two-factor" className="underline underline-offset-4">
                    Generate new codes
                </Link>{" "}
                so you don&apos;t get locked out.
            </AlertDescription>
            <AlertAction>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Dismiss"
                    onClick={() => {
                        sessionStorage.removeItem("envoy:lowBackupCodes");
                        setRemaining(null);
                    }}
                >
                    <X />
                </Button>
            </AlertAction>
        </Alert>
    );
}
