"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/common";

const DAY = 24 * 60 * 60 * 1000;
const isoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export type Expiry = { preset: string; date: string };

/**
 * Expiry choice: preset durations (days, or "never" when allowed) plus "Custom date…", which reveals a date
 * picker limited to tomorrow through `maxDays` ahead.
 */
export function ExpiryField({
    id,
    label = "Expires",
    value,
    onChange,
    presets,
    maxDays,
}: {
    id: string;
    label?: string;
    value: Expiry;
    onChange: (v: Expiry) => void;
    presets: { value: string; label: string }[];
    maxDays: number;
}) {
    const min = isoDate(new Date(Date.now() + DAY));
    const max = isoDate(new Date(Date.now() + maxDays * DAY));
    return (
        <FormField label={label} htmlFor={id}>
            <div className="flex flex-col gap-2">
                <Select value={value.preset} onValueChange={(preset) => onChange({ preset, date: value.date || min })}>
                    <SelectTrigger id={id} className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {presets.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom date…</SelectItem>
                    </SelectContent>
                </Select>
                {value.preset === "custom" && (
                    <Input
                        type="date"
                        aria-label="Expiry date"
                        required
                        min={min}
                        max={max}
                        value={value.date}
                        onChange={(e) => onChange({ ...value, date: e.target.value })}
                    />
                )}
            </div>
        </FormField>
    );
}

/** The end of the chosen day, in the user's time zone, as an ISO timestamp for the API. */
export function customExpiryISO(date: string) {
    return new Date(`${date}T23:59:59`).toISOString();
}
