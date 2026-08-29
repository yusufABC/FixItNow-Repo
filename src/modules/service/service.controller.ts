import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { serviceService } from "./service.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status'
const createService=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
const payload=req.body
const userId=req.user?.id
const result=await serviceService.createServiceIntoDb(userId as string,payload)
   
 sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Service created successfully",
    data: result,
  });
});


const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await serviceService.getAllServicesFromDb(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Services fetched successfully",
    data: result,
  });
});

const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await serviceService.getServiceByIdFromDb(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Service fetched successfully",
    data: result,
  });
});

export const serviceController = {
  createService,
  getAllServices,
  getServiceById,
};