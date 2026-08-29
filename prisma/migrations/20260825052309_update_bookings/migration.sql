-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "address" DROP NOT NULL;
