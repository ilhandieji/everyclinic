import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16">
      <p className="text-sm text-muted-foreground">این صفحه پیدا نشد.</p>
      <Link href="/" className="text-sm text-primary">
        بازگشت
      </Link>
    </div>
  );
}
