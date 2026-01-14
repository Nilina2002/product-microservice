import { Router } from "express";
import ProductController from "../controller/ProductController.js";
import { extractUserFromToken, validateCompanyOwnership } from "../middleware/authMiddleware.js";

const router = Router();

router.use(extractUserFromToken);
router.use(validateCompanyOwnership);

router.post("/products", ProductController.createProduct);
router.get("/products", ProductController.listProducts);
router.post("/update", ProductController.updateStock); // Gateway removes /stock prefix

export default router;

