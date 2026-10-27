-- In-app notifications, prescriptions, medication status history, and follow-up reminders.

CREATE TYPE "notification_category" AS ENUM ('service_request', 'reminder', 'medication');

CREATE TYPE "medication_status" AS ENUM ('active', 'completed', 'discontinued');

CREATE TYPE "follow_up_reminder_status" AS ENUM ('pending', 'completed', 'cancelled');

CREATE TYPE "reminder_delivery_kind" AS ENUM ('created', 'due');

CREATE TYPE "reminder_delivery_channel" AS ENUM ('in_app');

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_user_id" TEXT NOT NULL,
    "category" "notification_category" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dedupe_key" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "patient_profile_id" TEXT NOT NULL,
    "physician_profile_id" TEXT NOT NULL,
    "authored_by_user_id" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "notes" TEXT,
    "prescribed_at" TIMESTAMP(3) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "renews_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "medication_status_events" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "status" "medication_status" NOT NULL,
    "authored_by_user_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "note" TEXT,

    CONSTRAINT "medication_status_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "follow_up_reminders" (
    "id" TEXT NOT NULL,
    "patient_profile_id" TEXT NOT NULL,
    "physician_profile_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "status" "follow_up_reminder_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_up_reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reminder_deliveries" (
    "id" TEXT NOT NULL,
    "reminder_id" TEXT NOT NULL,
    "kind" "reminder_delivery_kind" NOT NULL,
    "channel" "reminder_delivery_channel" NOT NULL DEFAULT 'in_app',
    "idempotency_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reminder_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notifications_dedupe_key_key" ON "notifications"("dedupe_key");

CREATE INDEX "notifications_recipient_user_id_created_at_idx" ON "notifications"("recipient_user_id", "created_at");

CREATE UNIQUE INDEX "prescriptions_renews_id_key" ON "prescriptions"("renews_id");

CREATE INDEX "prescriptions_patient_profile_id_prescribed_at_idx" ON "prescriptions"("patient_profile_id", "prescribed_at");

CREATE INDEX "medication_status_events_prescription_id_occurred_at_idx" ON "medication_status_events"("prescription_id", "occurred_at");

CREATE INDEX "follow_up_reminders_patient_profile_id_due_at_idx" ON "follow_up_reminders"("patient_profile_id", "due_at");

CREATE INDEX "follow_up_reminders_status_due_at_idx" ON "follow_up_reminders"("status", "due_at");

CREATE UNIQUE INDEX "reminder_deliveries_idempotency_key_key" ON "reminder_deliveries"("idempotency_key");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_physician_profile_id_fkey" FOREIGN KEY ("physician_profile_id") REFERENCES "physician_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_authored_by_user_id_fkey" FOREIGN KEY ("authored_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_renews_id_fkey" FOREIGN KEY ("renews_id") REFERENCES "prescriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "medication_status_events" ADD CONSTRAINT "medication_status_events_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medication_status_events" ADD CONSTRAINT "medication_status_events_authored_by_user_id_fkey" FOREIGN KEY ("authored_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "follow_up_reminders" ADD CONSTRAINT "follow_up_reminders_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "follow_up_reminders" ADD CONSTRAINT "follow_up_reminders_physician_profile_id_fkey" FOREIGN KEY ("physician_profile_id") REFERENCES "physician_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "follow_up_reminders" ADD CONSTRAINT "follow_up_reminders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reminder_deliveries" ADD CONSTRAINT "reminder_deliveries_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "follow_up_reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
