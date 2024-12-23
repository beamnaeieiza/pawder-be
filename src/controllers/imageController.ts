import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';
import { parse } from "path";
import { Expo } from "expo-server-sdk";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=pawder;AccountKey=dhoWB/csceSm005zY5gpnop5gjpTbB4ov18pIxWkTTyqDIOUUY4WU5iw60CEw8XuIA/YdRCuwYdM+ASt8uffdQ==;EndpointSuffix=core.windows.net'
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerName = "picture";
const containerClient = blobServiceClient.getContainerClient(containerName);
const expo = new Expo();

const upload = multer({
    storage: multer.memoryStorage(), 
  });

export const uploadProfileImage = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;


  try {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

    const blobName = `image-${uuidv4()}.jpg`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype, 
        },
      });
    const imageUrl = blockBlobClient.url;

   const user = await prisma.user.update({
        where: { user_id: parseInt(id) },
        data: {
            profile_url: imageUrl,
        },
        });
    
        res.json(user);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to update user" });
  }
};

export const createPetWithImages = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  let { breed_id, petname, gender, age, pet_description, mixed_breed, habitId, height, weight } = req.body;
  breed_id = parseInt(breed_id);
  age = parseFloat(age);

  if (!Array.isArray(habitId)) {
    return res.status(400).json({ error: 'habitId are required or need to be array.' });
  }

  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const imageUrls: string[] = [];

    for (const file of files.slice(0, 3)) { 
      const blobName = `image-${uuidv4()}.jpg`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype, 
        },
      });

      imageUrls.push(blockBlobClient.url);
    }

    const pet = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        pets: {
          create: {
            breed_id: parseInt(breed_id),
            petname,
            pet_description,
            height: parseFloat(height),
            weight: parseFloat(weight),
            pet_url: imageUrls[0] || null,
            pet_url2: imageUrls[1] || null,
            pet_url3: imageUrls[2] || null,
            gender,
            mixed_breed: mixed_breed,
            age: parseFloat(age),
            habits: {
              connect: habitId.map((habitId: number) => ({ habit_id: parseInt(habitId.toString()) })),
            }
          },
        },
      },
    });

    res.json(pet);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update pet" });
  }
};

export const createEventWithImage = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  let { eventTitle, description, eventDate, eventTime, location } = req.body;

  try {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

    const blobName = `image-${uuidv4()}.jpg`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype,
        },
      });
    const event_url = blockBlobClient.url;

    const event = await prisma.event.create({
      data: {
          owner_id: parseInt(id),
          eventTitle: eventTitle,
          description: description,
          event_url: event_url,
          eventDate: eventDate,
          eventTime: eventTime,
          location: location,
          status: false

      }
  });
        res.json(event);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to create event" });
  }
};


export const updateEventWithImage = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  let { event_id, eventTitle, description, eventDate, eventTime, location } = req.body;

  try {
    const file = req.file;

    if (!file) {
      const event = await prisma.event.update({
        where: { event_id: parseInt(event_id) },
        data: {
          eventTitle: eventTitle,
          description: description,
          eventDate: eventDate,
          eventTime: eventTime,
          location: location,
        }
    });
        return res.json(event);
      }

    const blobName = `image-${uuidv4()}.jpg`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype, 
        },
      });
    const event_url = blockBlobClient.url;

    const event = await prisma.event.update({
      where: { event_id: parseInt(event_id) },
      data: {
          eventTitle: eventTitle,
          description: description,
          event_url: event_url,
          eventDate: eventDate,
          eventTime: eventTime,
          location: location,
          status: false

      }
  });
        res.json(event);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to update event" });
  }
};


export const createGroupChatWithImage = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  let { group_name, members } = req.body;

  try {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

    const blobName = `image-${uuidv4()}.jpg`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype, 
        },
      });
    const group_url = blockBlobClient.url;

    const group_chat = await prisma.group_Chat.create({
      data: {
      group_name: group_name,
      group_url: group_url,
      group_members: {
          connect: [{ user_id: parseInt(id) }, ...members.map((member: any) => ({ user_id: parseInt(member) }))]
      }
      }
  });
        res.json(group_chat);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to create group chat" });
  }
}

export const sendChatImage = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  let { chat_id, receiver_id, types, message } = req.body;
  chat_id = parseInt(chat_id);
  receiver_id = parseInt(receiver_id);

  try {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

    const blobName = `image-${uuidv4()}.jpg`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype, 
        },
      });
    const chat_url = blockBlobClient.url;

    const chat = await prisma.chat.update({
      where : { chat_id : parseInt(chat_id) },
      data : {
        messages : {
          create: {
            sender_id: parseInt(id),
            receiver_id: parseInt(receiver_id),
            types: "IMAGE",
            message: chat_url
        }
        }
      }
  });

  const receiver = await prisma.user.findUnique({ where: { user_id: receiver_id } });

        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found" });
        }

        const userPromise = await prisma.user.findUnique({ where: { user_id: parseInt(id) } });

  if (receiver.expo_token && Expo.isExpoPushToken(receiver.expo_token)) {
    try {
        const pushMessages = [
            {
                to: receiver.expo_token,
                sound: 'default',
                title: "New Message",
                body: `You have a new message from ${userPromise?.firstname}.`,
                data: { chat_id, sender_id: id },
                android: {
                    channelId: 'default',
                    priority: 'high',
                    sound: 'default',
                    vibrate: [0, 250, 250, 250], 
                  },
                  ios: {
                    sound: 'default',
                    badge: 1, 
                  }
            },
            
        ];

        const tickets = await expo.sendPushNotificationsAsync(pushMessages);
        // console.log('Push Notification Tickets:', tickets);
    } catch (pushError) {
        console.error('Failed to send push notification:', pushError);
    }
}
        res.json(chat);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to send chat image" });
  }
}


