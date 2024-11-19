import { Router } from "express";
import {
  randomPet,
  likePet,
    getUserInterests,
    notLikePet,
    getUserNotInterests,
    savePet,
    getUserSaved,
    unMatchUser,
    getPetInterest
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
router.post(`${routeType}/savePet`, authMiddleware, savePet);
router.get(`${routeType}/getUserInterest`, authMiddleware, getUserInterests);
router.get(`${routeType}/getUserNotInterest`, authMiddleware, getUserNotInterests);
router.get(`${routeType}/getUserSaved`, authMiddleware, getUserSaved);
router.get(`${routeType}/getCompatibility`, authMiddleware, getPetCompatibility);
router.get(`${routeType}/getPetInterest`, authMiddleware, getPetInterest);

router.post(`${routeType}/unMatchUser`, authMiddleware, unMatchUser);

export default router;
