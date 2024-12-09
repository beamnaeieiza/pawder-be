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
exports.deleteEvent = exports.editEvent = exports.enrollEvent = exports.createEvent = exports.getEnrollList = exports.getEventInfo = exports.getEventList = void 0;
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
    let { event_id } = req.query;
    if (event_id) {
        event_id = event_id.toString();
    }
    else {
        return res.status(400).json({ error: "event_id is required" });
    }
    // event_id = parseInt(event_id);
    try {
        const eventInfo = yield prisma.event.findFirst({
            where: {
                event_id: parseInt(event_id)
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
    let { event_id } = req.query;
    if (event_id) {
        event_id = event_id.toString();
    }
    else {
        return res.status(400).json({ error: "event_id is required" });
    }
    try {
        const eventInfo = yield prisma.event.findFirst({
            where: {
                event_id: parseInt(event_id)
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
    const { eventTitle, description, eventDate, event_url, eventTime, location } = req.body;
    try {
        const event = yield prisma.event.create({
            data: {
                owner_id: parseInt(id),
                eventTitle: eventTitle,
                description: description,
                event_url: event_url,
                eventDate: eventDate,
                eventTime: eventTime,
                location: location,
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
    let { event_id } = req.body;
    event_id = parseInt(event_id);
    try {
        const existingEvent = yield prisma.event.findUnique({
            where: { event_id: event_id },
            include: {
                enrollments: true, // Include enrollments to check for existing enrollment
            }
        });
        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        // Check if the user is already enrolled
        const existingEnrollment = existingEvent.enrollments.find((enrollment) => enrollment.user_id === parseInt(id));
        if (existingEnrollment) {
            // If the user is already enrolled, unenroll them
            yield prisma.event.update({
                where: { event_id: event_id },
                data: {
                    enrollments: {
                        deleteMany: {
                            user_id: id, // Match the user to unenroll
                        },
                    },
                },
            });
            return res.json({ message: "Successfully unenrolled from the event" });
        }
        else {
            // If the user is not enrolled, enroll them
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
            const owner = yield prisma.event.findUnique({
                where: { event_id: event_id },
                include: {
                    owner: true
                }
            });
            const user = yield prisma.user.findUnique({
                where: { user_id: parseInt(id) },
            });
            if (owner === null || owner === void 0 ? void 0 : owner.owner.user_id) {
                yield prisma.notification.create({
                    data: {
                        user_id: owner.owner.user_id,
                        title: "New Enrollment",
                        message: `${user === null || user === void 0 ? void 0 : user.firstname} has enrolled in your event '${owner === null || owner === void 0 ? void 0 : owner.eventTitle}'!`,
                        read_status: false
                    }
                });
            }
            return res.json(event);
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to toggle enrollment" });
    }
});
exports.enrollEvent = enrollEvent;
const editEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { event_id, eventTitle, description, eventDate, event_url, location, eventTime } = req.body;
    event_id = parseInt(event_id);
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
                eventDate: eventDate,
                eventTime: eventTime,
                location: location
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
const deleteEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { event_id } = req.body;
    event_id = parseInt(event_id);
    try {
        const existingEvent = yield prisma.event.findUnique({
            where: { event_id: event_id }
        });
        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        if (existingEvent.owner_id !== id) {
            return res.status(403).json({ error: "You are not the owner of this event" });
        }
        yield prisma.event_UserEnrolled.deleteMany({
            where: { event_id: event_id }
        });
        const event = yield prisma.event.delete({
            where: { event_id: event_id },
        });
        res.status(204).send();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to remove event" });
    }
});
exports.deleteEvent = deleteEvent;
