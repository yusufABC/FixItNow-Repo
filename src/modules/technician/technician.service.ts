import prisma from "../../lib/prisma";

// Public api
const getAllTechniciansFromDb = async (query: {
  searchTerm?: string;
  location?: string;
  minRating?: string;
}) => {
  const { searchTerm, location, minRating } = query;

  const whereConditions: any = {
    user: {
      status: "ACTIVE", 
    },
  };

  if (searchTerm) {
    whereConditions.OR = [
      { user: { name: { contains: searchTerm, mode: "insensitive" } } },
      { location: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (location) {
    whereConditions.location = { contains: location, mode: "insensitive" };
  }

  if (minRating) {
    whereConditions.averageRating = { gte: Number(minRating) };
  }

  const technicians = await prisma.technicianProfile.findMany({
    where: whereConditions,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      services: {
        select: {
          id: true,
          title: true,
          price: true,
          category: {
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: {
          review: true,
          services: true,
        },
      },
    },
    orderBy: { averageRating: "desc" },
  });

  return technicians;
};



const getTechnicianByIdFromDb = async (technicianId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      services: {
        include: {
          category: true,
        },
      },
      review: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      availabilities: true,
    },
  });

  if (!technician) {
    throw new Error("Technician profile not found");
  }

  return technician;
};

// Protected 
const updateTechnicianProfileInDb = async (
  userId: string,
  payload: {
    location?: string;
    yearOfExperience?: number;
    skills?: string[];
  }
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const updatedProfile = await prisma.technicianProfile.update({
    where: { userId },
    data: {
      ...(payload.location && { location: payload.location }),
      ...(payload.yearOfExperience !== undefined && {
        yearOfExperience: Number(payload.yearOfExperience),
      }),
      ...(payload.skills && { skills: payload.skills }),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedProfile;
};

// Protected 

const updateAvailabilityInDb = async (
  userId: string,
  slots: { dayOfWeek: number; startTime: string; endTime: string }[]
) => {
  const technicianProfile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  
  const result = await prisma.$transaction(async (tx) => {
    await tx.availability.deleteMany({
      where: { technicianId: technicianProfile.id },
    });

    const createdSlots = await tx.availability.createMany({
      data: slots.map((s) => ({
        technicianId: technicianProfile.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    });

    return createdSlots;
  });

  return result;
};

export const technicianService = {
  getAllTechniciansFromDb,
  getTechnicianByIdFromDb,
  updateTechnicianProfileInDb,
  updateAvailabilityInDb,
};