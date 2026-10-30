import Image from "next/image";
import { cn } from "@/lib/utils";

const iconProps = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export type ServiceIconKind = "psychiatry" | "neurology" | "followup" | "assessment" | "visit";

/** Match the published title. More specific phrases win so combined names stay stable. */
export function serviceIconKind(title: string): ServiceIconKind {
  if (title.includes("پیگیری")) return "followup";
  if (title.includes("ارزیابی")) return "assessment";
  if (title.includes("روان")) return "psychiatry";
  if (/مغز|اعصاب|عصبی/.test(title)) return "neurology";
  return "visit";
}

const tileClass: Record<ServiceIconKind, string> = {
  psychiatry: "service-tile--fern",
  neurology: "service-tile--sky",
  followup: "service-tile--mint",
  assessment: "service-tile--calm",
  visit: "service-tile--line",
};

/** Landscape 16:9 banners in `public/` — bump version when replacing files (bypasses stale optimizer cache). */
const SERVICE_ART_CACHE_VERSION = "20261030-lilac";

const serviceMarkSrc: Record<ServiceIconKind, string> = {
  psychiatry: "/service-psychiatry.webp",
  neurology: "/service-neurology.webp",
  followup: "/service-followup.webp",
  assessment: "/service-assessment.webp",
  visit: "/service-visit.webp",
};

function serviceArtUrl(kind: ServiceIconKind) {
  return `${serviceMarkSrc[kind]}?${SERVICE_ART_CACHE_VERSION}`;
}

export function serviceTileClass(title: string) {
  return tileClass[serviceIconKind(title)];
}

export type ServiceVisualLayout = "card" | "detail";

/** Title-matched illustration header (reference-style art). Uploaded photos stay photographic. */
export function ServiceMark({
  title,
  layout = "card",
  priority = false,
}: {
  title: string;
  layout?: ServiceVisualLayout;
  priority?: boolean;
}) {
  const kind = serviceIconKind(title);
  const artSrc = serviceMarkSrc[kind];

  if (artSrc) {
    return (
      <div
        className={cn(
          "service-panel service-panel--art",
          `service-panel--${kind}`,
          layout === "card" && "service-panel--card",
          layout === "detail" && "service-panel--detail",
        )}
      >
        <div className="service-panel__art-inset">
          <Image
            src={serviceArtUrl(kind)}
            alt=""
            fill
            unoptimized
            priority={priority}
            sizes="(min-width: 1280px) 26rem, (min-width: 640px) 45vw, 100vw"
            className="service-panel__photo"
            aria-hidden
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "service-panel",
        `service-panel--${kind}`,
        layout === "card" && "service-panel--card",
        layout === "detail" && "service-panel--detail",
      )}
      aria-hidden="true"
    >
      <span className="service-panel__ring">
        <ServiceIcon title={title} className={layout === "detail" ? "size-14" : "size-8"} />
      </span>
    </div>
  );
}

/** Uploaded service photo or the same title-matched mark as landing cards. */
export function ServiceVisual({
  title,
  imageKey,
  layout = "card",
  priority = false,
}: {
  title: string;
  imageKey?: string | null;
  layout?: ServiceVisualLayout;
  priority?: boolean;
}) {
  if (imageKey) {
    return (
      <div
        className={cn(
          "service-panel service-panel--photo relative w-full shrink-0 overflow-hidden bg-muted",
          layout === "detail" ? "service-panel--detail rounded-lg" : "service-panel--card",
        )}
      >
        <Image
          src={`/media/${imageKey}`}
          alt={title}
          fill
          unoptimized
          priority={priority}
          sizes={layout === "detail" ? "(min-width: 1024px) 24rem, 100vw" : "(min-width: 1024px) 24rem, 100vw"}
          className="service-panel__photo"
        />
      </div>
    );
  }

  if (layout === "detail") {
    return (
      <div className="overflow-hidden rounded-lg">
        <ServiceMark title={title} layout="detail" priority={priority} />
      </div>
    );
  }

  return <ServiceMark title={title} layout="card" priority={priority} />;
}

export function ServiceIcon({
  title,
  className,
  strokeWidth = iconProps.strokeWidth,
}: {
  title: string;
  className?: string;
  strokeWidth?: number;
}) {
  const kind = serviceIconKind(title);
  return (
    <svg {...iconProps} strokeWidth={strokeWidth} className={className}>
      {kind === "psychiatry" ? <PsychiatryMark /> : null}
      {kind === "neurology" ? <NeurologyMark /> : null}
      {kind === "followup" ? <FollowupMark /> : null}
      {kind === "assessment" ? <AssessmentMark /> : null}
      {kind === "visit" ? <VisitMark /> : null}
    </svg>
  );
}

function PsychiatryMark() {
  return (
    <>
      <path d="M5.5 8h12a2.5 2.5 0 0 1 2.5 2.5V15a2.5 2.5 0 0 1-2.5 2.5H11l-3.4 2.8V17.5H5.5A2.5 2.5 0 0 1 3 15v-4.5A2.5 2.5 0 0 1 5.5 8Z" />
      <path d="M7 11.2h7.2M7 13.8h4.6" />
      <path d="M15.2 15.6h8.2a2.2 2.2 0 0 1 2.2 2.2v3.4a2.2 2.2 0 0 1-2.2 2.2H21v2.4l-2.8-2.4h-3a2.2 2.2 0 0 1-2.2-2.2v-3.4a2.2 2.2 0 0 1 2.2-2.2Z" />
      <path d="M17.4 18.6h5.2M17.4 20.8h3.2" />
    </>
  );
}

function NeurologyMark() {
  return (
    <>
      <path d="M16 6.2c-1.5 0-2.6.9-3.4 2-.8-1.1-1.9-2-3.4-2C6.6 6.2 5 8.2 5 10.6c0 1.4.5 2.4 1.3 3.2-.7.9-1.3 2-1.3 3.3 0 2.6 2 4.6 4.6 4.6 1.2 0 2.2-.5 3-1.3.5 1.6 1.8 2.6 3.4 2.6" />
      <path d="M16 6.2c1.5 0 2.6.9 3.4 2 .8-1.1 1.9-2 3.4-2 2.6 0 4.2 2 4.2 4.4 0 1.4-.5 2.4-1.3 3.2.7.9 1.3 2 1.3 3.3 0 2.6-2 4.6-4.6 4.6-1.2 0-2.2-.5-3-1.3-.5 1.6-1.8 2.6-3.4 2.6" />
      <path d="M13.2 11.2c.8.7 1.4 1.6 1.4 2.6M18.8 11.2c-.8.7-1.4 1.6-1.4 2.6M12.4 16.4c1 .8 2.2 1.2 3.6 1.2s2.6-.4 3.6-1.2" />
      <path d="M16 18.2v6.2M13.4 26.6 16 24.4l2.6 2.2" />
    </>
  );
}

function FollowupMark() {
  return (
    <>
      <rect x="6.5" y="7.5" width="15" height="15" rx="2.2" />
      <path d="M6.5 12h15M10.5 6v3M16.5 6v3" />
      <path d="M10 15.2h2.2M14.2 15.2h2.2M10 18.2h2.2" />
      <path d="M21.2 18.2a5.2 5.2 0 1 1-1.4 3.6" />
      <path d="M21 17.2h3.1v3" />
    </>
  );
}

function AssessmentMark() {
  return (
    <>
      <path d="M11 6.5h8.2l4.3 4.3V25a1.5 1.5 0 0 1-1.5 1.5H11A1.5 1.5 0 0 1 9.5 25V8A1.5 1.5 0 0 1 11 6.5Z" />
      <path d="M19 6.8V11h4.2" />
      <path d="M13 15.5h8M13 19h8M13 22.5h5" />
    </>
  );
}

function VisitMark() {
  return (
    <>
      <rect x="6.5" y="8" width="19" height="16" rx="2.5" />
      <path d="M6.5 13h19" />
      <path d="M16 16.5v5M13.5 19h5" />
    </>
  );
}

export type JourneyIconName = "browse" | "account" | "note" | "status";

export function JourneyIcon({
  name,
  className,
  strokeWidth = iconProps.strokeWidth,
}: {
  name: JourneyIconName;
  className?: string;
  /** Heavier strokes for landing strip and other prominent marks. */
  strokeWidth?: number;
}) {
  return (
    <svg {...iconProps} strokeWidth={strokeWidth} className={className}>
      {name === "browse" ? (
        <>
          <rect x="7" y="6.5" width="18" height="19" rx="2.5" />
          <path d="M11 12h10M11 16h10M11 20h6" />
        </>
      ) : null}
      {name === "account" ? (
        <>
          <circle cx="16" cy="12" r="3.2" />
          <path d="M8.5 24.2c1.2-3.4 3.8-5 7.5-5s6.3 1.6 7.5 5" />
        </>
      ) : null}
      {name === "note" ? (
        <>
          <path d="M9 7.5h10l4 4V24.5H9z" />
          <path d="M19 7.8V12h4" />
          <path d="M12.5 17.5h7M12.5 21h4.5" />
        </>
      ) : null}
      {name === "status" ? (
        <>
          <circle cx="16" cy="16" r="8.5" />
          <path d="M12.2 16.2l2.4 2.4 5.2-5.4" />
        </>
      ) : null}
    </svg>
  );
}
