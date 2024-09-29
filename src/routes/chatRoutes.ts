import { Router } from "express";
import {
  getMatchList,
  getChatList,
  getChatMessage,
  sendChatMessage,
  createChat
} from "../controllers/chatController";
import authMiddleware from "../middlewares/authMiddleware";
import { get } from "http";

const router = Router();
const routeType = "/chat";

router.get(`${routeType}/getMatchList`, authMiddleware, getMatchList);
router.get(`${routeType}/getChatList`, authMiddleware, getChatList);
router.get(`${routeType}/getChatMessage`, authMiddleware, getChatMessage);
router.post(`${routeType}/createChat`, authMiddleware, createChat);
router.post(`${routeType}/sendMessage`, authMiddleware, sendChatMessage);

export default router;
