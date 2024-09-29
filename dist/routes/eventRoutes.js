"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
const routeType = "/event";
router.get(`${routeType}/getEventList`, authMiddleware_1.default, eventController_1.getEventList);
router.get(`${routeType}/getEventInfo`, authMiddleware_1.default, eventController_1.getEventInfo);
router.get(`${routeType}/getEnrollList`, authMiddleware_1.default, eventController_1.getEnrollList);
router.post(`${routeType}/createEvent`, authMiddleware_1.default, eventController_1.createEvent);
router.post(`${routeType}/enrollEvent`, authMiddleware_1.default, eventController_1.enrollEvent);
router.post(`${routeType}/editEvent`, authMiddleware_1.default, eventController_1.editEvent);
exports.default = router;
