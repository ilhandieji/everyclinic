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

function amountLang(label: string | null): { dir: "ltr"; lang: "en" | "fa-IR" } {
  return usesLatinNumerals(label)
    ? { dir: "ltr", lang: "en" }
    : { dir: "ltr", lang: "fa-IR" };
}

export function PriceText({
  min,
  max,
  label,
}: {
  min: number | null;
  max: number | null;
  label: string | null;
}) {
  if (min == null || max == null) {
    return null;
  }

  const amountProps = amountLang(label);

  const rangeText =
    min === max
      ? `${formatAmount(min, label)}${label ? ` ${label}` : ""}`
      : `${formatAmount(min, label)} الی ${formatAmount(max, label)}${label ? ` ${label}` : ""}`;

  return (
    <p className="text-base font-medium text-foreground">
      <span {...amountProps}>{rangeText}</span>
    </p>
  );
}
