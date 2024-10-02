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
