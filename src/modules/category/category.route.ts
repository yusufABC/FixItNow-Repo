import { Router } from "express";
import { auth } from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryController } from "./category.controller";

const router = Router();

// Only Admin can create a category
router.post("/", auth(Role.ADMIN), categoryController.createCategories);

// 🔓 PUBLIC routes (Anyone, including customers, can view categories)
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

export const categoryRouter = router;