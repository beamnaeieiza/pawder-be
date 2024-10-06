"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
const routeType = "/notification";
router.get(`${routeType}/getNotificationList`, authMiddleware_1.default, notificationController_1.getNotificationList);
router.post(`${routeType}/readNotification`, authMiddleware_1.default, notificationController_1.readNotification);
router.post(`${routeType}/removeNotification`, authMiddleware_1.default, notificationController_1.removeNotification);
exports.default = router;
