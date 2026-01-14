import { Router } from "express";
import AuthController from "../controller/AuthController.js";
const router = Router()

router.post("/auth/register", AuthController.register)
router.post("/auth/login", AuthController.login)

export default router