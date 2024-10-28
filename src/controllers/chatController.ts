import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { parse } from "path";
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";
import { v4 as uuidv4 } from 'uuid';

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
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            }
        });

        const formattedChatList = chatList.map(chat => {
            const { user1, user2, messages, ...rest } = chat;
            const lastMessage = messages[0];
            if (chat.user_id1 === parseInt(id)) {
                return { ...rest, lastMessage, chat_user: {
                    user_id: chat.user2.user_id,
                    firstname: chat.user2.firstname,
                    lastname: chat.user2.lastname,
                    username: chat.user2.username,
                    profile_url: chat.user2.profile_url
                }};
            } else {
                return { ...rest, lastMessage, chat_user: {
                    user_id: chat.user1.user_id,
                    firstname: chat.user1.firstname,
                    lastname: chat.user1.lastname,
                    username: chat.user1.username,
                    profile_url: chat.user1.profile_url
                } };
            }
        });

        const getGroupChat = await prisma.group_Chat.findMany({
            where: {
                group_members: {
                    some: {
                        user_id: parseInt(id)
                    }
                }
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                },
                group_members: {
                    select: {
                        user_id: true,
                        firstname: true,
                        lastname: true,
                        username: true,
                        profile_url: true
                    }
                }
            }
        });

        const formattedGroupChatList = getGroupChat.map(chat => {
            const { group_members, messages, ...rest } = chat;
            const lastMessage = messages[0];
            return { ...rest, lastMessage};
        });

        res.json({ chatList: formattedChatList, groupChatList: formattedGroupChatList });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get user chat info" });
    }
};

export const createChat = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { chat_user_id } = req.body;
    chat_user_id = parseInt(chat_user_id);
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
    let { chat_id, receiver_id, types, message } = req.body;
    chat_id = parseInt(chat_id);
    receiver_id = parseInt(receiver_id);
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

        const user = await prisma.user.findUnique({
            where: { user_id: parseInt(id) }
        });

        const notification = await prisma.notification.create({
            data: {
                user_id: receiver_id,
                title: "New Message",
                message: "You have a new message from "+ user?.firstname,
                read_status: false
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
    let { chat_id } = req.query;
    if (chat_id) {
        chat_id = chat_id.toString();
    } else {
        return res.status(400).json({ error: "chat_id is required" });
    }
    try {
      const existingChat = await prisma.chat.findUnique({
        where: { chat_id: parseInt(chat_id) },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          },
            user1: true,
            user2: true
        }
      });
      
      if (!existingChat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      const otherPerson = existingChat.user1.user_id === parseInt(id) ? existingChat.user2 : existingChat.user1;
  
      const formattedMessages = existingChat.messages.map(message => ({
        ...message,
        sender: message.sender_id === parseInt(id) ? "You" : "Other",
        receiver: message.sender_id === parseInt(id) ? "Other" : "You"
      }));
  
      res.json({
        chat_id: existingChat.chat_id,
        user_id1: existingChat.user_id1,
        user_id2: existingChat.user_id2,
        createdAt: existingChat.createdAt,
        updatedAt: existingChat.updatedAt,
        otherPerson: {
            user_id: otherPerson.user_id,
            firstname: otherPerson.firstname,
            lastname: otherPerson.lastname,
            username: otherPerson.username,
            profile_url: otherPerson.profile_url
          },
        messages: formattedMessages
        
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to get chat messages" });
    }
  };

  export const markChatRead = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { chat_id } = req.body;
    if (chat_id) {
        chat_id = chat_id.toString();
    } else {
        return res.status(400).json({ error: "chat_id is required" });
    }
    try {
        const existingChat = await prisma.chat.findUnique({
            where: { chat_id: parseInt(chat_id) }
        });

        if (!existingChat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const chat = await prisma.chat.update({
            where: { chat_id: parseInt(chat_id) },
            data: {
                messages: {
                    updateMany: {
                        where: {
                            receiver_id: parseInt(id)
                        },
                        data: {
                            read_status: true
                        }
                    }
                }
            }
        });

        res.json(chat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to mark chat read" });
    }
}

export const createGroupChat = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { group_name, members } = req.body;
    try {

        const chat = await prisma.group_Chat.create({
            data: {
            group_name: group_name,
            group_members: {
                connect: [{ user_id: parseInt(id) }, ...members.map((member: any) => ({ user_id: member }))]
            }
            }
        });

        const send_notification = members.map(async (member: any) => {
            const user = await prisma.user.findUnique({
                where: { user_id: member }
            });

            const notification = await prisma.notification.create({
                data: {
                    user_id: member,
                    title: "New Group Chat",
                    message: "You have been added to a new group chat '"+ group_name+"'",
                    read_status: false
                }
            });
        });

        res.json(chat);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create group chat" });
    }
}

export const getGroupChatMessage = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { group_id } = req.query;
    if (group_id) {
        group_id = group_id.toString();
    } else {
        return res.status(400).json({ error: "group_id is required" });
    }
    try {
      const existingChat = await prisma.group_Chat.findUnique({
        where: { group_chat_id: parseInt(group_id) },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            },
            include: {
                sender: {
                    select: {
                        user_id: true,
                        firstname: true,
                        lastname: true,
                        username: true,
                        profile_url: true
                    }
                }
            }
          },
            group_members: true
        }
      });
      
      if (!existingChat) {
        return res.status(404).json({ error: "Group Chat not found" });
      }

      const groupMembers = existingChat.group_members.map(member => ({
        user_id: member.user_id,
        firstname: member.firstname,
        lastname: member.lastname,
        username: member.username,
        profile_url: member.profile_url
      }));

    //   const getLastMessage = existingChat.messages[existingChat.messages.length - 1];
  
      res.json({
        group_id: existingChat.group_chat_id,
        group_name: existingChat.group_name,
        group_url: existingChat.group_url,
        // createdAt: existingChat.createdAt,
        // updatedAt: existingChat.updatedAt,
        // group_members: groupMembers,
        messages: existingChat.messages
        
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to get group chat messages" });
    }
  }

  export const sendGroupChatMessage = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { group_id, types, message } = req.body;
    group_id = parseInt(group_id);
    try {
        const existingChat = await prisma.group_Chat.findUnique({
            where: { group_chat_id: group_id }
        });

        if (!existingChat) {
            return res.status(404).json({ error: "Group Chat not found" });
        }

        const chat = await prisma.group_Chat.update({
            where: { group_chat_id: group_id },
            data: {
                messages: {
                    create: {
                        sender_id: parseInt(id),
                        types: types,
                        message: message
                    }
                }
            }
        });

        res.json(chat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to send group chat message" });
    }
}

export const addMemberToGroupChat = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { group_id, members } = req.body;
    group_id = parseInt(group_id);
    try {
        const existingChat = await prisma.group_Chat.findUnique({
            where: { group_chat_id: group_id }
        });

        if (!existingChat) {
            return res.status(404).json({ error: "Group Chat not found" });
        }

        const chat = await prisma.group_Chat.update({
            where: { group_chat_id: group_id },
            data: {
                group_members: {
                    connect: members.map((member: any) => ({ user_id: parseInt(member) }))
                }
            }
        });

        const send_notification = members.map(async (member: any) => {
            const user = await prisma.user.findUnique({
                where: { user_id: parseInt(member) }
            });

            const notification = await prisma.notification.create({
                data: {
                    user_id: member,
                    title: "New Group Chat",
                    message: "You have been added to a group chat '"+ existingChat.group_name+"'",
                    read_status: false
                }
            });
        });

        res.json(chat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to add member to group chat" });
    }
}

export const getGroupChatInfo = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { group_id } = req.query;
    if (group_id) {
        group_id = group_id.toString();
    } else {
        return res.status(400).json({ error: "group_id is required" });
    }
    try {
      const existingChat = await prisma.group_Chat.findUnique({
        where: { group_chat_id: parseInt(group_id) },
        include: {
            group_members: true
        }
      });
      
      if (!existingChat) {
        return res.status(404).json({ error: "Group Chat not found" });
      }

      const groupMembers = existingChat.group_members.map(member => ({
        user_id: member.user_id,
        firstname: member.firstname,
        lastname: member.lastname,
        username: member.username,
        profile_url: member.profile_url
      }));
  
      res.json({
        group_id: existingChat.group_chat_id,
        group_name: existingChat.group_name,
        group_url: existingChat.group_url,
        group_members: groupMembers
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to get group chat info" });
    }
  }

  export const leaveGroupChat = async (req: Request, res: Response) => {
    const id = (req as any).user.userId;
    let { group_id } = req.body;
    group_id = parseInt(group_id);
    try {
        const existingChat = await prisma.group_Chat.findUnique({
            where: { group_chat_id: group_id },
            include: {
                group_members: true
            }
        });

        if (!existingChat) {
            return res.status(404).json({ error: "Group Chat not found" });
        }

        const isMember = existingChat.group_members.some(member => member.user_id === parseInt(id));

        if (!isMember) {
            return res.status(403).json({ error: "You are not a member of this group chat" });
        }

        const chat = await prisma.group_Chat.update({
            where: { group_chat_id: group_id },
            data: {
                group_members: {
                    disconnect: [{ user_id: parseInt(id) }]
                }
            }
        });

        res.json(chat);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to leave group chat" });
    }
}
