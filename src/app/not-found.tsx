import Link from "next/link";
import { HeroMark } from "@/components/site/hero-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <HeroMark className="max-w-xs" />
      <h1 className="text-xl font-semibold text-foreground">این صفحه پیدا نشد.</h1>
      <Button asChild>
        <Link href="/">بازگشت به خانه</Link>
      </Button>
    </div>
  );
}
