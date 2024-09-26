import { Router } from "express";
import {
  randomPet,
  likePet,
    getUserInterests,
    notLikePet,
    getUserNotInterests
} from "../controllers/matchController";
import {
    getPetCompatibility
  } from "../controllers/compatibilityController";
import authMiddleware from "../middlewares/authMiddleware";
import { get } from "http";

const router = Router();
const routeType = "/match";

router.get(`${routeType}/getRandomPet`, authMiddleware, randomPet);
router.post(`${routeType}/likePet`, authMiddleware, likePet);
router.post(`${routeType}/dislikePet`, authMiddleware, notLikePet);
router.get(`${routeType}/getUserInterest`, authMiddleware, getUserInterests);
router.get(`${routeType}/getUserNotInterest`, authMiddleware, getUserNotInterests);
router.get(`${routeType}/getCompatibility`, authMiddleware, getPetCompatibility);

export default router;
