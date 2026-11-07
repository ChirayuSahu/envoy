import { SiteFooter, SiteHeader } from "@/components/landing/site-header";

export default function ShareLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-dvh flex-col bg-background">
            <SiteHeader />
            <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">{children}</main>
            <SiteFooter />
        </div>
    );
}
