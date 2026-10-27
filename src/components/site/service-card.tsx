import Image from "next/image";
import Link from "next/link";
import { Heart, Shield, Stethoscope, type LucideIcon } from "lucide-react";
import { PriceText } from "@/components/site/price-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiles = ["service-tile--mint", "service-tile--fern", "service-tile--sky"] as const;
const icons: LucideIcon[] = [Stethoscope, Heart, Shield];

function markFor(id: string) {
  let index = 0;
  for (const char of id) {
    index = (index + char.charCodeAt(0)) % tiles.length;
  }
  return { tile: tiles[index], Icon: icons[index] };
}

export function ServiceCard({
  id,
  title,
  description,
  priceMin,
  priceMax,
  currencyLabel,
  imageKey,
  physicianView = false,
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
}) {
  const { tile, Icon } = markFor(id);

  return (
    <Card className="h-full">
      {imageKey ? (
        <Image
          src={`/media/${imageKey}`}
          alt={title}
          width={800}
          height={320}
          unoptimized
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="px-(--card-spacing)">
          <div className={`service-tile ${tile}`}>
            <Icon aria-hidden className="size-6" />
          </div>
        </div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {description ? (
          <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        <PriceText min={priceMin} max={priceMax} label={currencyLabel} />
        {physicianView ? (
          <Button asChild size="lg" variant="outline" className="mt-auto h-10 w-full text-sm">
            <Link href={`/manage/services/${id}`}>ویرایش خدمت</Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="mt-auto h-10 w-full text-sm">
            <Link href={`/services/${id}`}>درخواست رزرو</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
