"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = (0, express_1.Router)();
const routeType = "/chat";
router.get(`${routeType}/getMatchList`, authMiddleware_1.default, chatController_1.getMatchList);
router.get(`${routeType}/getChatList`, authMiddleware_1.default, chatController_1.getChatList);
router.get(`${routeType}/getChatMessage`, authMiddleware_1.default, chatController_1.getChatMessage);
router.post(`${routeType}/createChat`, authMiddleware_1.default, chatController_1.createChat);
router.post(`${routeType}/sendMessage`, authMiddleware_1.default, chatController_1.sendChatMessage);
router.post(`${routeType}/markRead`, authMiddleware_1.default, chatController_1.markChatRead);
exports.default = router;
