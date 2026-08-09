-- CreateIndex
CREATE INDEX "Booking_roomId_checkIn_checkOut_idx" ON "Booking"("roomId", "checkIn", "checkOut");

-- CreateIndex
CREATE UNIQUE INDEX "FoodMenuItem_name_key" ON "FoodMenuItem"("name");

-- CreateIndex
CREATE INDEX "Guest_email_idx" ON "Guest"("email");

