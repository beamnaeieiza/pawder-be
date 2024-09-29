import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

//Create pet Profile
export const getPetList = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  try {
    const pet = await prisma.pet.findMany({
      where: { user_id: parseInt(id) },
  });
    res.json(pet);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to update user" });
  }
};
