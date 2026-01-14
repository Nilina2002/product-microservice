import { Router } from "express";
import ProductController from "../controller/ProductController.js";

const router = Router();

router.post("/products", ProductController.createProduct);
router.get("/products", ProductController.listProducts);
router.post("/stock/update", ProductController.updateStock);

export default router;

