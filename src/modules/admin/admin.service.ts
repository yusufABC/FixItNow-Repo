import { BookingStatus, CustomerStatus, Role } from "../../../generated/prisma/enums";
import prisma from "../../lib/prisma";

// 1. Get all users with search and filter
const getAllUsersFromDb = async (query: {
  searchTerm?: string;
  role?: Role;
  status?: CustomerStatus ;
}) => {
  const { searchTerm, role, status } = query;

  const whereConditions: any = {};

  if (searchTerm) {
    whereConditions.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (role) {
    whereConditions.role = role;
  }

  if (status) {
    whereConditions.status = status;
  }

  const users = await prisma.user.findMany({
    where: whereConditions,
    select: {
      id: true,
      name: true,
      email: true,
     
      role: true,
      status: true,
      createdAt: true,
      technicianProfile: {
        select: {
          id: true,
          location: true,
          averageRating: true,
          totalReviews: true,
          yearOfExperience: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

// 2. Update User Status (Ban / Unban)
const updateUserStatusInDb = async (
  adminId: string,
  targetUserId: string,
  newStatus: CustomerStatus
) => {
  // Prevent admin from banning themselves
  if (adminId === targetUserId) {
    throw new Error("You cannot change your own admin account status");
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { status: newStatus },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// 3. Get all bookings across the platform
const getAllBookingsFromDb = async (query: { status?: BookingStatus }) => {
  const { status } = query;

  const whereConditions: any = {};
  if (status) {
    whereConditions.status = status;
  }

  const bookings = await prisma.bookings.findMany({
    where: whereConditions,
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      technician: {
        include: {
          user: {
            select: { id: true, name: true, email: true},
          },
        },
      },
      service: {
        select: { id: true, title: true, price: true },
      },
      subscription: true,
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings;
};

// 4. Platform Analytics & Stats Overview
const getPlatformStatsFromDb = async () => {
  const [totalUsers, totalCustomers, totalTechnicians, totalBookings, revenueAgg] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.CUSTOMER } }),
      prisma.user.count({ where: { role: Role.TECHNICIAN } }),
      prisma.bookings.count(),
      prisma.subscription.aggregate({
        _sum: { amount: true },
      }),
    ]);

  const totalRevenue = revenueAgg._sum.amount || 0;

  return {
    totalUsers,
    totalCustomers,
    totalTechnicians,
    totalBookings,
    totalRevenue,
  };
};

export const adminService = {
  getAllUsersFromDb,
  updateUserStatusInDb,
  getAllBookingsFromDb,
  getPlatformStatsFromDb,
};