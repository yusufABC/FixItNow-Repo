
import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "../user/user.controller";

const router=Router()

router.post('/register',userController.registerUser)
router.get('/me',auth(Role.ADMIN,Role.CUSTOMER,Role.TECHNICIAN),userController.myProfile)

// router.get("/me", auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN), authController.getMyProfile);

export const templateRouter=router