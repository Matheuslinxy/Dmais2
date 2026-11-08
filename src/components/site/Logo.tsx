import { cn } from "@/lib/utils";

type Props = {
  logoUrl?: string | null | undefined;
  name?: string | undefined;
  compact?: boolean;
  /** "dark" = for dark backgrounds (default), "light" = for light backgrounds */
  tone?: "dark" | "light";
  className?: string;
};

export function LogoMark({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-grid size-11 shrink-0 place-items-center rounded-sm border-2 border-primary font-display text-xl font-black leading-none",
        tone === "dark" ? "bg-ink text-foreground" : "bg-foreground text-ink",
        className,
      )}
    >
      <span className="-tracking-wider">
        D<span className="text-primary">+</span>
      </span>
      <span className="absolute -bottom-[2px] -right-[2px] size-2 bg-primary" />
    </span>
  );
}

export function Logo({ logoUrl, name = "Dmais Comunicação Visual", compact, tone = "dark", className }: Props) {
  if (logoUrl) {
    return <img src={logoUrl} alt={name} className={cn("h-11 w-auto object-contain", className)} />;
  }
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark tone={tone} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display text-lg font-black uppercase tracking-tight", tone === "light" && "text-ink")}>
            Dmais
          </span>
          <span className="mt-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.25em] text-primary">
            Comunicação Visual
          </span>
        </span>
      )}
    </span>
  );
}
