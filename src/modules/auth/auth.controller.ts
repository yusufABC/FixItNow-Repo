import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
import httpStatus from "http-status"
import config from "../../config";

const loginUser=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const payload=req.body
const {accessToken,refreshToken}=await authService.loginUser(payload)

const isProduction = config.env === "production";
res.cookie("accessToken",accessToken,{
    httpOnly:true,
     sameSite: isProduction ? "none" : "lax",
    secure:true,
    maxAge:7*24*60*60*1000*24
})


res.cookie("refreshToken",refreshToken,{
    httpOnly:true,
     sameSite: isProduction ? "none" : "lax",
    secure:true,
    maxAge:7*24*60*60*1000*24*7
})

sendResponse(res,{
    success:true,
    statusCode:httpStatus.CREATED,
    message:"User Logged In Sccessfully",
    data:{
        accessToken,
        refreshToken

    }
}

    
)

})


export const authController={
    loginUser
}