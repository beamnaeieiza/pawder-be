import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const randomPet = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  
  try {
    const metPets = await prisma.user_HaveMet.findMany({
      where: { user_id: id },
      select: { met_user_id: true }, // Select only the met_pet_id
    });
    const metPetIds = metPets.map(met => met.met_user_id);

    const totalCount = await prisma.pet.count({
      where: {
        NOT: {
          pet_id: {
            in: metPetIds,
          },
        },
      },
    });
    if (totalCount === 0) {
      return res.status(404).json({ error: "No available user found." });
    }
    const randomIndex = Math.floor(Math.random() * totalCount);
    const randomPet = await prisma.pet.findMany({
      where: {
        NOT: {
          pet_id: {
            in: metPetIds,
          },
        },
      },
      skip: randomIndex,
      take: 1,
      include: {
        user: true,
      }
    });

    if (randomPet.length === 0) {
      return res.status(404).json({ error: "No pet found." });
    }

    res.json(randomPet[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve random pet." });
  }
};

export const likePet = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { target_user_id } = req.body; 
  
    if (!target_user_id) {
      return res.status(400).json({ error: "Target User ID is required." });
    }
  
    try {
      const existingLike = await prisma.user_Interest.findUnique({
        where: {
          user_id_target_user_id: {
            user_id: userId,
            target_user_id: target_user_id,
          },
        },
      });
      if (existingLike) {
        return res.status(409).json({ error: "You have already liked this user." });
      }
      const newLike = await prisma.user_Interest.create({
        data: {
          user_id: userId,
          target_user_id: target_user_id,
        },
      });
  
      res.status(201).json(newLike);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to like user." });
    }
  };

  export const notLikePet = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { dislike_user_id } = req.body; 
  
    if (!dislike_user_id) {
      return res.status(400).json({ error: "Target User ID is required." });
    }
  
    try {
      const existingDislike = await prisma.user_Dislike.findUnique({
        where: {
          user_id_dislike_user_id: {
            user_id: userId,
            dislike_user_id: dislike_user_id,
          },
        },
      });
      if (existingDislike) {
        return res.status(409).json({ error: "You have already disliked this user." });
      }
      const newDislike = await prisma.user_Dislike.create({
        data: {
          user_id: userId,
          dislike_user_id: dislike_user_id,
        },
      });
  
      res.status(201).json(newDislike);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to dislike user." });
    }
  };



  export const getUserInterests = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
  
    try {
      const userInterests = await prisma.user_Interest.findMany({
        where: { user_id: userId },
        include: {
          user: true, // Include user details (optional)
        },
      });
  
      if (userInterests.length === 0) {
        return res.status(404).json({ message: "No interests found for this user." });
      }
  
      res.json(userInterests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve user interests." });
    }
  };

  export const getUserNotInterests = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
  
    try {
      const userNotInterests = await prisma.user_Dislike.findMany({
        where: { user_id: userId },
        include: {
          user: true, // Include user details (optional)
        },
      });
  
      if (userNotInterests.length === 0) {
        return res.status(404).json({ message: "No not interests found for this user." });
      }
  
      res.json(userNotInterests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve user not interests." });
    }
  };
  