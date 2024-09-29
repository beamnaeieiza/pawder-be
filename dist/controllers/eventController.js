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
exports.editEvent = exports.enrollEvent = exports.createEvent = exports.getEnrollList = exports.getEventInfo = exports.getEventList = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const getEventList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const eventList = yield prisma.event.findMany({
            include: {
                owner: true,
            }
        });
        res.json(eventList);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get event list info" });
    }
});
exports.getEventList = getEventList;
const getEventInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { event_id } = req.body;
    try {
        const eventInfo = yield prisma.event.findFirst({
            where: {
                event_id: event_id
            },
            include: {
                owner: true,
            }
        });
        res.json(eventInfo);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get event info" });
    }
});
exports.getEventInfo = getEventInfo;
const getEnrollList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { event_id } = req.body;
    try {
        const eventInfo = yield prisma.event.findFirst({
            where: {
                event_id: event_id
            },
            include: {
                enrollments: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        res.json(eventInfo);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get enroll info" });
    }
});
exports.getEnrollList = getEnrollList;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { eventTitle, description, eventDate, event_url } = req.body;
    try {
        const event = yield prisma.event.create({
            data: {
                owner_id: parseInt(id),
                eventTitle: eventTitle,
                description: description,
                event_url: event_url,
                eventDate: eventDate,
                status: false
            }
        });
        res.json(event);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create Event" });
    }
});
exports.createEvent = createEvent;
const enrollEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { event_id } = req.body;
    try {
        const existingEvent = yield prisma.event.findUnique({
            where: { event_id: event_id }
        });
        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        const event = yield prisma.event.update({
            where: { event_id: event_id },
            data: {
                enrollments: {
                    create: {
                        user_id: parseInt(id),
                    }
                }
            }
        });
        res.json(event);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to enroll event" });
    }
});
exports.enrollEvent = enrollEvent;
const editEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { event_id, eventTitle, description, eventDate, event_url } = req.body;
    try {
        const existingEvent = yield prisma.event.findUnique({
            where: { event_id: event_id }
        });
        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        const event = yield prisma.event.update({
            where: { event_id: event_id },
            data: {
                eventTitle: eventTitle,
                description: description,
                event_url: event_url,
                eventDate: eventDate
            }
        });
        res.json(event);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to edit event" });
    }
});
exports.editEvent = editEvent;
