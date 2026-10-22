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
  const range = min === max ? String(min) : `${min} – ${max}`;
  return (
    <p className="text-sm text-foreground">
      <span dir="ltr" lang="en">
        {range}
      </span>
      {label ? <span> {label}</span> : null}
    </p>
  );
}
