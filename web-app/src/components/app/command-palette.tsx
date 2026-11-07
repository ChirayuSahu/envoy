"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Folder, KeyRound, LayoutGrid, Moon, Plus, ScrollText, Settings, User, Users } from "lucide-react";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { useOrg } from "./org-context";

export function CommandPalette({
    open,
    onOpenChange,
    onCreateTeam,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateTeam: () => void;
}) {
    const router = useRouter();
    const { data, slug, isAdmin } = useOrg();
    const { resolvedTheme, setTheme } = useTheme();

    const run = (fn: () => void) => {
        onOpenChange(false);
        fn();
    };
    const go = (href: string) => run(() => router.push(href));

    const hasProjects = !!data?.teams.some((t) => t.projects.length);

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} title="Command menu" description="Search projects, teams and settings">
            {/* CommandDialog doesn't provide the cmdk root itself; without it CommandInput crashes. */}
            <Command loop>
            <CommandInput placeholder="Search projects, teams and settings…" />
            <CommandList>
                <CommandEmpty>No matches.</CommandEmpty>

                {hasProjects && (
                    <CommandGroup heading="Projects">
                        {data!.teams.flatMap((t) =>
                            t.projects.map((p) => (
                                <CommandItem
                                    key={p.id}
                                    value={`${t.name} ${p.slug} ${p.name}`}
                                    onSelect={() => go(`/o/${slug}/t/${t.slug}/p/${p.slug}`)}
                                >
                                    <Folder />
                                    <span className="font-mono text-[13px]">{p.slug}</span>
                                    <span className="ml-auto text-xs text-muted-foreground">{t.name}</span>
                                </CommandItem>
                            ))
                        )}
                    </CommandGroup>
                )}

                {data && data.teams.length > 0 && (
                    <CommandGroup heading="Teams">
                        {data.teams.map((t) => (
                            <CommandItem key={t.id} value={`team ${t.name}`} onSelect={() => go(`/o/${slug}/t/${t.slug}`)}>
                                <Users /> {t.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                <CommandSeparator />
                <CommandGroup heading="Go to">
                    {slug && (
                        <CommandItem onSelect={() => go(`/o/${slug}`)}>
                            <LayoutGrid /> Overview
                        </CommandItem>
                    )}
                    {slug && (
                        <CommandItem onSelect={() => go(`/o/${slug}/settings`)}>
                            <Settings /> Organization settings
                        </CommandItem>
                    )}
                    {slug && (
                        <CommandItem onSelect={() => go(`/o/${slug}/settings/members`)}>
                            <Users /> Members
                        </CommandItem>
                    )}
                    {slug && isAdmin && (
                        <CommandItem onSelect={() => go(`/o/${slug}/settings/audit`)}>
                            <ScrollText /> Audit log
                        </CommandItem>
                    )}
                    <CommandItem onSelect={() => go("/account")}>
                        <User /> Account and security
                    </CommandItem>
                    <CommandItem onSelect={() => go("/account/tokens")}>
                        <KeyRound /> API tokens
                    </CommandItem>
                </CommandGroup>

                <CommandSeparator />
                <CommandGroup heading="Actions">
                    {slug && isAdmin && (
                        <CommandItem onSelect={() => run(onCreateTeam)}>
                            <Plus /> Create team
                        </CommandItem>
                    )}
                    {slug && isAdmin && (
                        <CommandItem onSelect={() => go(`/o/${slug}/settings/invites`)}>
                            <Plus /> Invite people
                        </CommandItem>
                    )}
                    <CommandItem onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
                        <Moon /> Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
                    </CommandItem>
                </CommandGroup>
            </CommandList>
            </Command>
        </CommandDialog>
    );
}
