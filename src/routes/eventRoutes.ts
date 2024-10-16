import { Router } from "express";
import {
    createEvent,
    enrollEvent,
    getEventList,
    getEventInfo,
    getEnrollList,
    editEvent,
    deleteEvent
} from "../controllers/eventController";
import { 
    createEventWithImage,
    updateEventWithImage
} from "../controllers/imageController";
import authMiddleware from "../middlewares/authMiddleware";
import { get } from "http";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
const routeType = "/event";

router.get(`${routeType}/getEventList`, authMiddleware, getEventList);
router.get(`${routeType}/getEventInfo`, authMiddleware, getEventInfo);
router.get(`${routeType}/getEnrollList`, authMiddleware, getEnrollList);
router.post(`${routeType}/createEvent`, authMiddleware, createEvent);
router.post(`${routeType}/enrollEvent`, authMiddleware, enrollEvent);
router.post(`${routeType}/editEvent`, authMiddleware, editEvent);

router.post(`${routeType}/deleteEvent`, authMiddleware, deleteEvent);

router.post(`${routeType}/createEventWithImage`, upload.single('file'), authMiddleware, createEventWithImage);
router.post(`${routeType}/updateEventWithImage`, upload.single('file'), authMiddleware, updateEventWithImage);


export default router;
