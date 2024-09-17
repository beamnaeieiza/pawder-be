import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
  const {
    email,
    username,
    password,
    phone_number,
    profile_url,
    firstname,
    lastname,
  } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password,
        phone_number,
        profile_url,
        firstname,
        lastname,
      },
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
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
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Update a user by ID
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    email,
    username,
    password,
    phone_number,
    profile_url,
    firstname,
    lastname,
  } = req.body;
  try {
    const user = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        email,
        username,
        password,
        phone_number,
        profile_url,
        firstname,
        lastname,
      },
    });
    res.json(user);
  } catch (error) {
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
