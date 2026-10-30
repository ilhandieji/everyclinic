import { cn } from "@/lib/utils";

/** Dollar keeps Latin digits; تومان and ریال use Persian locale formatting. */
function usesLatinNumerals(label: string | null) {
  return label === "دلار";
}

function formatAmount(value: number, label: string | null) {
  if (usesLatinNumerals(label)) {
    return value.toLocaleString("en-US").replaceAll(",", "،");
  }
  return value.toLocaleString("fa-IR");
}

function amountLang(label: string | null): "en" | "fa-IR" {
  return usesLatinNumerals(label) ? "en" : "fa-IR";
}

function PriceAmount({ value, label }: { value: number; label: string | null }) {
  return (
    <span dir="ltr" lang={amountLang(label)} className="tabular-nums whitespace-nowrap">
      {formatAmount(value, label)}
    </span>
  );
}

export function PriceText({
  min,
  max,
  label,
  className,
}: {
  min: number | null;
  max: number | null;
  label: string | null;
  className?: string;
}) {
  if (min == null || max == null) {
    return null;
  }

  return (
    <p
      dir="rtl"
      lang="fa-IR"
      className={cn(
        "flex w-full flex-wrap items-baseline justify-start gap-x-1.5 text-base font-medium text-foreground",
        className,
      )}
    >
      {min === max ? (
        <>
          <PriceAmount value={min} label={label} />
          {label ? <span className="shrink-0">{label}</span> : null}
        </>
      ) : (
        <>
          <PriceAmount value={min} label={label} />
          <span className="shrink-0">الی</span>
          <PriceAmount value={max} label={label} />
          {label ? <span className="shrink-0">{label}</span> : null}
        </>
      )}
    </p>
  );
}
