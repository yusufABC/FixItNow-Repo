import { BookingStatus } from "../../../generated/prisma/enums"
import prisma from "../../lib/prisma"
import { ICreateBookingPayload } from "./booking.interface"

const createBookingIntoDb=async(customerId:string,payload:ICreateBookingPayload)=>{
const {serviceId,scheduledAt,address,notes}=payload

// check for service exits 
const service=await prisma.services.findUnique({
    where:{
        id:serviceId
    },
    include:{
        technician:true
    }
})

    if(!service){
        throw new Error("This Service is not exist")
    }

    if(customerId === service.technician.userId){
        throw new Error("You cannot book your own service")

    }


    const booking=await prisma.bookings.create({

        data:{
            customerId,
            technicianId:service.technicianId,
            scheduledAt: new Date(scheduledAt),
            serviceId:service.id,
      totalAmount: service.price,
      status: BookingStatus.REQUESTED,
      ...(address && { address }),
      ...(notes && { notes }),
        },
        include:{
            service:true,
            technician:{
                include:{
                    user:{
                        select:{id:true,name:true,email:true}
                    },
                },
            },
        },
    })

    return booking

}


// 2 customer get their own booking

const getCustomerBookingsIntoDb=async(customerId:string)=>{
const bookings=await prisma.bookings.findMany({
    where:{customerId},
    include:{
        service:true,
        technician:{
            include:{
                user:{
                    select:{id:true,name:true,email:true}
                }
            }
        }
    }
})

return bookings
}

// 3. Technician gets incoming bookings
const getTechnicianBookingsFromDb=async(userId:string)=>{
const technicianProfile=await prisma.technicianProfile.findUnique({
    where:{userId}
})

if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const booking=await prisma.bookings.findMany({
    where:{
        technicianId:technicianProfile.id
    },
    include:{
        service:true,
        customer:{
            select:{id:true,name:true,email:true}
        }
    }
  })
  return booking 
}

const updateBookingStatusByTechnician =async(
    userId:string,
    bookingId:string,
    newStatus:BookingStatus
)=>{
const technicianProfile=await prisma.technicianProfile.findUnique({
    where:{userId}
})


  if (!technicianProfile) {
    throw new Error("Technician profile not found");
  }

  const booking=await prisma.bookings.findUnique({
    where:{id:bookingId}
  })

  
  if (!booking) {
    throw new Error("Booking not found");
  }

  if(booking.technicianId !==technicianProfile.id ){
      throw new Error("You are not authorized to update this booking");
  }

  
  // State machine validations
  if (
    (newStatus === BookingStatus.ACCEPTED || newStatus === BookingStatus.DECLINED) &&
    booking.status !== BookingStatus.REQUESTED
  ) {
    throw new Error("You can only accept or decline a REQUESTED booking");
  }

  if (newStatus === BookingStatus.IN_PROGRESS && booking.status !== BookingStatus.PAID) {
    throw new Error("Job cannot be started until payment is completed");
  }

  if (newStatus === BookingStatus.COMPLETED && booking.status !== BookingStatus.IN_PROGRESS) {
    throw new Error("Only an IN_PROGRESS job can be marked as COMPLETED");
  }

  const updatedBooking = await prisma.bookings.update({
    where: { id: bookingId },
    data: { status: newStatus },
  })
  return updatedBooking
}


// 5. Customer cancels booking (only before IN_PROGRESS)
const cancelBookingByCustomer = async (customerId: string, bookingId: string) => {
  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== customerId) {
    throw new Error("You are not authorized to cancel this booking");
  }

  if (
    booking.status === BookingStatus.IN_PROGRESS ||
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.CANCELLED
  ) {
    throw new Error(`Cannot cancel a booking that is ${booking.status}`);
  }

  const cancelledBooking = await prisma.bookings.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });

  return cancelledBooking;
};

// 6. Get single booking details
const getBookingByIdFromDb = async (userId: string, bookingId: string) => {
  const booking = await prisma.bookings.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      customer: {
        select: { id: true, name: true, email: true, },
      },
      technician: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

export const bookingService = {
  createBookingIntoDb,
  getCustomerBookingsIntoDb,
  getTechnicianBookingsFromDb,
  updateBookingStatusByTechnician,
  cancelBookingByCustomer,
  getBookingByIdFromDb,
};