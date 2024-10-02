import { Router } from "express";
import {
    getBreedList
} from "../controllers/petController";
import authMiddleware from "../middlewares/authMiddleware";
import { get } from "http";

const router = Router();
const routeType = "/pet";

router.get(`${routeType}/getBreedList`, authMiddleware, getBreedList);
export default router;
