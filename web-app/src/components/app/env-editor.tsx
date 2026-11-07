"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ClipboardPaste, Copy, Download, Eye, EyeOff, Plus, RotateCcw, Trash2, TriangleAlert } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CopyButton, EmptyState, SearchInput, copyText } from "@/components/common";
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

type Row = { id: string; key: string; value: string };

let rowSeq = 0;
const toRows = (vars: EnvVar[]): Row[] => vars.map((v) => ({ id: `r${++rowSeq}`, ...v }));
const toVars = (rows: Row[]): EnvVar[] => rows.map(({ key, value }) => ({ key: key.trim(), value }));

function diffCount(original: EnvVar[], rows: Row[]) {
    const before = new Map(original.map((v) => [v.key, v.value]));
    const after = new Map(toVars(rows).filter((v) => v.key).map((v) => [v.key, v.value]));
    let n = 0;
    for (const [k, v] of after) if (before.get(k) !== v) n++;
    for (const k of before.keys()) if (!after.has(k)) n++;
    // A row with a value but no key yet is a pending change too.
    n += rows.filter((r) => !r.key.trim() && r.value).length;
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
    invalid,
}: {
    row: Row;
    editable: boolean;
    revealed: boolean;
    onChange: (value: string) => void;
    invalid?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    const show = revealed || focused;
    const multiline = row.value.includes("\n");

    if (!editable) {
        return (
            <div
                className={cn(
                    "min-w-0 flex-1 truncate px-3 font-mono text-[13px] leading-10",
                    show ? "text-foreground" : "select-none text-muted-foreground"
                )}
            >
                {show ? row.value || <span className="italic text-muted-foreground">empty</span> : MASK}
            </div>
        );
    }

    const shared = {
        value: show ? row.value : row.value ? MASK : "",
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
            rows={Math.min(8, row.value.split("\n").length)}
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
    vars: EnvVar[];
    version: number;
    updatedBy: string | null;
    onSaved: () => void;
    onDirtyChange: (dirty: boolean) => void;
};

export function EnvEditor({ apiBase, envName, envSlug, canEdit, vars, version, onSaved, onDirtyChange }: EnvEditorProps) {
    const [rows, setRows] = useState<Row[]>(() => toRows(vars));
    const [baseline, setBaseline] = useState<EnvVar[]>(vars);
    const [baseVersion, setBaseVersion] = useState(version);
    const [filter, setFilter] = useState("");
    const [revealAll, setRevealAll] = useState(false);
    const [revealed, setRevealed] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const [conflict, setConflict] = useState<string | null>(null);
    const [pasteOpen, setPasteOpen] = useState(false);
    const focusRowId = useRef<string | null>(null);

    // Reset only when the server version or environment changes (env switch, reload after
    // save/conflict). Keyed on version rather than the array so background revalidation
    // with identical data never wipes unsaved edits.
    const varsRef = useRef(vars);
    varsRef.current = vars;
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
        setRows((rs) => [...rs, { id, key: "", value: "" }]);
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
        const payload = toVars(rows).filter((v) => v.key);
        try {
            const res = await api<{ version: number; added: string[]; removed: string[]; changed: string[] }>(`${apiBase}/vars`, {
                method: "PUT",
                body: { vars: payload, version: baseVersion },
            });
            setBaseline(payload);
            setRows(toRows(payload));
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

    const currentVars = toVars(rows).filter((v) => v.key);

    const download = () => {
        const blob = new Blob([stringifyDotenv(currentVars)], { type: "text/plain" });
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
                <Button size="sm" variant="ghost" onClick={() => setRevealAll((v) => !v)} aria-pressed={revealAll}>
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
                        onClick={() => copyText(stringifyDotenv(currentVars), `Copied ${currentVars.length} variables`)}
                        disabled={!currentVars.length}
                    >
                        <Copy /> Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={download} disabled={!currentVars.length}>
                        <Download /> Download
                    </Button>
                </ButtonGroup>
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
                            const original = baseline.find((v) => v.key === k);
                            const changed = canEdit && (!!k || !!row.value) && (!original || original.value !== row.value);
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
                                        />
                                    </div>
                                    <div className={cn(ACTIONS_W, "flex shrink-0 items-center justify-end gap-0.5 px-1 py-1 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100")}>
                                        {!revealAll && (
                                            <IconAction
                                                label={isRevealed ? "Hide value" : "Reveal value"}
                                                onClick={() =>
                                                    setRevealed((s) => {
                                                        const n = new Set(s);
                                                        if (n.has(row.id)) n.delete(row.id);
                                                        else n.add(row.id);
                                                        return n;
                                                    })
                                                }
                                            >
                                                {isRevealed ? <EyeOff /> : <Eye />}
                                            </IconAction>
                                        )}
                                        <CopyButton value={row.value} label={row.key || "value"} />
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

            <PasteDialog
                open={pasteOpen}
                onOpenChange={setPasteOpen}
                existingKeys={new Set(rows.map((r) => r.key.trim()))}
                onApply={(incoming) => {
                    setRows((rs) => {
                        const byKey = new Map(incoming.map((v) => [v.key, v.value]));
                        const merged = rs.map((r) => (byKey.has(r.key.trim()) ? { ...r, value: byKey.get(r.key.trim())! } : r));
                        const existing = new Set(rs.map((r) => r.key.trim()));
                        const added = toRows(incoming.filter((v) => !existing.has(v.key)));
                        return [...merged.filter((r) => r.key || r.value), ...added];
                    });
                    toast.success(`Imported ${incoming.length} variable${incoming.length === 1 ? "" : "s"}. Review and save.`);
                }}
            />
        </div>
    );
}
