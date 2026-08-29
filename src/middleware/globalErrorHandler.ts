import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = err.message || "Internal Server Error";
  let errorDetails: any = null;

  // 1. Prisma Validation Errors (Unknown field, missing field, wrong type)
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma Validation Error";

    // Extract ONLY the clean last sentence (removes file paths & ASCII code blocks)
    const lines = err.message
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Get the actual human-readable reason (usually the last line)
    const cleanReason = lines[lines.length - 1] || "Invalid field types or missing fields.";
    errorDetails = cleanReason;
  }
  // 2. Prisma Known Database Request Errors (Duplicate key, not found, etc.)
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      message = "Duplicate Key Error";
      const target = (err.meta?.target as string[])?.join(", ") || "field";
      errorDetails = `A record with this ${target} already exists.`;
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Foreign Key Constraint Failed";
      errorDetails = `Referenced record in field ${err.meta?.field_name || "relation"} does not exist.`;
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      message = "Record Not Found";
      errorDetails = (err.meta?.cause as string) || "Requested record was not found.";
    } else {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Database Request Error";
      errorDetails = err.message;
    }
  }
  // 3. Prisma Connection Errors
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Database Connection Failed";
    errorDetails = "Cannot connect to the database server. Please check your credentials.";
  }
  // 4. Standard JavaScript / Custom Errors
  else if (err instanceof Error) {
    message = err.message;
    errorDetails = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};