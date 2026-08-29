import prisma from "../../lib/prisma"
import { ICreateService } from "./serviceInterface"

const createServiceIntoDb=async(userId:string,payload:ICreateService)=>{
    
    const {categoryId,description,price,title}=payload

    const technician=await prisma.technicianProfile.findUnique({
        where:{userId}
    })

    if(!technician){
        throw new Error("You are not allowed")
    }

    const category=await prisma.category.findUnique({
        where:{id:categoryId}
    })
    if (!category) {
    throw new Error("Category does not exist");
  }

  const existingService = await prisma.services.findFirst({
  where: {
    technicianId: technician.id,
    categoryId,
    title,
  },
});

if (existingService) {
  throw new Error("You already have this service");
}

    const services =await prisma.services.create({
        data:{
            technicianId:technician.id,
            categoryId,
            title,
            description,
            price
        }
    })
    return services

}


const getAllServicesFromDb=async(query:{
    searchTerm?:string;
    categoryId?:string;
    minPrice?:string;
    maxPrice?:string
    location?:string
})=>{

      const { searchTerm, categoryId, minPrice, maxPrice, location } = query;

       const whereConditions: any = {};

  if (searchTerm) {
    whereConditions.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    whereConditions.categoryId = categoryId;
  }

  if (minPrice || maxPrice) {
    whereConditions.price = {};
    if (minPrice) whereConditions.price.gte = Number(minPrice);
    if (maxPrice) whereConditions.price.lte = Number(maxPrice);
  }

  if (location) {
    whereConditions.technician = {
      location: { contains: location, mode: "insensitive" },
    };
  }

  const services = await prisma.services.findMany({
    where: whereConditions,
    include: {
      category: true,
      technician: {
        include: {
          user: {
            select: { id: true, name: true, email: true},
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return services;
}


const getServiceByIdFromDb = async (id: string) => {
  const service = await prisma.services.findUnique({
    where: { id },
    include: {
      category: true,
      technician: {
        include: {
          user: {
            select: { id: true, name: true, email: true},
          },
          availabilities: true,
          review: true,
        },
      },
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  return service;
};

export const serviceService = {
  createServiceIntoDb,
  getAllServicesFromDb,
  getServiceByIdFromDb,
};