import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { PriceText } from "@/components/site/price-text";
import { ServiceVisual } from "@/components/site/service-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="h-full py-0">
      <ServiceVisual title={title} imageKey={imageKey} layout="card" priority={priority} />
      <CardHeader className="pt-4">
        <CardTitle>
          <Title className="text-base font-semibold text-foreground">{title}</Title>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pb-4">
        {description ? (
          <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <PriceText min={priceMin} max={priceMax} label={currencyLabel} />
        <Button asChild className="mt-auto w-full">
          <Link href={href}>
            {action}
            <CalendarDays aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
