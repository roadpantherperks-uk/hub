import Link from "next/link";
import { Header } from "./Header";

/** Shared shell for marketing pages — background wash, header, footer. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img src="/hero.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/95 to-background" />
      </div>
      <Header />
      <main className="pt-24 pb-24">{children}</main>
      <footer className="hairline-t">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Road Panther Perks</span>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/perks" className="hover:text-foreground">Perks</Link>
            <Link href="/partners" className="hover:text-foreground">Partners</Link>
            <Link href="/how-it-works" className="hover:text-foreground">How it works</Link>
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 mb-12">
      <div className="inline-flex items-center gap-2 text-xs font-medium text-brand mb-4">
        <span className="block w-6 h-px bg-brand" />
        {eyebrow}
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em]">{title}</h1>
      {subtitle && <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed text-lg">{subtitle}</p>}
    </div>
  );
}
