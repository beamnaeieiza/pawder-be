import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import haversine from "haversine-distance";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const randomPet = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: id },
      select: {
        location_latitude: true,
        location_longitude: true,
        distance_interest: true,
      },
    });

    if (
      !user ||
      !user.location_latitude === null ||
      !user.location_longitude === null
    ) {
      return res.status(404).json({ error: "User location not found." });
    }

    const userLocation = {
      latitude: parseFloat(user.location_latitude as string),
      longitude: parseFloat(user.location_longitude as string),
    };

    const metPets = await prisma.user_HaveMet.findMany({
      where: { user_id: id },
      select: { met_user_id: true }, // Select only the met_pet_id
    });
    const metPetIds = metPets.map((met) => met.met_user_id);

    const blockedUsers = await prisma.user_Blocked.findMany({
      where: { user_id: id },
      select: { blocked_user_id: true },
    });
    const blockedUserIds = blockedUsers.map(
      (blocked) => blocked.blocked_user_id
    );

    const savedUsers = await prisma.user_Saved.findMany({
      where: { user_id: id },
      select: { saved_user_id: true },
    });

    const savedUserIds = savedUsers.map((saved) => saved.saved_user_id);

    const totalCount = await prisma.user.count({
      where: {
        NOT: {
          user_id: {
            in: [...metPetIds, ...blockedUserIds, ...savedUserIds],
          },
        },
      },
    });
    if (totalCount === 0) {
      return res.status(404).json({ error: "No available user found." });
    }
    const randomIndex = Math.floor(Math.random() * totalCount);
    // console.log(`Total Count: ${totalCount}, Random Index: ${randomIndex}`);

    const potentialPets = await prisma.user.findMany({
      where: {
        deactivate: false,
        NOT: {
          user_id: {
            in: [...metPetIds, ...blockedUserIds, id],
          },
        },
      },
      include: {
        pets: {
          include: {
            habits: true,
          },
        },
      },
    });

    const usersWithinDistance = potentialPets
      .filter((petUser) => {
        if (
          petUser.location_latitude === null ||
          petUser.location_longitude === null
        )
          return false;
        const petUserLocation = {
          latitude: parseFloat(petUser.location_latitude),
          longitude: parseFloat(petUser.location_longitude),
        };
        const distance = haversine(userLocation, petUserLocation);
        return distance <= parseFloat(user.distance_interest as string) * 1000; // 10km in meters
      })
      .map((metUser) => {
        const distanceInMeters = haversine(userLocation, {
          latitude: parseFloat(metUser.location_latitude as string),
          longitude: parseFloat(metUser.location_longitude as string),
        });
        const distanceInKm = (distanceInMeters / 1000).toFixed(2); // Convert meters to kilometers
        return {
          ...metUser,
          distance: distanceInKm,
        };
      });

    const usersWithPets = usersWithinDistance.filter((user) => {
      const hasPets = Array.isArray(user.pets) && user.pets.length > 0;
      return hasPets;
    });

    const shuffledUsers = usersWithPets.sort(() => 0.5 - Math.random());

    res.json(shuffledUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve random pet." });
  }
};

export const likePet = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId;
  let { target_user_id, pet_ids } = req.body;
  target_user_id = parseInt(target_user_id);

  if (!Array.isArray(pet_ids)) {
    return res.status(400).json({ error: "Pet IDs must be an array." });
  }

  pet_ids = pet_ids.map((id) => parseInt(id));

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
      return res
        .status(409)
        .json({ error: "You have already liked this user." });
    }

    const likeToMatch = await prisma.user_Interest.findUnique({
      where: {
        user_id_target_user_id: {
          user_id: target_user_id,
          target_user_id: userId,
        },
      },
    });

    const petInterestsData = pet_ids.map((pet_id: number) => ({
      pet_id: pet_id,
    }));

    if (likeToMatch) {
      const newLike = await prisma.user_Interest.create({
        data: {
          user_id: userId,
          target_user_id: target_user_id,
          pet_interests: {
            create: petInterestsData,
          },
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

      const user = await prisma.user.findUnique({
        where: { user_id: parseInt(userId) },
      });

      const userTarget = await prisma.user.findUnique({
        where: { user_id: parseInt(target_user_id) },
      });

      const notification = await prisma.notification.create({
        data: {
          user_id: userId,
          title: "New Match",
          message: "You have match with " + userTarget?.firstname,
          read_status: false,
        },
      });

      const notification2 = await prisma.notification.create({
        data: {
          user_id: target_user_id,
          title: "New Match",
          message: "You have match with " + user?.firstname,
          read_status: false,
        },
      });
      res.status(201).json(newMatch);
    } else {
      const newLike = await prisma.user_Interest.create({
        data: {
          user_id: userId,
          target_user_id: target_user_id,
          pet_interests: {
            create: petInterestsData,
          },
        },
      });

      const newMet = await prisma.user_HaveMet.create({
        data: {
          user_id: userId,
          met_user_id: target_user_id,
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
      return res
        .status(409)
        .json({ error: "You have already disliked this user." });
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
      return res
        .status(409)
        .json({ error: "You have already saved this user." });
    }
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
            },
          },
        },
      },
    });

    if (userInterests.length === 0) {
      return res
        .status(404)
        .json({ message: "No interests found for this user." });
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
            },
          },
        },
      },
    });

    if (userNotInterests.length === 0) {
      return res
        .status(404)
        .json({ message: "No not interests found for this user." });
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
            },
          },
        },
      },
    });

    if (userSaved.length === 0) {
      return res.status(404).json({ message: "No saved found for this user." });
    }

    res.json(userSaved);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve user saved information." });
  }
};

export const unMatchUser = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  const { target_user_id } = req.body;
  try {
    const match = await prisma.match.deleteMany({
      where: {
        OR: [
          { user_id1: id, user_id2: parseInt(target_user_id) },
          { user_id1: parseInt(target_user_id), user_id2: id },
        ],
      },
    });

    await prisma.user_Interest.deleteMany({
      where: {
        user_id: id,
        target_user_id: parseInt(target_user_id),
      },
    });

    res.json("Unmatched successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to unmatch user" });
  }
};
