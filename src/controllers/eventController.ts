import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { parse } from "path";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const getEventList = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    try {
        const eventList = await prisma.event.findMany({
            include: {
                owner: true,
            }
        });
        res.json(eventList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get event list info" });
    }
};

export const getEventInfo = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { event_id } = req.body;
    try {
        const eventInfo = await prisma.event.findFirst({
            where: {
                event_id: event_id
            },
            include: {
                owner: true,
            }
        });
        res.json(eventInfo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get event info" });
    }
};

export const getEnrollList = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { event_id } = req.body;
    try {
        const eventInfo = await prisma.event.findFirst({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get enroll info" });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { eventTitle, description, eventDate, event_url } = req.body;
    try {
   
        const event = await prisma.event.create({
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

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create Event" });
    }
};


export const enrollEvent = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { event_id } = req.body;
    try {
        const existingEvent = await prisma.event.findUnique({
            where: { event_id: event_id }
        });

        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        const event = await prisma.event.update({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to enroll event" });
    }
};

export const editEvent = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { event_id, eventTitle, description, eventDate, event_url } = req.body;
    try {
        const existingEvent = await prisma.event.findUnique({
            where: { event_id: event_id }
        });

        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        const event = await prisma.event.update({
            where: { event_id: event_id },
            data: {
                eventTitle: eventTitle,
                description: description,
                event_url: event_url,
                eventDate: eventDate
            }
        });

        res.json(event);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to edit event" });
    }
};
