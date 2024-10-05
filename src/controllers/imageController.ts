import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=pawder;AccountKey=dhoWB/csceSm005zY5gpnop5gjpTbB4ov18pIxWkTTyqDIOUUY4WU5iw60CEw8XuIA/YdRCuwYdM+ASt8uffdQ==;EndpointSuffix=core.windows.net'
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerName = "picture";
const containerClient = blobServiceClient.getContainerClient(containerName);

const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory for processing
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
          blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
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

export const createPetWithImage = async (req: Request, res: Response) => {
  const id = (req as any).user.userId;
  let { breed_id,petname,gender,age,pet_description } = req.body;
  breed_id = parseInt(breed_id);
  age = parseFloat(age);

  try {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

    const blobName = `image-${uuidv4()}.jpg`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: {
          blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
        },
      });
    const imageUrl = blockBlobClient.url;

    const pet = await prisma.user.update({
      where: { user_id: parseInt(id) },
      data: {
        pets: {
          create: {
            breed_id: parseInt(breed_id),
            petname,
            pet_description,
            pet_url : imageUrl,
            gender,
            age : parseFloat(age),

        },
      },
    },
  });

  //  const user = await prisma.user.update({
  //       where: { user_id: parseInt(id) },
  //       data: {
  //           profile_url: imageUrl,
  //       },
  //       });
    
        res.json(pet);
  } catch (error) {
    console.log(error)
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
          blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
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
          blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
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


