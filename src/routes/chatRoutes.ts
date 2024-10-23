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
  addMemberToGroupChat,
  getGroupChatInfo
} from "../controllers/chatController";
import {
  createGroupChatWithImage
} from "../controllers/imageController";
import authMiddleware from "../middlewares/authMiddleware";
import { get } from "http";
import multer from "multer";

const router = Router();
const routeType = "/chat";
const upload = multer({ storage: multer.memoryStorage() });

router.get(`${routeType}/getMatchList`, authMiddleware, getMatchList);
router.get(`${routeType}/getChatList`, authMiddleware, getChatList);
router.get(`${routeType}/getChatMessage`, authMiddleware, getChatMessage);
router.post(`${routeType}/createChat`, authMiddleware, createChat);
router.post(`${routeType}/sendMessage`, authMiddleware, sendChatMessage);
router.post(`${routeType}/markRead`, authMiddleware, markChatRead);


router.post(`${routeType}/createGroupChat`, authMiddleware, createGroupChat);
router.post(`${routeType}/sendGroupMessage`, authMiddleware, sendGroupChatMessage);
router.get(`${routeType}/getGroupChatMessage`, authMiddleware, getGroupChatMessage);
router.get(`${routeType}/getGroupChatInfo`, authMiddleware, getGroupChatInfo);

router.post(`${routeType}/addMemberToGroupChat`, authMiddleware, addMemberToGroupChat);

router.post(
  `${routeType}/createGroupChatWithImage`,
  upload.single("file"),
  authMiddleware,
  createGroupChatWithImage
);

export default router;
