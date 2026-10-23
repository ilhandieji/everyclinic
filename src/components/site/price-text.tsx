function formatAmount(value: number) {
  return value.toLocaleString("en-US").replaceAll(",", "،");
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

  return (
    <p className="text-sm text-foreground">
      {min === max ? (
        <>
          <span dir="ltr" lang="en">
            {formatAmount(min)}
          </span>
          {label ? <span> {label}</span> : null}
        </>
      ) : (
        <>
          <span dir="ltr" lang="en">
            {formatAmount(min)}
          </span>
          {" الی "}
          <span dir="ltr" lang="en">
            {formatAmount(max)}
          </span>
          {label ? <span> {label}</span> : null}
        </>
      )}
    </p>
  );
}
