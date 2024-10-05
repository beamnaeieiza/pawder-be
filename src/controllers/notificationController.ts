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
        });
        res.json(notificationList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get notification list" });
    }
};