import { Router } from "express";
import {
    getNotificationList,
    readNotification,
    removeNotification
} from "../controllers/notificationController";
import authMiddleware from "../middlewares/authMiddleware";
import { get } from "http";

const router = Router();
const routeType = "/notification";

router.get(`${routeType}/getNotificationList`, authMiddleware, getNotificationList);
router.post(`${routeType}/readNotification`, authMiddleware, readNotification);
router.post(`${routeType}/removeNotification`, authMiddleware, removeNotification);

export default router;
