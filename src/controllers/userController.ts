import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const signUp = async (req: Request, res: Response) => {
  const { email, username, password, phone_number, firstname, lastname, gender, birthdate } =
    req.body;
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
        expiresIn: "1h",
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
      include: {
        pets: {
          include: {
            breed: {
              select: {
                breed_id: true,
                breedName: true,
              }
            }
          }
        },
        // rating: {
          // where: { user_id: parseInt(user_id) },
        //   include: {
        //     rating_user : {
        //       select : {
        //         user_id : true,
        //         username : true,
        //         firstname : true,
        //         lastname : true,
        //         profile_url : true
        //       }
        //     },
        //   }
        // }

      }
    });

    const rating = await prisma.rating.findMany({
      where: { user_id: parseInt(user_id) },
      include: {
        rating_user : {
          select : {
            user_id : true,
            username : true,
            firstname : true,
            lastname : true,
            profile_url : true
          }
        },
      }
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({user, rating});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

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
        }
      }
    }
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
  const { firstname, lastname, email,gender, birthdate, location_latitude, location_longitude } = req.body;
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
        location_longitude
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
  let { breed_id,petname,pet_url,gender,age,pet_description } = req.body;
  breed_id = parseInt(breed_id);
  age = parseFloat(age);
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
            age : parseFloat(age)

        },
      },
    },
  });

  const pet = await prisma.pet.findMany({
    where: { user_id: parseInt(id) },
  });
    res.json(pet);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const getPetList = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  try {
    const pet = await prisma.pet.findMany({
      where: { user_id: parseInt(id) },
      include: {
        breed: true
      }
  })
    res.json(pet);
  } catch (error) {
    console.log(error)
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
          }
        }
      }
    });

    res.json(likeList);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to get like information" });
  }
}


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
        OR: [
          { user_id1: id },
          { user_id2: id },
        ],
      },
    });

    const totalNotMatches = totalSwipes - totalMatches;
    

    res.json({totalSwipes, totalMatches, totalNotMatches, totalLikes});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve user saved information." });
  }
};