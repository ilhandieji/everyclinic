-- Physician-wide booking days and windows. A service request may reserve one window.

CREATE TABLE "booking_days" (
    "id" TEXT NOT NULL,
    "physician_profile_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_days_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "booking_days_physician_profile_id_date_key" ON "booking_days"("physician_profile_id", "date");

CREATE INDEX "booking_days_physician_profile_id_date_idx" ON "booking_days"("physician_profile_id", "date");

ALTER TABLE "booking_days" ADD CONSTRAINT "booking_days_physician_profile_id_fkey" FOREIGN KEY ("physician_profile_id") REFERENCES "physician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "booking_windows" (
    "id" TEXT NOT NULL,
    "booking_day_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_windows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "booking_windows_booking_day_id_start_time_end_time_key" ON "booking_windows"("booking_day_id", "start_time", "end_time");

CREATE INDEX "booking_windows_booking_day_id_idx" ON "booking_windows"("booking_day_id");

ALTER TABLE "booking_windows" ADD CONSTRAINT "booking_windows_booking_day_id_fkey" FOREIGN KEY ("booking_day_id") REFERENCES "booking_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "service_requests" ADD COLUMN "booking_window_id" TEXT;
ALTER TABLE "service_requests" ADD COLUMN "exact_visit_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "service_requests_booking_window_id_key" ON "service_requests"("booking_window_id");

ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_booking_window_id_fkey" FOREIGN KEY ("booking_window_id") REFERENCES "booking_windows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
