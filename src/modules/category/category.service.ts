import prisma from "../../lib/prisma";
import { ICategory } from "./categoryInterface";

 const createCategoryIntoDb=async(payload:ICategory)=>{
    const {name,description,imageUrl}=payload

const isExits=await prisma.category.findUnique({
    where:{name}
})

if(isExits){
    throw new Error("This category is already exist")
}

const category=await prisma.category.create({
   data:{
     name,
    description,
    imageUrl
   }
})

return category


}


const getAllCategoriesFromDb=async()=>{
    const categories=await prisma.category.findMany({
        include:{
            _count:{
                select:{services:true}
            }
        }
    })
    return categories
}

const getCategoryByIdFromDb=async(id:string)=>{

    const category=await prisma.category.findUnique({
        where:{id},
        include:{
            services:{
                include:{
                    technician:{
                      include:{
                        user:{
                              select:{
                            id:true,name:true,email:true
                        }
                        }
                      }
                    
                    }
                }
            }
        }
    })

    return category

}

export const categoryService={
    createCategoryIntoDb,
    getAllCategoriesFromDb,
    getCategoryByIdFromDb
}