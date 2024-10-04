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
          user_id: {
            in: metPetIds,
          },
        },
      },
    });
    if (totalCount === 0) {
      return res.status(404).json({ error: "No available user found." });
    }
    const randomIndex = Math.floor(Math.random() * totalCount);
    const randomPet = await prisma.user.findMany({
      where: {
        NOT: {
          user_id: {
            in: [...metPetIds, id],
          },
        },
      },
      include: {
        pets: true,
      },
      skip: randomIndex,
      take: 10,
    });


    const usersWithPets = randomPet.filter(user => {
      const hasPets = Array.isArray(user.pets) && user.pets.length > 0;
      // console.log('User:', user.email, 'Has Pets:', hasPets);
      return hasPets;
    });

    res.json(usersWithPets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve random pet." });
  }
};

export const likePet = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    let { target_user_id } = req.body; 
    target_user_id = parseInt(target_user_id);
  
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

      const likeToMatch = await prisma.user_Interest.findUnique({
        where: {
          user_id_target_user_id: {
            user_id: target_user_id,
            target_user_id: userId,
          },
        },
      });

      if (likeToMatch) {
        const newLike = await prisma.user_Interest.create({
          data: {
            user_id: userId,
            target_user_id: target_user_id,
          },
        });
        const newMet = await prisma.user_HaveMet.create({
          data: {
            user_id: userId,
            met_user_id: target_user_id,
          },
        });
        const newMatch = await prisma.match.create({
          data: {
            user_id1: userId,
            user_id2: target_user_id,
          },
        });
        res.status(201).json(newMatch);
      }

      else {
      const newLike = await prisma.user_Interest.create({
        data: {
          user_id: userId,
          target_user_id: target_user_id,
        },
      });
  
      res.status(201).json(newLike);
    }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to like user." });
    }
  };

  export const notLikePet = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    let { dislike_user_id } = req.body; 
    dislike_user_id = parseInt(dislike_user_id);
  
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
      const newMet = await prisma.user_HaveMet.create({
        data: {
          user_id: userId,
          met_user_id: dislike_user_id,
        },
      });
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


  export const savePet = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    let { saved_user_id } = req.body; 
    saved_user_id = parseInt(saved_user_id);
  
    if (!saved_user_id) {
      return res.status(400).json({ error: "Target User ID is required." });
    }
  
    try {
      const existingSaved = await prisma.user_Saved.findUnique({
        where: {
          user_id_saved_user_id: {
            user_id: userId,
            saved_user_id: saved_user_id,
          },
        },
      });
      if (existingSaved) {
        return res.status(409).json({ error: "You have already saved this user." });
      }
      const newMet = await prisma.user_HaveMet.create({
        data: {
          user_id: userId,
          met_user_id: saved_user_id,
        },
      });
      const newSave = await prisma.user_Saved.create({
        data: {
          user_id: userId,
          saved_user_id: saved_user_id,
        },
      });
  
      res.status(201).json(newSave);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save user." });
    }
  };



  export const getUserInterests = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
  
    try {
      const userInterests = await prisma.user_Interest.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              username: true,
              firstname: true,
              email: true,
              birthdate: true,
              pets: {
                select: {
                  petname: true,
                  pet_url: true,
                  gender: true,
                  breed: {
                    select: {
                      breedName: true,
                    },
                  },
              },
            }
          },
        }
    
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
          user: {
            select: {
              username: true,
              firstname: true,
              email: true,
              birthdate: true,
              pets: {
                select: {
                  petname: true,
                  pet_url: true,
                  gender: true,
                  breed: {
                    select: {
                      breedName: true,
                    },
                  },
              },
            }
          },
        }
    
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


  export const getUserSaved = async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
  
    try {
      const userSaved = await prisma.user_Saved.findMany({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              username: true,
              firstname: true,
              email: true,
              birthdate: true,
              pets: {
                select: {
                  petname: true,
                  pet_url: true,
                  gender: true,
                  breed: {
                    select: {
                      breedName: true,
                    },
                  },
              },
            }
          },
        }
    
        },
      });
  
      if (userSaved.length === 0) {
        return res.status(404).json({ message: "No saved found for this user." });
      }
  
      res.json(userSaved);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve user saved information." });
    }
  };
  