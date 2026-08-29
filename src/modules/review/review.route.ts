import { Router } from "express";

import { reviewController } from "./review.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = Router();

// Customer creates a review for a completed job
router.post("/", auth(Role.CUSTOMER), reviewController.createReview);

// Public route: Get all reviews for a technician
router.get("/technician/:technicianId", reviewController.getTechnicianReviews);

export const reviewRoutes = router;