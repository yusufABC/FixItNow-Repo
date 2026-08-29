import { Router } from "express";
import { auth } from "../../middleware/auth";
import { adminController } from "./admin.controller";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Apply Admin Auth guard to all routes in this router
router.use(auth(Role.ADMIN));

// User Management
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/status", adminController.updateUserStatus);

// Bookings Oversight
router.get("/bookings", adminController.getAllBookings);

// Platform Analytics
router.get("/stats", adminController.getPlatformStats);

// Category Management (POST & GET)
router.post("/categories", adminController.createCategory);
router.get("/categories", adminController.getAllCategories);
router.get("/categories/:id", adminController.getCategoryById);

export const adminRoutes = router;