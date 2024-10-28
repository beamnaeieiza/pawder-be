"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const imageController_1 = require("../controllers/imageController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const routeType = "/chat";
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get(`${routeType}/getMatchList`, authMiddleware_1.default, chatController_1.getMatchList);
router.get(`${routeType}/getChatList`, authMiddleware_1.default, chatController_1.getChatList);
router.get(`${routeType}/getChatMessage`, authMiddleware_1.default, chatController_1.getChatMessage);
router.post(`${routeType}/createChat`, authMiddleware_1.default, chatController_1.createChat);
router.post(`${routeType}/sendMessage`, authMiddleware_1.default, chatController_1.sendChatMessage);
router.post(`${routeType}/markRead`, authMiddleware_1.default, chatController_1.markChatRead);
router.post(`${routeType}/createGroupChat`, authMiddleware_1.default, chatController_1.createGroupChat);
router.post(`${routeType}/sendGroupMessage`, authMiddleware_1.default, chatController_1.sendGroupChatMessage);
router.get(`${routeType}/getGroupChatMessage`, authMiddleware_1.default, chatController_1.getGroupChatMessage);
router.get(`${routeType}/getGroupChatInfo`, authMiddleware_1.default, chatController_1.getGroupChatInfo);
router.post(`${routeType}/leaveGroupChat`, authMiddleware_1.default, chatController_1.leaveGroupChat);
router.post(`${routeType}/addMemberToGroupChat`, authMiddleware_1.default, chatController_1.addMemberToGroupChat);
router.post(`${routeType}/createGroupChatWithImage`, upload.single("file"), authMiddleware_1.default, imageController_1.createGroupChatWithImage);
router.post(`${routeType}/sendChatImage`, upload.single("file"), authMiddleware_1.default, imageController_1.sendChatImage);
exports.default = router;
