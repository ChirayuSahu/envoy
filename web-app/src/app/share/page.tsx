"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton, FormField, PageHeader } from "@/components/common";
import { api } from "@/lib/api-client";
import { parseDotenv } from "@/lib/dotenv";
import { SHARE_TTL_OPTIONS } from "@/lib/share";

const EXPIRY = SHARE_TTL_OPTIONS.map((o) => ({ value: String(o.seconds), label: o.label }));

export default function TemporaryLinkPage() {
    const [text, setText] = useState("");
    const [ttl, setTtl] = useState("3600");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [link, setLink] = useState<string | null>(null);
    const vars = useMemo(() => parseDotenv(text), [text]);

    async function create(e: React.FormEvent) {
        e.preventDefault();
        if (!vars.length) {
            setError("Paste at least one KEY=value line.");
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const res = await api<{ token: string }>("/api/share", { body: { vars, expiresInSeconds: Number(ttl) } });
            setLink(`${window.location.origin}/share/${res.token}`);
            setText("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <PageHeader
                title="Create a temporary link"
                description="Share a .env with someone once. The link expires after at most 24 hours and is then deleted. Nothing is ever public: for ongoing access, use an organization so you control who can see each environment."
            />

            {link ? (
                <Alert>
                    <Link2 />
                    <AlertTitle>Your link is ready</AlertTitle>
                    <AlertDescription>
                        <p>Anyone with this link can read the variables until it expires, then it&apos;s deleted. Send it over a private channel.</p>
                        <div className="mt-3 flex w-full items-center gap-1 rounded-md bg-muted py-1 pl-3 pr-1">
                            <code className="flex-1 truncate font-mono text-[12.5px] text-foreground">{link}</code>
                            <CopyButton value={link} label="Link" />
                        </div>
                        <Button variant="link" className="mt-2 h-auto p-0" onClick={() => setLink(null)}>
                            Share something else
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : (
                <form onSubmit={create} className="flex flex-col gap-5">
                    <FormField
                        label="Variables"
                        htmlFor="share-text"
                        error={error}
                        hint={vars.length ? `${vars.length} variable${vars.length === 1 ? "" : "s"} detected.` : "Paste the contents of a .env file."}
                    >
                        <Textarea
                            id="share-text"
                            rows={12}
                            spellCheck={false}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={"API_URL=https://staging.example.com\nAPI_KEY=…"}
                            className="font-mono text-[12.5px]"
                        />
                    </FormField>
                    <div className="flex flex-wrap items-end gap-3">
                        <FormField label="Expires after" htmlFor="share-ttl" className="w-48 gap-2">
                            <Select value={ttl} onValueChange={setTtl}>
                                <SelectTrigger id="share-ttl" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {EXPIRY.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>
                        <Button type="submit" loading={busy}>
                            Create link
                        </Button>
                    </div>
                    <p className="text-[13px] text-muted-foreground">
                        Values are encrypted at rest. Want access control and an audit log?{" "}
                        <Link href="/signup" className="text-foreground underline underline-offset-4">
                            Create an organization
                        </Link>
                        .
                    </p>
                </form>
            )}
        </>
    );
}
