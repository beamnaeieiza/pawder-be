"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchController_1 = require("../controllers/matchController");
const compatibilityController_1 = require("../controllers/compatibilityController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
const routeType = "/match";
router.get(`${routeType}/getRandomPet`, authMiddleware_1.default, matchController_1.randomPet);
router.post(`${routeType}/likePet`, authMiddleware_1.default, matchController_1.likePet);
router.post(`${routeType}/dislikePet`, authMiddleware_1.default, matchController_1.notLikePet);
router.post(`${routeType}/savePet`, authMiddleware_1.default, matchController_1.savePet);
router.get(`${routeType}/getUserInterest`, authMiddleware_1.default, matchController_1.getUserInterests);
router.get(`${routeType}/getUserNotInterest`, authMiddleware_1.default, matchController_1.getUserNotInterests);
router.get(`${routeType}/getUserSaved`, authMiddleware_1.default, matchController_1.getUserSaved);
router.get(`${routeType}/getCompatibility`, authMiddleware_1.default, compatibilityController_1.getPetCompatibility);
router.get(`${routeType}/getPetInterest`, authMiddleware_1.default, matchController_1.getPetInterest);
router.post(`${routeType}/unMatchUser`, authMiddleware_1.default, matchController_1.unMatchUser);
exports.default = router;
