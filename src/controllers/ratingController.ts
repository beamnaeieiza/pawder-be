import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const createComment = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
    const { user_id, rating, comment } = req.body;

    try {
        const newRating = await prisma.rating.create({
            data: {
                user_id: parseInt(user_id),
                from_user_id : parseInt(id),
                rating : parseFloat(rating),
                comment
            }
        
        });
        res.json(newRating);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create rating" });
    }
};

