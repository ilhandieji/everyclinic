-- Widen prices so they can store the existing check bound of 1000000000000.
ALTER TABLE "medical_services"
  ALTER COLUMN "price_min" TYPE BIGINT,
  ALTER COLUMN "price_max" TYPE BIGINT;

-- The public site is one physician row. Reject any other singleton value.
ALTER TABLE "physician_profiles"
  ADD CONSTRAINT "physician_profiles_singleton_is_one" CHECK ("singleton" = 1);
