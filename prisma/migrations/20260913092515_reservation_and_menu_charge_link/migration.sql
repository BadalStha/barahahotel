-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('BOOKED', 'CHECKED_IN', 'CANCELLED', 'COMPLETED');

-- AlterTable
ALTER TABLE "RoomCharge" ADD COLUMN     "menuItemId" TEXT;

-- AlterTable
ALTER TABLE "RoomEntry" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "reservationId" TEXT;

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT,
    "numGuests" INTEGER NOT NULL DEFAULT 1,
    "roomTypeId" TEXT NOT NULL,
    "roomId" TEXT,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "nights" INTEGER NOT NULL DEFAULT 1,
    "status" "ReservationStatus" NOT NULL DEFAULT 'BOOKED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reservation_roomTypeId_idx" ON "Reservation"("roomTypeId");

-- CreateIndex
CREATE INDEX "Reservation_status_arrivalDate_idx" ON "Reservation"("status", "arrivalDate");

-- CreateIndex
CREATE INDEX "RoomCharge_menuItemId_idx" ON "RoomCharge"("menuItemId");

-- CreateIndex
CREATE INDEX "RoomEntry_archivedAt_idx" ON "RoomEntry"("archivedAt");

-- AddForeignKey
ALTER TABLE "RoomEntry" ADD CONSTRAINT "RoomEntry_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomCharge" ADD CONSTRAINT "RoomCharge_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
