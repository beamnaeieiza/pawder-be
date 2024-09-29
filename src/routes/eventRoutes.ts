import { Router } from "express";
import {
    createEvent,
    enrollEvent,
    getEventList,
    getEventInfo,
    getEnrollList,
    editEvent
} from "../controllers/eventController";
import authMiddleware from "../middlewares/authMiddleware";
import { get } from "http";

const router = Router();
const routeType = "/event";

router.get(`${routeType}/getEventList`, authMiddleware, getEventList);
router.get(`${routeType}/getEventInfo`, authMiddleware, getEventInfo);
router.get(`${routeType}/getEnrollList`, authMiddleware, getEnrollList);
router.post(`${routeType}/createEvent`, authMiddleware, createEvent);
router.post(`${routeType}/enrollEvent`, authMiddleware, enrollEvent);
router.post(`${routeType}/editEvent`, authMiddleware, editEvent);


export default router;