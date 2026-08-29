import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status'
const registerUser=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
  const payload=req.body
    const user=await userService.registerUserIntoDb(payload)

     sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: user,
    });
})

const myProfile=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const profile=await userService.myProfileFromDb(req.user?.id as string)

    
   sendResponse(res,{
    success:true,
    statusCode:httpStatus.OK,
    message:"User Profile Fetched Successfully",
    data:{
        profile
    }
})

})



export const userController={
    registerUser,
    myProfile
}