-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "firstName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "lastName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "photos" JSONB;

-- CreateIndex
CREATE INDEX "Booking_email_idx" ON "Booking"("email");

-- Remove defaults after migration (optional cleanup for new required fields)
ALTER TABLE "Booking" ALTER COLUMN "firstName" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "lastName" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "phone" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "email" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "latitude" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "longitude" DROP DEFAULT;
