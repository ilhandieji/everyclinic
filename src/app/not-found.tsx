import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-foreground">این صفحه پیدا نشد.</h1>
      <Button asChild className="h-11">
        <Link href="/">بازگشت به خانه</Link>
      </Button>
    </div>
  );
}
