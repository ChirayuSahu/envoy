"use client";

import * as React from "react";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common";

/**
 * Confirmation for destructive actions (shadcn AlertDialog). When `confirmText` is set,
 * the user must type it exactly before the action enables.
 */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    actionLabel,
    cancelLabel = "Cancel",
    confirmText,
    onConfirm,
    danger = true,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: React.ReactNode;
    actionLabel: string;
    cancelLabel?: string;
    confirmText?: string;
    onConfirm: (typed: string) => Promise<unknown> | void;
    danger?: boolean;
}) {
    const [typed, setTyped] = React.useState("");
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        if (!open) setTyped("");
    }, [open]);

    const blocked = !!confirmText && typed !== confirmText;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <form
                    className="contents"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (blocked) return;
                        setBusy(true);
                        try {
                            await onConfirm(typed);
                            onOpenChange(false);
                        } finally {
                            setBusy(false);
                        }
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    {confirmText && (
                        <FormField label={`Type ${confirmText} to confirm`} htmlFor="confirm-input">
                            <Input
                                id="confirm-input"
                                autoFocus
                                autoComplete="off"
                                spellCheck={false}
                                className="font-mono"
                                value={typed}
                                onChange={(e) => setTyped(e.target.value)}
                            />
                        </FormField>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">{cancelLabel}</AlertDialogCancel>
                        <Button type="submit" variant={danger ? "destructive" : "default"} disabled={blocked} loading={busy}>
                            {actionLabel}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
