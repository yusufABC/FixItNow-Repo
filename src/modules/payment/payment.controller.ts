import { Request, Response } from "express";
import httpStatus from "http-status";
import Stripe from "stripe";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
import { stripe } from "../../lib/stripe";
import config from "../../config";

// 1. Create Checkout Session
const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const { bookingId } = req.body;

  const result = await paymentService.createCheckoutSession(customerId!, bookingId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe checkout session created successfully",
    data: result,
  });
});

// 2. Stripe Webhook Listener
const stripeWebhookListener = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = config.stripe_webhook_secret;

  if (!sig || !webhookSecret) {
    res.status(400).send("Webhook Error: Missing Stripe signature or webhook secret");
    return;
  }

  let event: Stripe.Event;

  try {
    // Note: req.body MUST be raw Buffer
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Stripe Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    // Delegate event handling to the service
    await paymentService.handleStripeWebhook(event);
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("Webhook event processing failed:", err);
    res.status(500).json({ error: "Webhook handler internal failure" });
  }
};

export const paymentController = {
  createCheckoutSession,
  stripeWebhookListener,
};