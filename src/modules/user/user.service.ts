import bcrypt from "bcryptjs"
import prisma from "../../lib/prisma"
import { RegisterUserPayload } from "./user.interface"
import config from "../../config"

const registerUserIntoDb=async(payload:RegisterUserPayload)=>{
  const { name, email, password, role, location, yearOfExperience } = payload;

const isEmailExist=await prisma.user.findUnique({
    where:{
        email
    }
})

if(isEmailExist){
    throw new Error("This email is alreadey exists")
}
const hashPassword=await bcrypt.hash(password,Number(config.bcrypt_slat_rounds))

if (role !== "CUSTOMER" && role !== "TECHNICIAN") {
  throw new Error("Invalid registration role");
}

const createUser=await prisma.user.create({
    data:{
        name,
        email:email.toLowerCase(),
        password:hashPassword,
        role,

        ...(role==="TECHNICIAN" && {
            technicianProfile:{
                create:{
                    location:location || 'Not Specified',
                     yearOfExperience: yearOfExperience ? Number(yearOfExperience) : 0,
                }
            }
        })
        
        
    },
    include:{
        technicianProfile:role==='TECHNICIAN'
    }
})

const { password: _, ...userWithoutPassword } = createUser;

return userWithoutPassword;
}


const myProfileFromDb=async(userId:string)=>{
const user=await prisma.user.findFirstOrThrow({
    where:{
        id:userId
    },
    include:{
        technicianProfile:true
    }
})
const {password: _,...userWithoutPassword}=user
return userWithoutPassword
}

export const userService={
    registerUserIntoDb,
    myProfileFromDb
}