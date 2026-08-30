import Stripe from "stripe";

import config from "../../config";
import prisma from "../../lib/prisma";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { stripe } from "../../lib/stripe";

const createCheckoutSession = async (customerId: string, bookingId: string) => {
  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== customerId) {
    throw new Error("You are not authorized to pay for this booking");
  }

  if (booking.status !== BookingStatus.ACCEPTED) {
    throw new Error(
      `Cannot initiate payment for a booking with status "${booking.status}". Only ACCEPTED bookings can be paid.`
    );
  }

  const clientUrl = config.app_url || process.env.CLIENT_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: booking.customer.email,
    line_items: [
      {
        price_data: {
          currency: "usd", // or "bdt"
          product_data: {
            name: booking.service.title,
            description: booking.service.description,
          },
          unit_amount: Math.round(booking.totalAmount * 100), // In cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      userId: customerId,
    },
    success_url: `${clientUrl}/booking/success?bookingId=${booking.id}`,
    cancel_url: `${clientUrl}/booking/cancelled?bookingId=${booking.id}`,
  });

  return { url: session.url, sessionId: session.id };
};

// =========================================================================
// 2. HELPER: Handle checkout.session.completed
// =========================================================================
const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
  const bookingId = session.metadata?.bookingId;
  const userId = session.metadata?.userId;
  const amountTotal = (session.amount_total || 0) / 100;
  const transactionId = (session.payment_intent as string) || session.id;

  if (!bookingId || !userId) {
    console.error("⚠️ Webhook Warning: Missing bookingId or userId in metadata");
    return;
  }

  // 1. Check if the booking actually exists first
  const existingBooking = await prisma.bookings.findUnique({
    where: { id: bookingId },
  });

  if (!existingBooking) {
    console.error(`⚠️ Booking with id ${bookingId} not found in database.`);
    return;
  }

  // 2. Perform updates
  try {
    await prisma.$transaction(async (tx) => {
      // Update Booking status
      await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.PAID,
        },
      });

      // Upsert Subscription
      await tx.subscription.upsert({
        where: { bookingId },
        update: {
          subscriptionStatus: PaymentStatus.COMPLETED,
          transactionId: transactionId,
          amount: amountTotal,
        },
        create: {
          userId,
          bookingId,
          transactionId: transactionId,
          amount: amountTotal,
          subscriptionStatus: PaymentStatus.COMPLETED,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeCustomerId: (session.customer as string) || `cust_${userId}_${Date.now()}`,
          stripeSubscriptionId: (session.subscription as string) || `sub_${session.id}_${Date.now()}`,
        },
      });
    });

    console.log(`🎉 SUCCESS: Booking [${bookingId}] marked as PAID and saved in Subscription table!`);
  } catch (error: any) {
    console.error("💥 PRISMA DATABASE ERROR:", error.message);
    throw error;
  }
};


const handleChangeSubscription = async (subscription: Stripe.Subscription) => {
  const stripeSubscriptionId = subscription.id;
  const stripeCustomerId = subscription.customer as string;
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);

  let status: PaymentStatus = PaymentStatus.PENDING;
  if (subscription.status === "active" || subscription.status === "trialing") {
    status = PaymentStatus.COMPLETED;
  } else if (
    subscription.status === "past_due" ||
    subscription.status === "unpaid" ||
    subscription.status === "canceled"
  ) {
    status = PaymentStatus.FAILED;
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId },
        { stripeCustomerId },
      ],
    },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        subscriptionStatus: status,
        currentPeriodEnd,
      },
    });
    console.log(`✅ Subscription [${stripeSubscriptionId}] updated in DB.`);
  }
};


const handleSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
  const stripeSubscriptionId = subscription.id;

  const existingSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });

  if (existingSubscription) {
    await prisma.subscription.update({
      where: { id: existingSubscription.id },
      data: {
        subscriptionStatus: PaymentStatus.FAILED,
      },
    });
    console.log(`ℹ️ Subscription [${stripeSubscriptionId}] marked as FAILED/CANCELLED.`);
  }
};

const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleChangeSubscription(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    default:
      console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
      break;
  }
};

export const paymentService = {
  createCheckoutSession,
  handleStripeWebhook,
};