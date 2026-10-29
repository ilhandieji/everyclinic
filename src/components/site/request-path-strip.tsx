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
      className={cn("scroll-mt-24 border-t border-border/70 bg-background", className)}
    >
      <div className={cn(siteShellClass, "flex flex-col gap-6 py-8 md:gap-8 md:py-10")}>
        <div className="mx-auto max-w-[48rem] text-center">
          <h2 id="request-path-heading" className="text-lg font-semibold text-foreground md:text-xl">
            چطور درخواست بدهم
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground md:text-base">
            نوبت را پزشک هماهنگ می‌کند. ثبت درخواست به‌معنای وقت قطعی نیست.
          </p>
        </div>
        <ol className="grid list-none grid-cols-2 gap-x-3 gap-y-8 min-[900px]:grid-cols-4 min-[900px]:gap-x-5 min-[900px]:gap-y-0">
          {requestPathSteps.map((step, index) => (
            <li
              key={step.title}
              className="flex min-w-0 flex-col items-center gap-3 text-center md:gap-3.5"
            >
              <span
                className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-primary md:size-[3.35rem]"
                aria-hidden="true"
              >
                <JourneyIcon
                  name={step.icon}
                  strokeWidth={2.35}
                  className="size-8 md:size-9"
                />
              </span>
              <div className="flex min-w-0 flex-col gap-1 px-0.5">
                <p className="text-sm font-semibold text-foreground">
                  <span className="sr-only">{`مرحله ${index + 1}: `}</span>
                  {step.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
