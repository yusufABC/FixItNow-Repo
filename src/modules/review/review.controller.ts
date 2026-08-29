import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewService } from "./review.service";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await reviewService.createReviewIntoDb(customerId!, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const getTechnicianReviews = catchAsync(async (req: Request, res: Response) => {
  const { technicianId } = req.params;
  const result = await reviewService.getTechnicianReviewsFromDb(technicianId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Technician reviews fetched successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getTechnicianReviews,
};