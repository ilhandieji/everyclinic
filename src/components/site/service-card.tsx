import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { PriceText } from "@/components/site/price-text";
import { ServiceVisual } from "@/components/site/service-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ServiceCard({
  id,
  title,
  description,
  priceMin,
  priceMax,
  currencyLabel,
  imageKey,
  physicianView = false,
  priority = false,
  titleLevel = "h2",
}: {
  id: string;
  title: string;
  description: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currencyLabel: string | null;
  imageKey?: string | null;
  /** When true, link to manage edit — no patient booking CTA. */
  physicianView?: boolean;
  priority?: boolean;
  titleLevel?: "h2" | "h3";
}) {
  const Title = titleLevel;
  const href = physicianView ? `/manage/services/${id}` : `/services/${id}`;
  const action = physicianView ? "ویرایش خدمت" : "درخواست رزرو";

  return (
    <Card className="h-full gap-0 py-0 text-base shadow-sm">
      <ServiceVisual title={title} imageKey={imageKey} layout="card" priority={priority} />
      <CardHeader className="pt-5">
        <CardTitle>
          <Title className="text-lg font-semibold text-foreground">{title}</Title>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pb-5">
        {description ? (
          <p className="line-clamp-4 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <PriceText min={priceMin} max={priceMax} label={currencyLabel} />
        <Button
          asChild
          size={physicianView ? "default" : "lg"}
          className={cn("mt-auto w-full", !physicianView && "h-11 text-base")}
        >
          <Link href={href}>
            {action}
            <CalendarDays aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
