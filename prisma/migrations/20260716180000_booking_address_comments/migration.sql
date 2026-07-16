-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "comments" TEXT;

ALTER TABLE "Booking" ALTER COLUMN "address" DROP DEFAULT;
