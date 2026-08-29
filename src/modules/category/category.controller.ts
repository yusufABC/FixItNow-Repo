import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status'
 const createCategories=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
const payload=req.body
const result =await categoryService.createCategoryIntoDb(payload)
sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });

})

const getAllCategories=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result=await categoryService.getAllCategoriesFromDb()

    sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "All Categories fetched successfully",
    data: result,
  });
})


const getCategoryById=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const {id}=req.params
    const result=await categoryService.getCategoryByIdFromDb(id as string)

    sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
})

export const categoryController={
createCategories,
getAllCategories,
getCategoryById
}
