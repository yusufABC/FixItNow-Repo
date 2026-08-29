import bcrypt from "bcryptjs";

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import { IloginUser } from "./authInterface";
import prisma from "../../lib/prisma";
const loginUser = async (payload: IloginUser) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: { email },
  });

  if (user.status === "BANNED") {
    throw new Error("Your account is suspended. Please contact support.");
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password is incorrect");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
//   const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret, {
//     expiresIn: config.jwt_access_expires_in,
//   } as SignOptions);

const accessToken=jwtUtils.createJwt(jwtPayload,config.jwt_access_secret,config.jwt_access_expires_in as SignOptions)
//   const refreshToken = jwt.sign(jwtPayload, config.jwt_refresh_secret, {
//     expiresIn: config.jwt_refresh_expires_in,
//   } as SignOptions);

const refreshToken=jwtUtils.createJwt(jwtPayload,config.jwt_refresh_secret,config.jwt_refresh_expires_in as SignOptions)

  return {
    accessToken,
    refreshToken
  }
};

const refreshToken=async(refreshToken:string)=>{

  const verifyRefreshToken=jwtUtils.verifyToken(refreshToken,config.jwt_refresh_secret)
  if(!verifyRefreshToken.success){
    throw new Error(verifyRefreshToken.error)
  }
  const {id}=verifyRefreshToken as JwtPayload

  const user=await prisma.user.findFirstOrThrow({
    where:{id}

  })

  if(user.status==='BANNED'){
    throw new Error("You are Blocked!")
  }

  const jwtPayload={
    id,
    name:user.name,
    email:user.email,
    role:user.role
  }

  const accessToken=jwtUtils.createJwt(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions
  )
  return {accessToken}
}

export const authService = {
  loginUser,
  refreshToken
};
