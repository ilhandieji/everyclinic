export function CountBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }
  const text = count > 99 ? "99+" : String(count);
  return (
    <span
      dir="ltr"
      lang="en"
      className="ms-1 inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground"
      aria-hidden
    >
      {text}
    </span>
  );
}

export function UnreadHint({ count, label }: { count: number; label: string }) {
  if (count <= 0) {
    return null;
  }
  return (
    <>
      <CountBadge count={count} />
      <span className="sr-only">{`${count} ${label}`}</span>
    </>
  );
}
