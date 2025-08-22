import { Router } from "express";
import { createTeam, joinTeam } from "./team.Controller";
import {authMiddleware} from "../../../middlewares/authMiddlewares";

const router = Router();

router.post("/", authMiddleware, createTeam);
router.post("/join", authMiddleware, joinTeam);

export default router;