import Image from "next/image";
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
        sizes="(min-width: 1024px) 40rem, 100vw"
        className="hero-mark__photo"
      />
    </div>
  );
}
