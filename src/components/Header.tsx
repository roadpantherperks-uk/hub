"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { ChevronDown, Menu, X } from "lucide-react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/perks", label: "Perks" },
  { href: "/partners", label: "Partners" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const ROAD_PRO = [
  { href: "/signup", label: "Join free" },
  { href: "/perks", label: "Perks" },
  { href: "/how-it-works", label: "How it works" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen ? "bg-background/80 backdrop-blur-xl hairline-b" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {n.label}
            </Link>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setProOpen(true)}
            onMouseLeave={() => setProOpen(false)}
          >
            <button className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand/80 transition-colors">
              Road Professionals <ChevronDown className="size-3.5" />
            </button>
            {proOpen && (
              <div className="absolute right-0 top-full pt-2">
                <div className="w-52 rounded-xl bg-background/95 backdrop-blur-xl hairline p-1.5 shadow-xl">
                  {ROAD_PRO.map((r) => (
                    <Link
                      key={r.href + r.label}
                      href={r.href}
                      className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center text-sm font-semibold bg-foreground text-background px-5 h-9 rounded-full hover:bg-foreground/90 transition-colors"
          >
            Get started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-foreground" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden hairline-t bg-background/95 backdrop-blur-xl">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)} className="py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground">
                {n.label}
              </Link>
            ))}
            <div className="py-2 text-xs uppercase tracking-wider text-brand mt-2">Road Professionals</div>
            {ROAD_PRO.map((r) => (
              <Link key={r.href + r.label} href={r.href} onClick={() => setMobileOpen(false)} className="py-2 pl-3 text-sm text-muted-foreground hover:text-foreground">
                {r.label}
              </Link>
            ))}
            <div className="flex gap-3 mt-4">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-medium hairline rounded-full">
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-semibold bg-foreground text-background rounded-full">
                Get started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
