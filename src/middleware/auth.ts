import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import prisma from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        id: string;
        role: Role;
      };
    }
  }
}

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.headers.authorization;
    if (!token) {
      throw new Error("You are not logged in.Please logging");
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.jwt_access_secret);

    if (verifiedToken.success === false) {
      throw new Error(verifiedToken.error);
    }

    const { name, email, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length >0 && !requiredRoles.includes(role)) {
      throw new Error("Forbidden you don't have access to this resource");
    }
    const user = await prisma.user.findUnique({
      where: {
        id
      },
    });
    console.log(user);
    if (!user) {
      throw new Error("User not found! Please loggin");
    }
    if (user.status === 'BANNED') {
      throw new Error("Your account has been blocked.Please contact support");
    }

    req.user = {
      id,
      name,
      email,
      role,
    };
    next();
  });
};
