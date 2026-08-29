
import { Router } from "express";
import { userController } from "./user.controller";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";

const router=Router()

router.post('/register',userController.registerUser)
router.get('/me',auth(Role.ADMIN,Role.CUSTOMER,Role.TECHNICIAN),userController.myProfile)

// router.get("/me", auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), authController.getMyProfile);

export const userRouter=router