import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const signUp = async (req: Request, res: Response) => {
  const {
    email,
    username,
    password,
    phone_number,
    firstname,
    lastname,
    gender,
    birthdate,
  } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password,
        gender,
        phone_number,
        firstname,
        lastname,
        birthdate,
        verify_status: false,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!existingUser) {
      return res.status(400).json({ error: "User does not exist" });
    }

    if (existingUser.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: existingUser.user_id, username: existingUser.username },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.status(200).json({ token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to login" });
  }
};

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get a single user by ID
export const getUserById = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
      select: {
        user_id: true,
        username: true,
        firstname: true,
        lastname: true,
        profile_url: true,
        email: true,
        verify_status: true,
        subscription: true,
        location_latitude: true,
        location_longitude: true,
        gender: true,
        birthdate: true,
        distance_interest: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const getUserIdInfo = async (req: Request, res: Response) => {
  let { user_id } = req.query;
  if (user_id) {
    user_id = user_id.toString();
  } else {
    return res.status(400).json({ error: "user_id is required" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(user_id) },
      select: {
        user_id: true,
        username: true,
        firstname: true,
        lastname: true,
        profile_url: true,
        email: true,
        verify_status: true,
        subscription: true,
        location_latitude: true,
        location_longitude: true,
        gender: true,
        birthdate: true,
        distance_interest: true,
        pets: {
          include: {
            breed: {
              select: {
                breed_id: true,
                breedName: true,
              },
            },
          },
        },
      },
    });

    const rating = await prisma.rating.findMany({
      where: { user_id: parseInt(user_id) },
      include: {
        rating_user: {
          select: {
            user_id: true,
            username: true,
            firstname: true,
            lastname: true,
            profile_url: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user, rating });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const getDogById = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  let { pet_id } = req.query;
  if (pet_id) {
    pet_id = pet_id.toString();
  } else {
    return res.status(400).json({ error: "pet_id is required" });
  }
  try {
    const pet = await prisma.pet.findUnique({
      where: { pet_id: parseInt(pet_id) },
      include: {
        user: true,
        breed: {
          select: {
            breed_id: true,
            breedName: true,
          },
        },
        habits: {
          select: {
            habit_id: true,
            habit_name: true,
          },
        },
      },
    });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Update a user by ID
export const updateUser = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  const {
    firstname,
    lastname,
    email,
    gender,
    birthdate,
    location_latitude,
    location_longitude,
  } = req.body;
  try {
    const user = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        firstname,
        lastname,
        email,
        gender,
        birthdate,
        location_latitude,
        location_longitude,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

//Create pet Profile
export const createPet = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  let {
    breed_id,
    petname,
    pet_url,
    gender,
    age,
    pet_description,
    mixed_breed,
    habitId,
  } = req.body;
  breed_id = parseInt(breed_id);
  age = parseFloat(age);

  if (!Array.isArray(habitId)) {
    return res
      .status(400)
      .json({ error: "habitId are required or need to be array." });
  }

  try {
    const user = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        pets: {
          create: {
            breed_id: parseInt(breed_id),
            petname,
            pet_description,
            pet_url,
            gender,
            mixed_breed: mixed_breed,
            age: parseFloat(age),
            habits: {
              connect: habitId.map((habitId: number) => ({
                habit_id: parseInt(habitId.toString()),
              })),
            },
          },
        },
      },
    });

    const pet = await prisma.pet.findMany({
      where: { user_id: parseInt(id) },
    });
    res.json(pet);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const deletePet = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  const { pet_id } = req.body;
  try {
    const pet = await prisma.pet.findUnique({
      where: { pet_id: parseInt(pet_id) },
    });

    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    if (pet.user_id !== id) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this pet" });
    }

    await prisma.pet.delete({
      where: { pet_id: parseInt(pet_id) },
    });
    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete pet" });
  }
};

export const getPetList = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  try {
    const pet = await prisma.pet.findMany({
      where: { user_id: parseInt(id) },
      include: {
        breed: true,
        habits: true,
      },
    });
    res.json(pet);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete a user by ID
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({
      where: { user_id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const getUserLikeByList = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  try {
    const likeList = await prisma.user_Interest.findMany({
      where: { target_user_id: parseInt(id) },
      include: {
        owner: {
          select: {
            user_id: true,
            username: true,
            firstname: true,
            lastname: true,
            profile_url: true,
          },
        },
      },
    });

    res.json(likeList);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get like information" });
  }
};

export const getStatistic = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;

  try {
    const totalSwipes = await prisma.user_Interest.count({
      where: { user_id: id },
    });

    const totalLikes = await prisma.user_Interest.count({
      where: { target_user_id: id },
    });

    const totalMatches = await prisma.match.count({
      where: {
        OR: [{ user_id1: id }, { user_id2: id }],
      },
    });

    const totalNotMatches = totalSwipes - totalMatches;

    res.json({ totalSwipes, totalMatches, totalNotMatches, totalLikes });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to retrieve user saved information." });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  const { location_latitude, location_longitude } = req.body;
  try {
    const user = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        location_latitude,
        location_longitude,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const updateDistanceInterest = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  const { distance_interest } = req.body;
  try {
    const user = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        distance_interest,
      },
    });
    res.json("Updated distance interest successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const verifyId = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  const { id_card } = req.body;
  try {
    const user = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        id_card,
        verify_status: true,
      },
    });
    res.json("Verified successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to verify user" });
  }
}

export const blockUser = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  const { blocked_user_id } = req.body;

  try {
    const block = await prisma.user_Blocked.create({
      data: {
        user_id: id,
        blocked_user_id: parseInt(blocked_user_id),
      },
    });
    res.json("Blocked successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to block user" });
  }
}

export const unblockUser = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  const { blocked_user_id } = req.body;
  try {
    const block = await prisma.user_Blocked.deleteMany({
      where: {
        user_id: id,
        blocked_user_id: parseInt(blocked_user_id),
      },
    });
    res.json("Unblocked successfully");
  } catch (error) {
    res.status(500).json({ error: "Failed to unblock user" });
  }
}

export const changeActivateAccount = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        deactivate: !user.deactivate,
      },
    });

    res.json(`Account ${updatedUser.deactivate ? 'deactivated' : 'activated'} successfully`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to toggle account activation status" });
  }
};
