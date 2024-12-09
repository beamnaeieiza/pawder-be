import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { parse } from "path";
import { Expo } from "expo-server-sdk";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;
const expo = new Expo();

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
    let { event_id } = req.query;
    if (event_id) {
        event_id = event_id.toString();
    } else {
        return res.status(400).json({ error: "event_id is required" });
    }
    // event_id = parseInt(event_id);
    try {
        const eventInfo = await prisma.event.findFirst({
            where: {
                event_id: parseInt(event_id)
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
    let { event_id } = req.query;
    if (event_id) {
        event_id = event_id.toString();
    } else {
        return res.status(400).json({ error: "event_id is required" });
    }
    try {
        const eventInfo = await prisma.event.findFirst({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get enroll info" });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { eventTitle, description, eventDate, event_url, eventTime, location } = req.body;
    try {
   
        const event = await prisma.event.create({
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

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create Event" });
    }
};


export const enrollEvent = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { event_id } = req.body;
    event_id = parseInt(event_id);
    try {
        const existingEvent = await prisma.event.findUnique({
            where: { event_id: event_id },
            include: {
                enrollments: true,
            }
        });

        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

        const existingEnrollment = existingEvent.enrollments.find(
            (enrollment) => enrollment.user_id === parseInt(id)
        );

        if (existingEnrollment) {

            await prisma.event.update({
                where: { event_id: event_id },
                data: {
                    enrollments: {
                        deleteMany: {
                            user_id: id, 
                        },
                    },
                },
            });

            return res.json({ message: "Successfully unenrolled from the event" });
        } else {

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

            const owner = await prisma.event.findUnique({
                where: { event_id: event_id },
                include: {
                    owner: true
                }
            });

            const user = await prisma.user.findUnique({
                where: { user_id: parseInt(id) },
            });

            if (owner?.owner.user_id) {
                await prisma.notification.create({
                    data: {
                        user_id: owner.owner.user_id,
                        title: "New Enrollment",
                        message: `${user?.firstname} has enrolled in your event '${owner?.eventTitle}'!`,
                        read_status: false
                    }
                });
            }

            if (owner?.owner.user_id) {
                
                if (owner.owner.expo_token && Expo.isExpoPushToken(owner.owner.expo_token)) {
                    try {
                        await expo.sendPushNotificationsAsync([
                            {
                                to: owner.owner.expo_token,
                                sound: 'default',
                                title: "New Enrollment",
                                body: `${user?.firstname} has enrolled in your event '${owner?.eventTitle}'!`,
                            },
                        ]);
                    } catch (error) {
                        console.error("Failed to send push notification to owner", error);
                    }
                }
            }

            return res.json(event);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to toggle enrollment" });
    }
};

export const editEvent = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { event_id, eventTitle, description, eventDate, event_url, location, eventTime } = req.body;
    event_id = parseInt(event_id);
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
                eventDate: eventDate,
                eventTime: eventTime,
                location: location
            }
        });

        res.json(event);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to edit event" });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { event_id } = req.body;
    event_id = parseInt(event_id);
    try {
        const existingEvent = await prisma.event.findUnique({
            where: { event_id: event_id }
        });

        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }

          if (existingEvent.owner_id !== id) {
            return res.status(403).json({ error: "You are not the owner of this event" });
        }

        await prisma.event_UserEnrolled.deleteMany({
            where: { event_id: event_id }
        });

        const event = await prisma.event.delete({
            where: { event_id: event_id },
        });

        res.status(204).send();
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to remove event" });
    }
}