import { Router } from "express";
import {
  getMatchList,
  getChatList,
  getChatMessage,
  sendChatMessage,
  createChat,
  markChatRead,
  createGroupChat,
  sendGroupChatMessage,
  getGroupChatMessage,
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
router.post(`${routeType}/markRead`, authMiddleware, markChatRead);


router.post(`${routeType}/createGroupChat`, authMiddleware, createGroupChat);
router.post(`${routeType}/sendGroupMessage`, authMiddleware, sendGroupChatMessage);
router.get(`${routeType}/getGroupChatMessage`, authMiddleware, getGroupChatMessage);

export default router;
