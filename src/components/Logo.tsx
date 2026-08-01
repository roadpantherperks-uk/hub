import Link from "next/link";

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 group text-foreground hover:opacity-90 transition-opacity"
    >
      <img
        src="/logo.png"
        alt="Road Panther Perks"
        width={size}
        height={size}
        className="rounded-md ring-1 ring-white/10"
      />
      <span className="font-semibold tracking-tight text-[15px] hidden sm:inline">
        Road Panther <span className="text-brand">Perks</span>
      </span>
    </Link>
  );
}
