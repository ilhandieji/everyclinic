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

  return (
    <p className="text-base font-medium text-foreground">
      {min === max ? (
        <>
          <span {...amountProps}>{formatAmount(min, label)}</span>
          {label ? <span> {label}</span> : null}
        </>
      ) : (
        <>
          <span {...amountProps}>{formatAmount(min, label)}</span>
          {" الی "}
          <span {...amountProps}>{formatAmount(max, label)}</span>
          {label ? <span> {label}</span> : null}
        </>
      )}
    </p>
  );
}
