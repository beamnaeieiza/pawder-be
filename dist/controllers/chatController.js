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
exports.leaveGroupChat = exports.getGroupChatInfo = exports.addMemberToGroupChat = exports.sendGroupChatMessage = exports.getGroupChatMessage = exports.createGroupChat = exports.markChatRead = exports.getChatMessage = exports.sendChatMessage = exports.createChat = exports.getChatList = exports.getMatchList = void 0;
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
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });
        const formattedChatList = chatList.map(chat => {
            const { user1, user2, messages } = chat, rest = __rest(chat, ["user1", "user2", "messages"]);
            const lastMessage = messages[0];
            if (chat.user_id1 === parseInt(id)) {
                return Object.assign(Object.assign({}, rest), { lastMessage, chat_user: {
                        user_id: chat.user2.user_id,
                        firstname: chat.user2.firstname,
                        lastname: chat.user2.lastname,
                        username: chat.user2.username,
                        profile_url: chat.user2.profile_url
                    } });
            }
            else {
                return Object.assign(Object.assign({}, rest), { lastMessage, chat_user: {
                        user_id: chat.user1.user_id,
                        firstname: chat.user1.firstname,
                        lastname: chat.user1.lastname,
                        username: chat.user1.username,
                        profile_url: chat.user1.profile_url
                    } });
            }
        });
        const getGroupChat = yield prisma.group_Chat.findMany({
            where: {
                group_members: {
                    some: {
                        user_id: parseInt(id)
                    }
                }
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
                group_members: {
                    select: {
                        user_id: true,
                        firstname: true,
                        lastname: true,
                        username: true,
                        profile_url: true
                    }
                }
            }
        });
        const formattedGroupChatList = getGroupChat.map(chat => {
            const { group_members, messages } = chat, rest = __rest(chat, ["group_members", "messages"]);
            const lastMessage = messages[0];
            return Object.assign(Object.assign({}, rest), { lastMessage });
        });
        res.json({ chatList: formattedChatList, groupChatList: formattedGroupChatList });
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
        const user = yield prisma.user.findUnique({
            where: { user_id: parseInt(id) }
        });
        const notification = yield prisma.notification.create({
            data: {
                user_id: receiver_id,
                title: "New Message",
                message: "You have a new message from " + (user === null || user === void 0 ? void 0 : user.firstname),
                read_status: false
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
const markChatRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { chat_id } = req.body;
    if (chat_id) {
        chat_id = chat_id.toString();
    }
    else {
        return res.status(400).json({ error: "chat_id is required" });
    }
    try {
        const existingChat = yield prisma.chat.findUnique({
            where: { chat_id: parseInt(chat_id) }
        });
        if (!existingChat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        const chat = yield prisma.chat.update({
            where: { chat_id: parseInt(chat_id) },
            data: {
                messages: {
                    updateMany: {
                        where: {
                            receiver_id: parseInt(id)
                        },
                        data: {
                            read_status: true
                        }
                    }
                }
            }
        });
        res.json(chat);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to mark chat read" });
    }
});
exports.markChatRead = markChatRead;
const createGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { group_name, members } = req.body;
    try {
        const chat = yield prisma.group_Chat.create({
            data: {
                group_name: group_name,
                group_members: {
                    connect: [{ user_id: parseInt(id) }, ...members.map((member) => ({ user_id: member }))]
                }
            }
        });
        const send_notification = members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { user_id: member }
            });
            const notification = yield prisma.notification.create({
                data: {
                    user_id: member,
                    title: "New Group Chat",
                    message: "You have been added to a new group chat '" + group_name + "'",
                    read_status: false
                }
            });
        }));
        res.json(chat);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create group chat" });
    }
});
exports.createGroupChat = createGroupChat;
const getGroupChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { group_id } = req.query;
    if (group_id) {
        group_id = group_id.toString();
    }
    else {
        return res.status(400).json({ error: "group_id is required" });
    }
    try {
        const existingChat = yield prisma.group_Chat.findUnique({
            where: { group_chat_id: parseInt(group_id) },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    },
                    include: {
                        sender: {
                            select: {
                                user_id: true,
                                firstname: true,
                                lastname: true,
                                username: true,
                                profile_url: true
                            }
                        }
                    }
                },
                group_members: true
            }
        });
        if (!existingChat) {
            return res.status(404).json({ error: "Group Chat not found" });
        }
        const groupMembers = existingChat.group_members.map(member => ({
            user_id: member.user_id,
            firstname: member.firstname,
            lastname: member.lastname,
            username: member.username,
            profile_url: member.profile_url
        }));
        //   const getLastMessage = existingChat.messages[existingChat.messages.length - 1];
        res.json({
            group_id: existingChat.group_chat_id,
            group_name: existingChat.group_name,
            group_url: existingChat.group_url,
            // createdAt: existingChat.createdAt,
            // updatedAt: existingChat.updatedAt,
            // group_members: groupMembers,
            messages: existingChat.messages
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get group chat messages" });
    }
});
exports.getGroupChatMessage = getGroupChatMessage;
const sendGroupChatMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { group_id, types, message } = req.body;
    group_id = parseInt(group_id);
    try {
        const existingChat = yield prisma.group_Chat.findUnique({
            where: { group_chat_id: group_id }
        });
        if (!existingChat) {
            return res.status(404).json({ error: "Group Chat not found" });
        }
        const chat = yield prisma.group_Chat.update({
            where: { group_chat_id: group_id },
            data: {
                messages: {
                    create: {
                        sender_id: parseInt(id),
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
        res.status(500).json({ error: "Failed to send group chat message" });
    }
});
exports.sendGroupChatMessage = sendGroupChatMessage;
const addMemberToGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { group_id, members } = req.body;
    group_id = parseInt(group_id);
    try {
        const existingChat = yield prisma.group_Chat.findUnique({
            where: { group_chat_id: group_id }
        });
        if (!existingChat) {
            return res.status(404).json({ error: "Group Chat not found" });
        }
        const chat = yield prisma.group_Chat.update({
            where: { group_chat_id: group_id },
            data: {
                group_members: {
                    connect: members.map((member) => ({ user_id: parseInt(member) }))
                }
            }
        });
        const send_notification = members.map((member) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { user_id: parseInt(member) }
            });
            const notification = yield prisma.notification.create({
                data: {
                    user_id: member,
                    title: "New Group Chat",
                    message: "You have been added to a group chat '" + existingChat.group_name + "'",
                    read_status: false
                }
            });
        }));
        res.json(chat);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to add member to group chat" });
    }
});
exports.addMemberToGroupChat = addMemberToGroupChat;
const getGroupChatInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { group_id } = req.query;
    if (group_id) {
        group_id = group_id.toString();
    }
    else {
        return res.status(400).json({ error: "group_id is required" });
    }
    try {
        const existingChat = yield prisma.group_Chat.findUnique({
            where: { group_chat_id: parseInt(group_id) },
            include: {
                group_members: true
            }
        });
        if (!existingChat) {
            return res.status(404).json({ error: "Group Chat not found" });
        }
        const groupMembers = existingChat.group_members.map(member => ({
            user_id: member.user_id,
            firstname: member.firstname,
            lastname: member.lastname,
            username: member.username,
            profile_url: member.profile_url
        }));
        res.json({
            group_id: existingChat.group_chat_id,
            group_name: existingChat.group_name,
            group_url: existingChat.group_url,
            group_members: groupMembers
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get group chat info" });
    }
});
exports.getGroupChatInfo = getGroupChatInfo;
const leaveGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { group_id } = req.body;
    group_id = parseInt(group_id);
    try {
        const existingChat = yield prisma.group_Chat.findUnique({
            where: { group_chat_id: group_id },
            include: {
                group_members: true
            }
        });
        if (!existingChat) {
            return res.status(404).json({ error: "Group Chat not found" });
        }
        const isMember = existingChat.group_members.some(member => member.user_id === parseInt(id));
        if (!isMember) {
            return res.status(403).json({ error: "You are not a member of this group chat" });
        }
        const chat = yield prisma.group_Chat.update({
            where: { group_chat_id: group_id },
            data: {
                group_members: {
                    disconnect: [{ user_id: parseInt(id) }]
                }
            }
        });
        res.json(chat);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to leave group chat" });
    }
});
exports.leaveGroupChat = leaveGroupChat;
