import express, { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Customer creates checkout session
router.post(
  "/create-checkout-session",
  auth(Role.CUSTOMER),
  paymentController.createCheckoutSession
);

// Stripe Webhook Endpoint (Raw Body Buffer)
router.post(
  "/webhook",
  paymentController.stripeWebhookListener
);

export const paymentRoutes = router;