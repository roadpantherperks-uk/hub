import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/95 to-background" />
      </div>

      <Link
        href="/"
        className="group absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back
      </Link>

      <main className="container mx-auto px-6 py-16 md:py-24 flex justify-center">
        {children}
      </main>
    </div>
  );
}
