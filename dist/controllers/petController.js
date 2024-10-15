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
exports.getBreedList = exports.getPetList = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
//Create pet Profile
const getPetList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const pet = yield prisma.pet.findMany({
            where: { user_id: parseInt(id) },
            include: {
                breed: true,
                habits: true,
            }
        });
        res.json(pet);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.getPetList = getPetList;
const getBreedList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const pet = yield prisma.pet_Breed.findMany({
            select: {
                breed_id: true,
                breedName: true
            }
        });
        res.json(pet);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get breed list" });
    }
});
exports.getBreedList = getBreedList;
