"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudAlert, RotateCcw, SearchX, ShieldAlert, X } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageContainer } from "./app-shell";
import { Skeleton } from "@/components/ui/skeleton";

function StateBlock({
    icon: Icon,
    tone,
    title,
    children,
    actions,
}: {
    icon: React.ElementType;
    tone: string;
    title: string;
    children: React.ReactNode;
    actions: React.ReactNode;
}) {
    return (
        <PageContainer>
            <div className="flex max-w-lg flex-col items-start gap-4 pt-6">
                <span className={`flex size-11 items-center justify-center rounded-lg ${tone}`}>
                    <Icon className="size-5" />
                </span>
                <div>
                    <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
                    <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">{actions}</div>
            </div>
        </PageContainer>
    );
}

/** Something that doesn't exist, or that you can't see (the API returns 404 for both). */
export function NotFoundState({ title, children }: { title: string; children?: React.ReactNode }) {
    return (
        <StateBlock
            icon={SearchX}
            tone="bg-pastel-sky text-pastel-sky-fg"
            title={title}
            actions={
                <Button asChild variant="outline">
                    <Link href="/dashboard">Go to your organization</Link>
                </Button>
            }
        >
            {children ?? (
                <>
                    It may have been <strong className="font-semibold text-foreground">deleted or renamed</strong>, or you may not have access to it.
                </>
            )}
        </StateBlock>
    );
}

/** A load or render failure that may be temporary (server error, lost connection). */
export function ErrorState({
    title = "Couldn't load this page",
    children,
    onRetry,
    reference,
}: {
    title?: string;
    children?: React.ReactNode;
    onRetry?: () => void;
    reference?: string;
}) {
    return (
        <StateBlock
            icon={CloudAlert}
            tone="bg-pastel-rose text-pastel-rose-fg"
            title={title}
            actions={
                <>
                    {onRetry && (
                        <Button onClick={onRetry}>
                            <RotateCcw /> Try again
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href="/dashboard">Go to your organization</Link>
                    </Button>
                </>
            }
        >
            {children ?? (
                <>
                    Something went wrong on our side or with your connection. <strong className="font-semibold text-foreground">Nothing was changed.</strong>
                </>
            )}
            {reference && (
                <p className="mt-3 text-xs">
                    Reference <span className="select-all font-mono text-foreground/80">{reference}</span>
                </p>
            )}
        </StateBlock>
    );
}

/** Picks the right state for a failed load: "not found" for 404s, a retryable error for anything else. */
export function LoadError({ error, notFoundTitle, onRetry }: { error: unknown; notFoundTitle: string; onRetry?: () => void }) {
    const status = (error as { status?: number } | null)?.status;
    if (status === 404 || status === 403) return <NotFoundState title={notFoundTitle} />;
    return <ErrorState onRetry={onRetry} />;
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
