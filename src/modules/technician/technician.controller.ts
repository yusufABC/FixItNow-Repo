import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { technicianService } from "./technician.service";

// Public: Get all technicians
const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getAllTechniciansFromDb(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technicians fetched successfully",
    data: result,
  });
});

// Public: Get technician profile by ID
const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await technicianService.getTechnicianByIdFromDb(id as string );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician profile fetched successfully",
    data: result,
  });
});

// Protected: Update own profile
const updateTechnicianProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await technicianService.updateTechnicianProfileInDb(userId!, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician profile updated successfully",
    data: result,
  });
});

// Protected: Update availability slots
const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await technicianService.updateAvailabilityInDb(userId!, req.body.slots);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Availability slots updated successfully",
    data: result,
  });
});

export const technicianController = {
  getAllTechnicians,
  getTechnicianById,
  updateTechnicianProfile,
  updateAvailability,
};