"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendChatImage = exports.createGroupChatWithImage = exports.updateEventWithImage = exports.createEventWithImage = exports.createPetWithImages = exports.uploadProfileImage = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const storage_blob_1 = require("@azure/storage-blob");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const expo_server_sdk_1 = require("expo-server-sdk");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=pawder;AccountKey=dhoWB/csceSm005zY5gpnop5gjpTbB4ov18pIxWkTTyqDIOUUY4WU5iw60CEw8XuIA/YdRCuwYdM+ASt8uffdQ==;EndpointSuffix=core.windows.net';
const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
const containerName = "picture";
const containerClient = blobServiceClient.getContainerClient(containerName);
const expo = new expo_server_sdk_1.Expo();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(), // Store files in memory for processing
});
const uploadProfileImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const blobName = `image-${(0, uuid_1.v4)()}.jpg`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        yield blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
            },
        });
        const imageUrl = blockBlobClient.url;
        const user = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                profile_url: imageUrl,
            },
        });
        res.json(user);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.uploadProfileImage = uploadProfileImage;
const createPetWithImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { breed_id, petname, gender, age, pet_description, mixed_breed, habitId, height, weight } = req.body;
    breed_id = parseInt(breed_id);
    age = parseFloat(age);
    if (!Array.isArray(habitId)) {
        return res.status(400).json({ error: 'habitId are required or need to be array.' });
    }
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
        const imageUrls = [];
        for (const file of files.slice(0, 3)) { // Limit to max 3 images
            const blobName = `image-${(0, uuid_1.v4)()}.jpg`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            yield blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders: {
                    blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
                },
            });
            imageUrls.push(blockBlobClient.url);
        }
        const pet = yield prisma.user.update({
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
                            connect: habitId.map((habitId) => ({ habit_id: parseInt(habitId.toString()) })),
                        }
                    },
                },
            },
        });
        res.json(pet);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to update pet" });
    }
});
exports.createPetWithImages = createPetWithImages;
const createEventWithImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { eventTitle, description, eventDate, eventTime, location } = req.body;
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const blobName = `image-${(0, uuid_1.v4)()}.jpg`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        yield blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
            },
        });
        const event_url = blockBlobClient.url;
        const event = yield prisma.event.create({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create event" });
    }
});
exports.createEventWithImage = createEventWithImage;
const updateEventWithImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { event_id, eventTitle, description, eventDate, eventTime, location } = req.body;
    try {
        const file = req.file;
        if (!file) {
            const event = yield prisma.event.update({
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
        const blobName = `image-${(0, uuid_1.v4)()}.jpg`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        yield blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
            },
        });
        const event_url = blockBlobClient.url;
        const event = yield prisma.event.update({
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to update event" });
    }
});
exports.updateEventWithImage = updateEventWithImage;
const createGroupChatWithImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { group_name, members } = req.body;
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const blobName = `image-${(0, uuid_1.v4)()}.jpg`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        yield blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
            },
        });
        const group_url = blockBlobClient.url;
        const group_chat = yield prisma.group_Chat.create({
            data: {
                group_name: group_name,
                group_url: group_url,
                group_members: {
                    connect: [{ user_id: parseInt(id) }, ...members.map((member) => ({ user_id: parseInt(member) }))]
                }
            }
        });
        res.json(group_chat);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create group chat" });
    }
});
exports.createGroupChatWithImage = createGroupChatWithImage;
const sendChatImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { chat_id, receiver_id, types, message } = req.body;
    chat_id = parseInt(chat_id);
    receiver_id = parseInt(receiver_id);
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const blobName = `image-${(0, uuid_1.v4)()}.jpg`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        yield blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype, // Set the content type of the blob (e.g., image/jpeg)
            },
        });
        const chat_url = blockBlobClient.url;
        const chat = yield prisma.chat.update({
            where: { chat_id: parseInt(chat_id) },
            data: {
                messages: {
                    create: {
                        sender_id: parseInt(id),
                        receiver_id: parseInt(receiver_id),
                        types: "IMAGE",
                        message: chat_url
                    }
                }
            }
        });
        const receiver = yield prisma.user.findUnique({ where: { user_id: receiver_id } });
        if (!receiver) {
            return res.status(404).json({ error: "Receiver not found" });
        }
        const userPromise = yield prisma.user.findUnique({ where: { user_id: parseInt(id) } });
        if (receiver.expo_token && expo_server_sdk_1.Expo.isExpoPushToken(receiver.expo_token)) {
            try {
                const pushMessages = [
                    {
                        to: receiver.expo_token,
                        sound: 'default',
                        title: "New Message",
                        body: `You have a new message from ${userPromise === null || userPromise === void 0 ? void 0 : userPromise.firstname}.`,
                        data: { chat_id, sender_id: id },
                        android: {
                            channelId: 'default',
                            priority: 'high',
                            sound: 'default',
                            vibrate: [0, 250, 250, 250], // Optional: vibration pattern
                        },
                        ios: {
                            sound: 'default',
                            badge: 1, // Optional: Update app badge count on iOS
                        }
                    },
                ];
                const tickets = yield expo.sendPushNotificationsAsync(pushMessages);
                // console.log('Push Notification Tickets:', tickets);
            }
            catch (pushError) {
                console.error('Failed to send push notification:', pushError);
            }
        }
        res.json(chat);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to send chat image" });
    }
});
exports.sendChatImage = sendChatImage;
