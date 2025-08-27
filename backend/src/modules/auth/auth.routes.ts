import { Router } from "express";
import { login,signup,limiter } from "./auth.Controller";
import { authMiddleware } from "../../middlewares/authMiddlewares";

const router = Router();

router.post("/signup", limiter, signup);
router.post("/login", login);

export default router;