import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";
import { technicianController } from "./technician.controller";

const router = Router();

router.get("/", technicianController.getAllTechnicians);
router.get("/:id", technicianController.getTechnicianById);

router.put(
  "/profile",
  auth(Role.TECHNICIAN),
  technicianController.updateTechnicianProfile
);

router.put(
  "/availability",
  auth(Role.TECHNICIAN),
  technicianController.updateAvailability
);

export const technicianRoutes = router;