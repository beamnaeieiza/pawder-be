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
exports.createComment = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { user_id, rating, comment } = req.body;
    try {
        const newRating = yield prisma.rating.create({
            data: {
                user_id: parseInt(user_id),
                from_user_id: parseInt(id),
                rating: parseFloat(rating),
                comment
            }
        });
        res.json(newRating);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create rating" });
    }
});
exports.createComment = createComment;
