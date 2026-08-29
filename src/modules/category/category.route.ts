
import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryController } from "./category.controller";

const router=Router()

router.post('/',auth(Role.ADMIN),categoryController.createCategories)
router.get('/',auth(Role.ADMIN),categoryController.getAllCategories)
router.get('/:id',auth(Role.ADMIN),categoryController.getCategoryById)



export const categoryRouter=router