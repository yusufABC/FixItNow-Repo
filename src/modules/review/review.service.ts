
import { BookingStatus } from "../../../generated/prisma/enums";
import prisma from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";

const createReviewIntoDb = async (customerId: string, payload: ICreateReviewPayload) => {
  const { bookingId, rating, comment } = payload;

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  // 1. Verify booking exists
  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // 2. Validate ownership & completion status
  if (booking.customerId !== customerId) {
    throw new Error("You can only review your own bookings");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("You can only review a booking that has been COMPLETED");
  }

  if (booking.review) {
    throw new Error("You have already reviewed this booking");
  }

  // 3. Create review & recalculate technician average rating inside a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create review
    const newReview = await tx.review.create({
      data: {
        bookingId,
        customerId,
        technicianId: booking.technicianId,
        rating: Number(rating),
        comment,
      },
    });

    // Calculate new average rating for the technician
    const agg = await tx.review.aggregate({
      where: { technicianId: booking.technicianId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    // Update TechnicianProfile stats
    await tx.technicianProfile.update({
      where: { id: booking.technicianId },
      data: {
        averageRating: agg._avg.rating || 0,
        totalReviews: agg._count.rating || 0,
      },
    });

    return newReview;
  });

  return result;
};

// Get reviews for a technician profile
const getTechnicianReviewsFromDb = async (technicianId: string) => {
  const reviews = await prisma.review.findMany({
    where: { technicianId },
    include: {
      customer: {
        select: { id: true, name: true},
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

export const reviewService = {
  createReviewIntoDb,
  getTechnicianReviewsFromDb,
};