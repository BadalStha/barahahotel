-- Completes the pivot to the room-centric model (RoomEntry/RoomCharge)
-- and adds MenuItem for the CMS dining menu. Legacy booking-era tables
-- (Booking, Guest, FoodMenuItem, FoodOrder, FoodOrderItem) are dropped;
-- their rows were exported to prisma/legacy-backup.json before migrating.

-- The single pre-pivot Invoice row references the old bookingId column
-- and blocks adding the required roomEntryId — remove it.
DELETE FROM "Invoice" WHERE "bookingId" IS NOT NULL;

-- CreateEnum
CREATE TYPE "RoomEntryStatus" AS ENUM ('OCCUPIED', 'CHECKED_OUT');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_guestId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_roomId_fkey";

-- DropForeignKey
ALTER TABLE "FoodOrder" DROP CONSTRAINT "FoodOrder_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "FoodOrderItem" DROP CONSTRAINT "FoodOrderItem_foodMenuItemId_fkey";

-- DropForeignKey
ALTER TABLE "FoodOrderItem" DROP CONSTRAINT "FoodOrderItem_foodOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_bookingId_fkey";

-- DropIndex
DROP INDEX "Invoice_bookingId_key";

-- DropIndex
DROP INDEX "Testimonial_isPublished_idx";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "bookingId",
DROP COLUMN "foodTotal",
ADD COLUMN     "chargeTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "roomEntryId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "FoodMenuItem";

-- DropTable
DROP TABLE "FoodOrder";

-- DropTable
DROP TABLE "FoodOrderItem";

-- DropTable
DROP TABLE "Guest";

-- DropEnum
DROP TYPE "BookingSource";

-- DropEnum
DROP TYPE "BookingStatus";

-- DropEnum
DROP TYPE "FoodCategory";

-- DropEnum
DROP TYPE "FoodOrderStatus";

-- CreateTable
CREATE TABLE "RoomEntry" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT,
    "numGuests" INTEGER NOT NULL DEFAULT 1,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3),
    "ratePerNight" DECIMAL(10,2) NOT NULL,
    "status" "RoomEntryStatus" NOT NULL DEFAULT 'OCCUPIED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomCharge" (
    "id" TEXT NOT NULL,
    "roomEntryId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "priceAtAdd" DECIMAL(10,2) NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "category" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomEntry_roomId_idx" ON "RoomEntry"("roomId");

-- CreateIndex
CREATE INDEX "RoomEntry_status_idx" ON "RoomEntry"("status");

-- CreateIndex
CREATE INDEX "RoomEntry_checkIn_idx" ON "RoomEntry"("checkIn");

-- CreateIndex
CREATE INDEX "RoomCharge_roomEntryId_idx" ON "RoomCharge"("roomEntryId");

-- CreateIndex
CREATE INDEX "MenuItem_isAvailable_sortOrder_idx" ON "MenuItem"("isAvailable", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_roomEntryId_key" ON "Invoice"("roomEntryId");

-- AddForeignKey
ALTER TABLE "RoomEntry" ADD CONSTRAINT "RoomEntry_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomCharge" ADD CONSTRAINT "RoomCharge_roomEntryId_fkey" FOREIGN KEY ("roomEntryId") REFERENCES "RoomEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_roomEntryId_fkey" FOREIGN KEY ("roomEntryId") REFERENCES "RoomEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
