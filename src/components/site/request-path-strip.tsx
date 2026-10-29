import { siteShellClass } from "@/components/layout/site-shell";
import { JourneyIcon, type JourneyIconName } from "@/components/site/service-icon";
import { cn } from "@/lib/utils";

const requestPathSteps: {
  icon: JourneyIconName;
  title: string;
  description: string;
}[] = [
  {
    icon: "browse",
    title: "انتخاب خدمت",
    description: "خدمت مورد نظر را باز کنید.",
  },
  {
    icon: "account",
    title: "ورود به حساب",
    description: "اگر وارد حساب نشده‌اید، وارد شوید.",
  },
  {
    icon: "note",
    title: "ثبت درخواست",
    description: "توضیح کوتاهی برای پزشک بنویسید و درخواست را ثبت کنید.",
  },
  {
    icon: "status",
    title: "پیگیری وضعیت",
    description:
      "وضعیت درخواست را در «درخواست‌های من» ببینید تا پزشک آن را بپذیرد یا رد کند.",
  },
];

/** Guest landing: four request steps in one row under the physician hero (reference clinic strip). */
export function RequestPathStrip({ className }: { className?: string }) {
  return (
    <section
      id="request-path"
      aria-labelledby="request-path-heading"
      className={cn("scroll-mt-24 border-t border-border/70 bg-muted/30", className)}
    >
      <div className={cn(siteShellClass, "flex flex-col gap-8 py-10 md:gap-10 md:py-12")}>
        <div className="mx-auto max-w-[48rem] text-center">
          <h2 id="request-path-heading" className="text-2xl font-semibold text-foreground md:text-3xl">
            چطور درخواست بدهم
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-base">
            نوبت را پزشک هماهنگ می‌کند. ثبت درخواست به‌معنای وقت قطعی نیست.
          </p>
        </div>
        <ol className="grid list-none grid-cols-1 gap-8 sm:grid-cols-2 min-[900px]:grid-cols-4 min-[900px]:gap-x-6 min-[900px]:gap-y-0">
          {requestPathSteps.map((step, index) => (
            <li
              key={step.title}
              aria-label={`مرحله ${index + 1}: ${step.title}. ${step.description}`}
              className="relative flex min-w-0 flex-col items-center gap-3 text-center md:gap-3.5 min-[900px]:px-2"
            >
              {index < requestPathSteps.length - 1 ? (
                <span
                  className="pointer-events-none absolute top-6 hidden h-px w-[calc(100%-3rem)] bg-border min-[900px]:block min-[900px]:start-[calc(50%+1.75rem)] min-[900px]:w-[calc(100%-3.5rem)]"
                  aria-hidden="true"
                />
              ) : null}
              <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-primary ring-1 ring-border/60 md:size-14">
                <span className="absolute -top-1 -start-1 grid size-5 place-items-center rounded-full bg-primary text-[0.65rem] font-semibold tabular-nums text-primary-foreground">
                  {(index + 1).toLocaleString("fa-IR")}
                </span>
                <JourneyIcon
                  name={step.icon}
                  strokeWidth={2.35}
                  className="size-7 md:size-8"
                />
              </span>
              <div className="flex min-w-0 flex-col gap-1.5 px-0.5">
                <p className="text-sm font-semibold text-foreground sm:text-base">{step.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
