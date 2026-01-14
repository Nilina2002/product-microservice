import { Router } from "express";
import ProductRoutes from "./productRoutes.js";

const router = Router();

router.use("/api", ProductRoutes);

export default router;

