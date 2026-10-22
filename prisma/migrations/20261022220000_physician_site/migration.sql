-- CreateEnum
CREATE TYPE "service_request_status" AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physician_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "singleton" INTEGER NOT NULL DEFAULT 1,
    "display_name" TEXT,
    "gender" TEXT,
    "bio" TEXT,
    "photo_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "physician_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_services" (
    "id" TEXT NOT NULL,
    "physician_profile_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price_min" INTEGER,
    "price_max" INTEGER,
    "currency_label" TEXT,
    "image_key" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_sections" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "patient_profile_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "note" TEXT,
    "status" "service_request_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_relationships" (
    "id" TEXT NOT NULL,
    "physician_profile_id" TEXT NOT NULL,
    "patient_profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "care_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_user_id_key" ON "patient_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "physician_profiles_user_id_key" ON "physician_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "physician_profiles_singleton_key" ON "physician_profiles"("singleton");

-- CreateIndex
CREATE INDEX "medical_services_physician_profile_id_sort_order_idx" ON "medical_services"("physician_profile_id", "sort_order");

-- CreateIndex
CREATE INDEX "service_sections_service_id_sort_order_idx" ON "service_sections"("service_id", "sort_order");

-- CreateIndex
CREATE INDEX "service_requests_patient_profile_id_status_idx" ON "service_requests"("patient_profile_id", "status");

-- CreateIndex
CREATE INDEX "service_requests_service_id_status_idx" ON "service_requests"("service_id", "status");

-- One open request per patient and service.
CREATE UNIQUE INDEX "service_requests_one_pending" ON "service_requests"("patient_profile_id", "service_id") WHERE "status" = 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "care_relationships_physician_profile_id_patient_profile_id_key" ON "care_relationships"("physician_profile_id", "patient_profile_id");

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physician_profiles" ADD CONSTRAINT "physician_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_services" ADD CONSTRAINT "medical_services_physician_profile_id_fkey" FOREIGN KEY ("physician_profile_id") REFERENCES "physician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_sections" ADD CONSTRAINT "service_sections_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "medical_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "medical_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_relationships" ADD CONSTRAINT "care_relationships_physician_profile_id_fkey" FOREIGN KEY ("physician_profile_id") REFERENCES "physician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_relationships" ADD CONSTRAINT "care_relationships_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "medical_services" ADD CONSTRAINT "medical_services_price_bounds" CHECK (
    ("price_min" IS NULL AND "price_max" IS NULL)
    OR (
        "price_min" IS NOT NULL
        AND "price_max" IS NOT NULL
        AND "price_min" >= 0
        AND "price_max" >= "price_min"
        AND "price_min" <= 1000000000000
        AND "price_max" <= 1000000000000
    )
);

-- Existing accounts stay patients. This does not create a physician.
INSERT INTO "patient_profiles" ("id", "user_id", "created_at")
SELECT 'pat_' || md5("id"), "id", CURRENT_TIMESTAMP
FROM "users" u
WHERE NOT EXISTS (
    SELECT 1 FROM "patient_profiles" p WHERE p."user_id" = u."id"
);
