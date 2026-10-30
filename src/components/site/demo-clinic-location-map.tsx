import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sample clinic pin for the public landing page until real address data exists. */
const WHITE_HOUSE_MAPS_URL =
  "https://www.google.com/maps/place/The+White+House/@38.8976763,-77.0365297,17z/data=!3m1!4b1!4m6!3m5!1s0x89b7b7bcfec98583:0x662177b6147515!8m2!3d38.8976763!4d-77.0365297!16zL20vMjBjNg?entry=ttu";

const WHITE_HOUSE_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.989123456789!2d-77.036548!3d38.897676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7b7bcfec98583%3A0x662177b6147515!2sThe%20White%20House!5e0!3m2!1sen!2sus!4v1710000000000!5m2!1sen!2sus";

export function DemoClinicLocationMap({ className }: { className?: string }) {
  return (
    <figure className={cn("flex w-full min-w-0 flex-col gap-3 lg:contents", className)}>
      <div id="clinic-location" className="clinic-map-frame scroll-mt-24 lg:col-start-1 lg:row-start-2 lg:self-end">
        <iframe
          title="موقعیت نمونهٔ مطب — The White House"
          src={WHITE_HOUSE_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="clinic-map-frame__embed"
        />
      </div>
      <figcaption className="flex flex-col gap-1.5 text-sm text-muted-foreground lg:col-start-1 lg:row-start-3">
        <p className="flex items-start gap-2 leading-relaxed">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            <span className="font-medium text-foreground">موقعیت نمونهٔ مطب</span>
            {" — "}
            این آدرس فقط برای نمایش رابط است و جایگزین آدرس واقعی نیست.
          </span>
        </p>
        <p className="ps-6">
          <span dir="ltr" lang="en" className="font-medium text-foreground">
            The White House, 1600 Pennsylvania Avenue NW, Washington, DC
          </span>
        </p>
        <p className="ps-6">
          <a
            href={WHITE_HOUSE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring rounded-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            باز کردن در Google Maps
          </a>
        </p>
      </figcaption>
    </figure>
  );
}
