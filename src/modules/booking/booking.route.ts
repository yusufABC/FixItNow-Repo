
import { Router } from "express";
import { bookingController } from "./booking.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Customer creates booking
router.post("/", auth(Role.CUSTOMER), bookingController.createBooking);

// Customer views their own bookings
router.get("/my-bookings", auth(Role.CUSTOMER), bookingController.getMyBookings);

// Technician views incoming bookings
router.get("/technician/all", auth(Role.TECHNICIAN), bookingController.getTechnicianBookings);

// Technician updates booking status (ACCEPT, DECLINE, IN_PROGRESS, COMPLETED)
router.patch(
  "/technician/:id/status",
  auth(Role.TECHNICIAN),
  bookingController.updateBookingStatus
);

// Customer cancels a booking
router.patch("/:id/cancel", auth(Role.CUSTOMER), bookingController.cancelBooking);

// Get single booking details
router.get("/:id", auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), bookingController.getBookingById);



export const bookingRouter = router;