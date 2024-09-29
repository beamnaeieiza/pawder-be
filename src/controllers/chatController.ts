import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { parse } from "path";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

export const getMatchList = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    try {
        const matchList = await prisma.match.findMany({
            where: {
                OR: [
                    { user_id1: parseInt(id) },
                    { user_id2: parseInt(id) }
                ]
            },
            include: {
                user1: true,
                user2: true
            }
        });

        const formattedMatchList = matchList.map(match => {
            const { user1, user2, ...rest } = match;
            if (match.user_id1 === parseInt(id)) {
                return { ...rest, match_user: match.user2 };
            } else {
                return { ...rest, match_user: match.user1 };
            }
        });

        res.json(formattedMatchList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get user match info" });
    }
};


export const getChatList = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    try {
        const chatList = await prisma.chat.findMany({
            where: {
                OR: [
                    { user_id1: parseInt(id) },
                    { user_id2: parseInt(id) }
                ]
            },
            include: {
                user1: true,
                user2: true,
                messages: true
            }
        });

        const formattedChatList = chatList.map(chat => {
            const { user1, user2, ...rest } = chat;
            if (chat.user_id1 === parseInt(id)) {
                return { ...rest, chat_user: chat.user2 };
            } else {
                return { ...rest, chat_user: chat.user1 };
            }
        });

        res.json(formattedChatList);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get user chat info" });
    }
};

export const createChat = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { chat_user_id } = req.body;
    try {
   
        const chat = await prisma.chat.create({
            data: {
                user_id1: parseInt(id),
                user_id2: chat_user_id
            }
        });

        res.json(chat);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get user match info" });
    }
};


export const sendChatMessage = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { chat_id, receiver_id, types, message } = req.body;
    try {
        const existingChat = await prisma.chat.findUnique({
            where: { chat_id: chat_id }
        });

        if (!existingChat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const chat = await prisma.chat.update({
            where: { chat_id: chat_id },
            data: {
                messages: {
                    create: {
                        sender_id: parseInt(id),
                        receiver_id: parseInt(receiver_id),
                        types: types,
                        message: message
                    }
                }
            }
        });

        res.json(chat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to send chat message" });
    }
};

export const getChatMessage = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    const { chat_id } = req.body;
    try {
      const existingChat = await prisma.chat.findUnique({
        where: { chat_id: chat_id },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });
  
      if (!existingChat) {
        return res.status(404).json({ error: "Chat not found" });
      }
  
      const formattedMessages = existingChat.messages.map(message => ({
        ...message,
        sender: message.sender_id === parseInt(id) ? "You" : "Other",
        receiver: message.sender_id === parseInt(id) ? "Other" : "You"
      }));
  
      res.json({
        ...existingChat,
        messages: formattedMessages
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to get chat messages" });
    }
  };