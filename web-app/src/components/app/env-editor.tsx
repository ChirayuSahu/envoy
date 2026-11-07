"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ClipboardPaste, Copy, Download, Eye, EyeOff, LockKeyhole, LockOpen, Plus, RotateCcw, Trash2, TriangleAlert } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState, SearchInput, copyText } from "@/components/common";
import { OtpField } from "@/components/otp-field";
import { ApiError, api } from "@/lib/api-client";
import { parseDotenv, stringifyDotenv, type EnvVar } from "@/lib/dotenv";
import { cn } from "@/lib/utils";

const KEY_RE = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
const MASK = "••••••••••••";
const FILTER_ID = "env-filter";

/** Borderless cell inputs: the row reads like a line in a .env file until you hover or focus it. */
/** Spreadsheet-style cell: no border, fill or ring. The row highlights while a cell in it has focus. */
const cellInput =
    "h-10 rounded-none border-0 bg-transparent px-3 font-mono text-[13px] hover:bg-transparent focus-visible:border-0 focus-visible:bg-transparent focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent dark:hover:bg-transparent dark:focus-visible:bg-transparent";

/** Width of the per-row actions (three icon buttons), shared by the header so columns line up. */
const ACTIONS_W = "w-[6.75rem]";
/** Key column width, shared by the header and the rows. */
const KEY_COL = "sm:w-[34%] sm:max-w-[360px] sm:shrink-0";

/** A stored value the server hasn't sent (values are locked): `null`. */
type StoredVar = { key: string; value: string | null };
/** `origKey` is the key the row was loaded with, so a hidden value can be kept through a rename. */
type Row = { id: string; key: string; value: string | null; origKey: string | null };

let rowSeq = 0;
const toRows = (vars: StoredVar[]): Row[] => vars.map((v) => ({ id: `r${++rowSeq}`, key: v.key, value: v.value, origKey: v.key }));
/** Only rows whose values are known (for copy, download and the conflict fallback). */
const knownVars = (rows: Row[]): EnvVar[] =>
    rows.filter((r) => r.key.trim() && r.value !== null).map((r) => ({ key: r.key.trim(), value: r.value as string }));

function diffCount(baseline: StoredVar[], rows: Row[]) {
    const before = new Map(baseline.map((v) => [v.key, v.value]));
    const kept = new Set<string>();
    let n = 0;
    for (const r of rows) {
        const k = r.key.trim();
        if (!k) {
            if (r.value) n++; // a value without a key yet is a pending change
            continue;
        }
        if (r.origKey !== null && before.has(r.origKey)) {
            kept.add(r.origKey);
            const renamed = k !== r.origKey;
            const edited = r.value !== null && r.value !== before.get(r.origKey);
            if (renamed || edited) n++;
        } else n++; // new row
    }
    for (const k of before.keys()) if (!kept.has(k)) n++; // removed
    return n;
}

function IconAction({
    label,
    onClick,
    children,
    danger,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
    danger?: boolean;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={label}
                    onClick={onClick}
                    className={cn("text-muted-foreground", danger && "hover:bg-destructive/10 hover:text-destructive")}
                >
                    {children}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

/**
 * Asks for a fresh authenticator code before secret values are sent to the browser. The unlock lives on
 * the server (10 minutes, per account); nothing is kept in the browser.
 */
function UnlockDialog({
    open,
    onOpenChange,
    onUnlocked,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUnlocked: () => Promise<unknown>;
}) {
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setCode("");
            setError(null);
        }
    }, [open]);

    const submit = async (value = code) => {
        if (value.length !== 6 || busy) return;
        setBusy(true);
        setError(null);
        try {
            await api("/api/2fa/reveal", { method: "POST", body: { code: value } });
            await onUnlocked();
            onOpenChange(false);
        } catch (e) {
            setError(e instanceof ApiError ? e.message : "Couldn't check the code. Try again.");
            setCode("");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-muted">
                        <LockKeyhole className="size-4" />
                    </div>
                    <DialogTitle>Unlock secret values</DialogTitle>
                    <DialogDescription>
                        Enter the code from your <strong className="font-medium text-foreground">authenticator app</strong>. Values stay unlocked for{" "}
                        <strong className="font-medium text-foreground">10 minutes</strong>.
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        submit();
                    }}
                    className="flex flex-col gap-3"
                >
                    <OtpField value={code} onChange={setCode} onComplete={submit} disabled={busy} invalid={!!error} />
                    {error && (
                        <p role="alert" className="text-[13px] text-destructive">
                            {error}
                        </p>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={busy} disabled={code.length !== 6}>
                            Unlock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PasteDialog({
    open,
    onOpenChange,
    existingKeys,
    onApply,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    existingKeys: Set<string>;
    onApply: (vars: EnvVar[]) => void;
}) {
    const [text, setText] = useState("");
    useEffect(() => {
        if (!open) return;
        setText("");
        navigator.clipboard
            ?.readText()
            .then((t) => {
                if (t && /^\s*(export\s+)?[A-Za-z_][A-Za-z0-9_.-]*\s*=/m.test(t)) setText(t);
            })
            .catch(() => {});
    }, [open]);

    const parsed = useMemo(() => parseDotenv(text), [text]);
    const updates = parsed.filter((v) => existingKeys.has(v.key)).length;
    const invalid = parsed.filter((v) => !KEY_RE.test(v.key)).length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Import from .env</DialogTitle>
                    <DialogDescription>
                        Paste the contents of a .env file. Existing keys are overwritten. Nothing is saved until you click Save.
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    autoFocus
                    rows={10}
                    spellCheck={false}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={"DATABASE_URL=postgres://…\nREDIS_URL=redis://…"}
                    className="max-h-80 font-mono text-[12.5px]"
                />
                <p className="text-[13px] text-muted-foreground" aria-live="polite">
                    {parsed.length
                        ? `${parsed.length - updates} new, ${updates} updated${invalid ? `, ${invalid} with invalid names` : ""}.`
                        : "No variables detected yet."}
                </p>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!parsed.length}
                        onClick={() => {
                            onApply(parsed);
                            onOpenChange(false);
                        }}
                    >
                        Import {parsed.length || ""} variable{parsed.length === 1 ? "" : "s"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ValueCell({
    row,
    editable,
    revealed,
    onChange,
    onUnlock,
    invalid,
}: {
    row: Row;
    editable: boolean;
    revealed: boolean;
    onChange: (value: string) => void;
    onUnlock: () => void;
    invalid?: boolean;
}) {
    const [focused, setFocused] = useState(false);

    // The server hasn't sent this value: it's locked until the user confirms an authenticator code.
    if (row.value === null) {
        return (
            <button
                type="button"
                onClick={onUnlock}
                title="Confirm your authenticator code to see or edit this value"
                aria-label={`Unlock to see ${row.key || "this value"}`}
                className="min-w-0 flex-1 truncate px-3 text-left font-mono text-[13px] leading-10 text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
            >
                {MASK}
            </button>
        );
    }

    const value = row.value;
    const show = revealed || focused;
    const multiline = value.includes("\n");

    if (!editable) {
        return (
            <div
                className={cn(
                    "min-w-0 flex-1 truncate px-3 font-mono text-[13px] leading-10",
                    show ? "text-foreground" : "select-none text-muted-foreground"
                )}
            >
                {show ? value || <span className="italic text-muted-foreground">empty</span> : MASK}
            </div>
        );
    }

    const shared = {
        value: show ? value : value ? MASK : "",
        readOnly: !show,
        spellCheck: false,
        autoComplete: "off",
        placeholder: "value",
        "aria-label": `Value for ${row.key || "new variable"}`,
        "aria-invalid": invalid || undefined,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => show && onChange(e.target.value),
    };

    return multiline && show ? (
        <Textarea
            {...shared}
            rows={Math.min(8, value.split("\n").length)}
            className={cn(cellInput, "h-auto min-h-0 flex-1 py-2 leading-5")}
        />
    ) : (
        <Input {...shared} className={cn(cellInput, "min-w-0 flex-1", !show && "text-muted-foreground")} />
    );
}

export type EnvEditorProps = {
    apiBase: string;
    envName: string;
    envSlug: string;
    canEdit: boolean;
    /** Values are null while locked. */
    vars: StoredVar[];
    version: number;
    updatedBy: string | null;
    /** When the user's unlock ends (null while locked). Values are only sent while unlocked. */
    revealUntil: string | null;
    onSaved: () => void;
    /** Refetch this environment (after unlocking or locking, to get or drop values). */
    onReload: () => Promise<unknown>;
    onDirtyChange: (dirty: boolean) => void;
};

export function EnvEditor({ apiBase, envName, envSlug, canEdit, vars, version, revealUntil, onSaved, onReload, onDirtyChange }: EnvEditorProps) {
    const [rows, setRows] = useState<Row[]>(() => toRows(vars));
    const [baseline, setBaseline] = useState<StoredVar[]>(vars);
    const [baseVersion, setBaseVersion] = useState(version);
    const [filter, setFilter] = useState("");
    const [revealAll, setRevealAll] = useState(false);
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const [conflict, setConflict] = useState<string | null>(null);
    const [pasteOpen, setPasteOpen] = useState(false);
    const [unlockOpen, setUnlockOpen] = useState(false);
    const focusRowId = useRef<string | null>(null);
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    // ── Unlock (server-side, 10 minutes): values arrive only after a fresh authenticator code.
    const unlocked = !!revealUntil && new Date(revealUntil).getTime() > Date.now();
    const pendingAction = useRef<(() => void) | null>(null);
    /** Runs `action` now if values are unlocked; otherwise asks for a code first and runs it afterwards. */
    const withValues = (action: () => void) => {
        if (unlocked) return action();
        pendingAction.current = action;
        setUnlockOpen(true);
    };

    // Reset only when the server version or environment changes (env switch, reload after
    // save/conflict). Keyed on version rather than the array so background revalidation
    // with identical data never wipes unsaved edits.
    const varsRef = useRef(vars);
    varsRef.current = vars;
    const baselineRef = useRef(baseline);
    baselineRef.current = baseline;

    // Values arrived or were dropped without a new version (unlock or expiry): merge them into the rows,
    // keeping any unsaved edits.
    useEffect(() => {
        const byKey = new Map(varsRef.current.map((v) => [v.key, v.value]));
        const previous = new Map(baselineRef.current.map((v) => [v.key, v.value]));
        setBaseline(varsRef.current);
        setRows((rs) =>
            rs.map((r) => {
                if (r.origKey === null || !byKey.has(r.origKey)) return r;
                const incoming = byKey.get(r.origKey)!;
                if (incoming !== null && r.value === null) return { ...r, value: incoming }; // just unlocked
                if (incoming === null && r.value !== null && r.value === previous.get(r.origKey)) {
                    return { ...r, value: null }; // locked again; unchanged value goes back to hidden
                }
                return r;
            })
        );
        if (!unlocked) {
            setRevealAll(false);
            setRevealed(new Set());
        } else if (pendingAction.current) {
            const run = pendingAction.current;
            pendingAction.current = null;
            setTimeout(run, 0); // after the merged rows are rendered
        }
    }, [unlocked]);

    // Keep the "N min left" note current.
    const [, tick] = useState(0);
    useEffect(() => {
        if (!unlocked) return;
        const t = setInterval(() => tick((n) => n + 1), 30_000);
        return () => clearInterval(t);
    }, [unlocked]);

    // Re-lock automatically when the unlock runs out.
    useEffect(() => {
        if (!revealUntil) return;
        const ms = new Date(revealUntil).getTime() - Date.now();
        if (ms <= 0) return;
        const t = setTimeout(() => onReload(), ms + 500);
        return () => clearTimeout(t);
    }, [revealUntil, onReload]);
    useEffect(() => {
        setRows(toRows(varsRef.current));
        setBaseline(varsRef.current);
        setBaseVersion(version);
        setConflict(null);
        setRevealed(new Set());
    }, [version, envSlug]);

    const changes = useMemo(() => diffCount(baseline, rows), [baseline, rows]);
    const dirty = changes > 0;
    useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

    const keyCounts = useMemo(() => {
        const m = new Map<string, number>();
        rows.forEach((r) => r.key.trim() && m.set(r.key.trim(), (m.get(r.key.trim()) ?? 0) + 1));
        return m;
    }, [rows]);
    const problems = rows.filter((r) => {
        const k = r.key.trim();
        return (k && (!KEY_RE.test(k) || (keyCounts.get(k) ?? 0) > 1)) || (!k && r.value);
    }).length;

    const visible = rows.filter((r) => !filter || r.key.toLowerCase().includes(filter.toLowerCase()));

    const update = (id: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    const addRow = () => {
        const id = `r${++rowSeq}`;
        focusRowId.current = id;
        setFilter("");
        setRows((rs) => [...rs, { id, key: "", value: "", origKey: null }]);
    };

    useEffect(() => {
        if (focusRowId.current) {
            document.getElementById(`key-${focusRowId.current}`)?.focus();
            focusRowId.current = null;
        }
    }, [rows.length]);

    const save = useCallback(async () => {
        if (!dirty || saving) return;
        if (problems) {
            toast.error("Fix the highlighted rows before saving.");
            return;
        }
        setSaving(true);
        const named = rows.filter((r) => r.key.trim());
        // Rows whose value was never unlocked are sent without one: the server keeps the stored value.
        const payload = named.map((r) =>
            r.value !== null ? { key: r.key.trim(), value: r.value } : { key: r.key.trim(), from: r.origKey ?? r.key.trim() }
        );
        try {
            const res = await api<{ version: number; added: string[]; removed: string[]; changed: string[] }>(`${apiBase}/vars`, {
                method: "PUT",
                body: { vars: payload, version: baseVersion },
            });
            const saved = named.map((r) => ({ key: r.key.trim(), value: r.value }));
            setBaseline(saved);
            setRows(toRows(saved));
            setBaseVersion(res.version);
            const parts = [
                res.added.length && `${res.added.length} added`,
                res.changed.length && `${res.changed.length} changed`,
                res.removed.length && `${res.removed.length} removed`,
            ].filter(Boolean);
            toast.success(`Saved ${envName}`, { description: parts.join(", ") || undefined });
            onSaved();
        } catch (e) {
            if (e instanceof ApiError && e.code === "version_conflict") setConflict(e.message);
            else toast.error((e as Error).message);
        } finally {
            setSaving(false);
        }
    }, [apiBase, baseVersion, dirty, envName, onSaved, problems, rows, saving]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
                if (!canEdit) return;
                e.preventDefault();
                save();
            } else if (e.key === "/" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
                e.preventDefault();
                document.getElementById(FILTER_ID)?.focus();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [canEdit, save]);

    useEffect(() => {
        if (!dirty) return;
        const warn = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [dirty]);

    const currentVars = knownVars(rows);
    const minutesLeft = unlocked ? Math.max(1, Math.ceil((new Date(revealUntil!).getTime() - Date.now()) / 60000)) : 0;

    const lock = async () => {
        try {
            await api("/api/2fa/reveal", { method: "DELETE" });
        } finally {
            await onReload();
        }
    };

    const download = () => {
        const blob = new Blob([stringifyDotenv(knownVars(rowsRef.current))], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = envSlug === "development" ? ".env" : `.env.${envSlug}`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <div>
            {conflict && (
                <Alert className="mb-4">
                    <TriangleAlert />
                    <AlertTitle>Someone else saved changes</AlertTitle>
                    <AlertDescription>{conflict}</AlertDescription>
                    <AlertAction className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => copyText(stringifyDotenv(currentVars), "Your edits were copied as .env")}>
                            Copy my edits
                        </Button>
                        <Button size="sm" onClick={onSaved}>
                            Load latest
                        </Button>
                    </AlertAction>
                </Alert>
            )}

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <SearchInput size="sm" id={FILTER_ID} value={filter} onChange={setFilter} placeholder="Filter keys" label="Filter variables by key" shortcut="/" />
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => (revealAll ? setRevealAll(false) : withValues(() => setRevealAll(true)))}
                    aria-pressed={revealAll}
                >
                    {revealAll ? <EyeOff /> : <Eye />} {revealAll ? "Hide values" : "Reveal values"}
                </Button>
                <ButtonGroup>
                    {canEdit && (
                        <Button size="sm" variant="outline" onClick={() => setPasteOpen(true)}>
                            <ClipboardPaste /> Import
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            withValues(() => {
                                const all = knownVars(rowsRef.current);
                                copyText(stringifyDotenv(all), `Copied ${all.length} variables`);
                            })
                        }
                        disabled={!rows.some((r) => r.key.trim())}
                    >
                        <Copy /> Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => withValues(download)} disabled={!rows.some((r) => r.key.trim())}>
                        <Download /> Download
                    </Button>
                </ButtonGroup>
                {unlocked && (
                    <span className="ml-auto flex items-center gap-1 text-[12.5px] text-muted-foreground">
                        <LockOpen className="size-3.5" /> Values unlocked · {minutesLeft} min left
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[12.5px]" onClick={lock}>
                            Lock
                        </Button>
                    </span>
                )}
            </div>

            {rows.length === 0 ? (
                <EmptyState
                    title={`No variables in ${envName}`}
                    action={
                        canEdit && (
                            <div className="flex gap-2">
                                <Button size="sm" onClick={addRow}>
                                    <Plus /> Add variable
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setPasteOpen(true)}>
                                    <ClipboardPaste /> Import .env
                                </Button>
                            </div>
                        )
                    }
                >
                    {canEdit
                        ? "Add variables one by one, or paste an existing .env file."
                        : "An editor on this team hasn't added any variables to this environment yet."}
                </EmptyState>
            ) : (
                <div className="overflow-hidden rounded-lg border">
                    <div aria-hidden className="hidden border-b bg-muted/40 text-[12px] font-medium text-muted-foreground sm:flex">
                        <span className="w-10 shrink-0 border-r" />
                        <div className="flex min-w-0 flex-1">
                            <span className={cn(KEY_COL, "px-3 py-2")}>Key</span>
                            <span className="border-l px-3 py-2">Value</span>
                        </div>
                        <span className={cn(ACTIONS_W, "shrink-0")} />
                    </div>
                    <ol className="divide-y">
                        {visible.map((row) => {
                            const lineNo = rows.indexOf(row) + 1;
                            const k = row.key.trim();
                            const keyInvalid = !!k && !KEY_RE.test(k);
                            const dup = !!k && (keyCounts.get(k) ?? 0) > 1;
                            const isRevealed = revealAll || revealed.has(row.id);
                            const original = row.origKey !== null ? baseline.find((v) => v.key === row.origKey) : undefined;
                            const changed =
                                canEdit && (!!k || !!row.value) && (!original || k !== row.origKey || (row.value !== null && row.value !== original.value));
                            return (
                                <li key={row.id} className="group flex items-start bg-background transition-colors focus-within:bg-muted/50 hover:bg-muted/25">
                                    <span
                                        aria-hidden
                                        className={cn(
                                            "w-10 shrink-0 select-none self-stretch border-r pr-2.5 text-right font-mono text-[11.5px] leading-10 tabular-nums",
                                            changed ? "border-r-2 border-r-primary text-foreground" : "text-muted-foreground/70"
                                        )}
                                    >
                                        {lineNo}
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-start">
                                        <div className={KEY_COL}>
                                            {canEdit ? (
                                                <Input
                                                    id={`key-${row.id}`}
                                                    value={row.key}
                                                    onChange={(e) => update(row.id, { key: e.target.value.replace(/\s/g, "_") })}
                                                    placeholder="KEY"
                                                    spellCheck={false}
                                                    autoComplete="off"
                                                    aria-label="Variable name"
                                                    aria-invalid={keyInvalid || dup || undefined}
                                                    title={dup ? "Duplicate key" : keyInvalid ? "Use letters, digits, _ . - and don't start with a digit" : undefined}
                                                    className={cn(cellInput, "font-medium", (keyInvalid || dup) && "text-destructive")}
                                                />
                                            ) : (
                                                <div className="truncate px-3 font-mono text-[13px] font-medium leading-10">{row.key}</div>
                                            )}
                                        </div>
                                        {/* Column divider between key and value (stacked, without one, on small screens). */}
                                        <span aria-hidden className="hidden w-px self-stretch bg-border sm:block" />
                                        <ValueCell
                                            row={row}
                                            editable={canEdit}
                                            revealed={isRevealed}
                                            invalid={!k && !!row.value}
                                            onChange={(value) => update(row.id, { value })}
                                            onUnlock={() => withValues(() => {})}
                                        />
                                    </div>
                                    <div className={cn(ACTIONS_W, "flex shrink-0 items-center justify-end gap-0.5 px-1 py-1 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100")}>
                                        {!revealAll && (
                                            <IconAction
                                                label={isRevealed ? "Hide value" : "Reveal value"}
                                                onClick={() =>
                                                    isRevealed
                                                        ? setRevealed((s) => {
                                                              const n = new Set(s);
                                                              n.delete(row.id);
                                                              return n;
                                                          })
                                                        : withValues(() => setRevealed((s) => new Set(s).add(row.id)))
                                                }
                                            >
                                                {isRevealed ? <EyeOff /> : <Eye />}
                                            </IconAction>
                                        )}
                                        <IconAction
                                            label="Copy value"
                                            onClick={() =>
                                                withValues(() => {
                                                    const v = rowsRef.current.find((r) => r.id === row.id)?.value;
                                                    if (v != null) copyText(v, `Copied ${row.key || "value"}`);
                                                })
                                            }
                                        >
                                            <Copy />
                                        </IconAction>
                                        {canEdit && (
                                            <IconAction label="Delete variable" danger onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}>
                                                <Trash2 />
                                            </IconAction>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                        {visible.length === 0 && (
                            <li className="px-4 py-6 text-center text-[13px] text-muted-foreground">No keys match &ldquo;{filter}&rdquo;.</li>
                        )}
                    </ol>
                    {canEdit && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={addRow}
                            className="h-10 w-full justify-start rounded-none border-t px-3 text-[13px] font-normal text-muted-foreground"
                        >
                            <Plus /> Add variable
                        </Button>
                    )}
                </div>
            )}

            {canEdit && dirty && (
                <div className="sticky bottom-4 z-20 mt-4 flex justify-center">
                    <div className="flex items-center gap-2 rounded-full border bg-popover py-1.5 pl-4 pr-1.5  animate-in fade-in-0 slide-in-from-bottom-2">
                        <span className="text-[13px]">
                            {changes} unsaved change{changes === 1 ? "" : "s"}
                            {problems > 0 && <span className="text-destructive">, {problems} to fix</span>}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full"
                            onClick={() => {
                                setRows(toRows(baseline));
                                setConflict(null);
                            }}
                        >
                            <RotateCcw /> Discard
                        </Button>
                        <Button size="sm" className="rounded-full" onClick={save} loading={saving} disabled={problems > 0}>
                            Save <Kbd className="bg-primary-foreground/15 text-primary-foreground/80">⌘S</Kbd>
                        </Button>
                    </div>
                </div>
            )}

            <UnlockDialog
                open={unlockOpen}
                onOpenChange={(open) => {
                    setUnlockOpen(open);
                    if (!open && !unlocked) pendingAction.current = null;
                }}
                onUnlocked={onReload}
            />

            <PasteDialog
                open={pasteOpen}
                onOpenChange={setPasteOpen}
                existingKeys={new Set(rows.map((r) => r.key.trim()))}
                onApply={(incoming) => {
                    setRows((rs) => {
                        const byKey = new Map(incoming.map((v) => [v.key, v.value]));
                        const merged = rs.map((r) => (byKey.has(r.key.trim()) ? { ...r, value: byKey.get(r.key.trim())! } : r));
                        const existing = new Set(rs.map((r) => r.key.trim()));
                        const added = toRows(incoming.filter((v) => !existing.has(v.key))).map((r) => ({ ...r, origKey: null }));
                        return [...merged.filter((r) => r.key || r.value), ...added];
                    });
                    toast.success(`Imported ${incoming.length} variable${incoming.length === 1 ? "" : "s"}. Review and save.`);
                }}
            />
        </div>
    );
}
