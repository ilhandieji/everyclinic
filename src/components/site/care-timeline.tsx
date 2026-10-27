import Link from "next/link";
import { sitePanelClass } from "@/components/layout/site-shell";
import {
  TimelineEmptyHelp,
  TimelinePhysicianEmpty,
} from "@/components/site/patient-care-help";
import { StatusBadge } from "@/components/site/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TimelineEntry, TimelineKind } from "@/lib/care-timeline";
import { formatFaDateTime } from "@/lib/tehran";

const kindLabel: Record<TimelineKind, string> = {
  service_request: "درخواست رزرو",
  prescription: "نسخه",
  medication_status: "وضعیت دارو",
  reminder: "یادآوری",
};

export function CareTimeline({
  entries,
  audience = "patient",
  showServicesLink = false,
}: {
  entries: TimelineEntry[];
  audience?: "patient" | "physician";
  showServicesLink?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <Card size="sm" className={sitePanelClass}>
        <CardContent className="text-center">
          {audience === "physician" ? (
            <TimelinePhysicianEmpty />
          ) : (
            <TimelineEmptyHelp showServicesLink={showServicesLink} />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.id}>
          <Card size="sm" className={sitePanelClass}>
            <CardContent className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline">{kindLabel[entry.kind]}</Badge>
                {entry.kind === "service_request" && entry.status ? (
                  <StatusBadge status={entry.status} />
                ) : null}
              </div>
              <p className="text-sm font-medium text-foreground">{entry.title}</p>
              <p dir="auto" className="text-sm text-foreground">
                {entry.detail}
              </p>
              <time
                dateTime={entry.at.toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatFaDateTime(entry.at)}
              </time>
              {entry.href ? (
                entry.href.startsWith("#") ? (
                  <a href={entry.href} className="w-fit text-xs font-medium underline-offset-4 hover:underline">
                    مشاهدهٔ جزئیات
                  </a>
                ) : (
                  <Link href={entry.href} className="w-fit text-xs font-medium underline-offset-4 hover:underline">
                    مشاهدهٔ جزئیات
                  </Link>
                )
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}
