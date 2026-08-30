
import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { serviceController } from "./service.controller";

const router=Router()

router.post("/", auth(Role.TECHNICIAN), serviceController.createService);

// Public routes (Search & Filter)
router.get("/", serviceController.getAllServices);
router.get("/:id", serviceController.getServiceById);


export const serviceRouter=router