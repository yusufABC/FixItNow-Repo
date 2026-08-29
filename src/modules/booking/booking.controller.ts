import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { bookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await bookingService.createBookingIntoDb(customerId!, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Booking request created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await bookingService.getCustomerBookingsIntoDb(customerId!);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Customer bookings fetched successfully",
    data: result,
  });
});

const getTechnicianBookings = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await bookingService.getTechnicianBookingsFromDb(userId!);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician bookings fetched successfully",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { status } = req.body;

  const result = await bookingService.updateBookingStatusByTechnician(userId!, id as string, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Booking status updated to ${status}`,
    data: result,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const { id } = req.params;

  const result = await bookingService.cancelBookingByCustomer(customerId!, id as string );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = await bookingService.getBookingByIdFromDb(userId!, id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Booking details fetched successfully",
    data: result,
  });
});

export const bookingController = {
  createBooking,
  getMyBookings,
  getTechnicianBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingById,
};
