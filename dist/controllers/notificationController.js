"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNotification = exports.readNotification = exports.getNotificationList = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const getNotificationList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const notificationList = yield prisma.notification.findMany({});
        res.json(notificationList);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get notification list" });
    }
});
exports.getNotificationList = getNotificationList;
const readNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { notification_id } = req.body;
    if (notification_id) {
        notification_id = notification_id.toString();
    }
    else {
        return res.status(400).json({ error: "notification_id is required" });
    }
    try {
        const notification = yield prisma.notification.update({
            where: { notification_id: parseInt(notification_id) },
            data: {
                read_status: true,
            }
        });
        res.json(notification);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to mark read notification" });
    }
});
exports.readNotification = readNotification;
const removeNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { notification_id } = req.body;
    if (notification_id) {
        notification_id = notification_id.toString();
    }
    else {
        return res.status(400).json({ error: "notification_id is required" });
    }
    try {
        const notification = yield prisma.notification.delete({
            where: { notification_id: parseInt(notification_id) },
        });
        res.json("notification removed");
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to remove notification" });
    }
});
exports.removeNotification = removeNotification;
