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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatMessage = exports.sendChatMessage = exports.createChat = exports.getChatList = exports.getMatchList = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const getMatchList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const matchList = yield prisma.match.findMany({
            where: {
                OR: [
                    { user_id1: parseInt(id) },
                    { user_id2: parseInt(id) }
                ]
            },
            include: {
                user1: true,
                user2: true
            }
        });
        const formattedMatchList = matchList.map(match => {
            const { user1, user2 } = match, rest = __rest(match, ["user1", "user2"]);
            if (match.user_id1 === parseInt(id)) {
                return Object.assign(Object.assign({}, rest), { match_user: match.user2 });
            }
            else {
                return Object.assign(Object.assign({}, rest), { match_user: match.user1 });
            }
        });
        res.json(formattedMatchList);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get user match info" });
    }
});
exports.getMatchList = getMatchList;
const getChatList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const chatList = yield prisma.chat.findMany({
            where: {
                OR: [
                    { user_id1: parseInt(id) },
                    { user_id2: parseInt(id) }
                ]
            },
            include: {
                user1: true,
                user2: true,
                messages: true
            }
        });
        const formattedChatList = chatList.map(chat => {
            const { user1, user2 } = chat, rest = __rest(chat, ["user1", "user2"]);
            if (chat.user_id1 === parseInt(id)) {
                return Object.assign(Object.assign({}, rest), { chat_user: chat.user2 });
            }
            else {
                return Object.assign(Object.assign({}, rest), { chat_user: chat.user1 });
            }
        });
        res.json(formattedChatList);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get user chat info" });
    }
});
exports.getChatList = getChatList;
const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { chat_user_id } = req.body;
    chat_user_id = parseInt(chat_user_id);
    try {
        const chat = yield prisma.chat.create({
            data: {
                user_id1: parseInt(id),
                user_id2: chat_user_id
            }
        });
        res.json(chat);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get user match info" });
    }
});
exports.createChat = createChat;
const sendChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { chat_id, receiver_id, types, message } = req.body;
    chat_id = parseInt(chat_id);
    receiver_id = parseInt(receiver_id);
    try {
        const existingChat = yield prisma.chat.findUnique({
            where: { chat_id: chat_id }
        });
        if (!existingChat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        const chat = yield prisma.chat.update({
            where: { chat_id: chat_id },
            data: {
                messages: {
                    create: {
                        sender_id: parseInt(id),
                        receiver_id: parseInt(receiver_id),
                        types: types,
                        message: message
                    }
                }
            }
        });
        res.json(chat);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to send chat message" });
    }
});
exports.sendChatMessage = sendChatMessage;
const getChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { chat_id } = req.query;
    if (chat_id) {
        chat_id = chat_id.toString();
    }
    else {
        return res.status(400).json({ error: "chat_id is required" });
    }
    try {
        const existingChat = yield prisma.chat.findUnique({
            where: { chat_id: parseInt(chat_id) },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                user1: true,
                user2: true
            }
        });
        if (!existingChat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        const otherPerson = existingChat.user1.user_id === parseInt(id) ? existingChat.user2 : existingChat.user1;
        const formattedMessages = existingChat.messages.map(message => (Object.assign(Object.assign({}, message), { sender: message.sender_id === parseInt(id) ? "You" : "Other", receiver: message.sender_id === parseInt(id) ? "Other" : "You" })));
        res.json({
            chat_id: existingChat.chat_id,
            user_id1: existingChat.user_id1,
            user_id2: existingChat.user_id2,
            createdAt: existingChat.createdAt,
            updatedAt: existingChat.updatedAt,
            otherPerson: {
                user_id: otherPerson.user_id,
                firstname: otherPerson.firstname,
                lastname: otherPerson.lastname,
                username: otherPerson.username,
                profile_url: otherPerson.profile_url
            },
            messages: formattedMessages
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get chat messages" });
    }
});
exports.getChatMessage = getChatMessage;
