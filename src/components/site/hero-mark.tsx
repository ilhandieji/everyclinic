import Image from "next/image";
import { HeroChipStage } from "@/components/site/hero-chips";
import { cn } from "@/lib/utils";

/** Photographic consultation room. Decorative; the physician copy carries the meaning. */
export function HeroMark({ className }: { className?: string }) {
  return (
    <div className={cn("hero-mark", className)} aria-hidden="true">
      <Image
        src="/clinic-room.webp"
        alt=""
        width={1152}
        height={864}
        priority
        sizes="(min-width: 1024px) 36rem, 100vw"
        className="hero-mark__photo"
      />
      <HeroChipStage>
        <span className="hero-mark__chip hero-mark__chip--pulse">
          <PulseIcon />
        </span>
        <span className="hero-mark__chip hero-mark__chip--shield">
          <ShieldIcon />
        </span>
      </HeroChipStage>
    </div>
  );
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 26s-8.5-5.2-8.5-11.2A4.6 4.6 0 0 1 16 11a4.6 4.6 0 0 1 8.5 3.8C24.5 20.8 16 26 16 26Z" />
      <path d="M8.5 16.5h3.2l1.6-2.4 2.2 4.2 1.8-2.6h4.2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 5.5 25 9v6.2c0 5.2-3.6 8.8-9 11.3-5.4-2.5-9-6.1-9-11.3V9l9-3.5Z" />
      <path d="M12.2 16.2 14.8 19l5-5.2" />
    </svg>
  );
}
