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
exports.uploadProfileImage = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const storage_blob_1 = require("@azure/storage-blob");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=pawder;AccountKey=dhoWB/csceSm005zY5gpnop5gjpTbB4ov18pIxWkTTyqDIOUUY4WU5iw60CEw8XuIA/YdRCuwYdM+ASt8uffdQ==;EndpointSuffix=core.windows.net';
const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(connectionString);
const containerName = "picture";
const containerClient = blobServiceClient.getContainerClient(containerName);
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
