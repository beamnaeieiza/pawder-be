import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { parse } from "path";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const getNotificationList = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    try {
        const notificationList = await prisma.notification.findMany({
            where: {
                user_id: parseInt(id)
            }
        });
        res.json(notificationList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get notification list" });
    }
};

export const readNotification = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { notification_id } = req.body;
    if (notification_id) {
        notification_id = notification_id.toString();
    } else {
        return res.status(400).json({ error: "notification_id is required" });
    }
    try {
        const notification = await prisma.notification.update({
            where: { notification_id: parseInt(notification_id) },
            data: {
                read_status: true,
            }
        });
        res.json(notification);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to mark read notification" });
    }
}

export const removeNotification = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { notification_id } = req.body;
    if (notification_id) {
        notification_id = notification_id.toString();
    } else {
        return res.status(400).json({ error: "notification_id is required" });
    }
    try {
        const notification = await prisma.notification.delete({
            where: { notification_id: parseInt(notification_id) },
        });
        res.json("notification removed");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to remove notification" });
    }
}

export const markAllReadNotification = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    try {
        const notification = await prisma.notification.updateMany({
            where: { user_id: parseInt(id) },
            data: {
                read_status: true,
            }
        });
        res.json("All notifications marked read!");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to mark all notifications read" });
    }
}