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
exports.deleteUser = exports.createPet = exports.updateUser = exports.getUserById = exports.getUsers = exports.login = exports.signUp = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password, phone_number, firstname, lastname } = req.body;
    try {
        const existingUser = yield prisma.user.findFirst({
            where: { email: email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already in use" });
        }
        const newUser = yield prisma.user.create({
            data: {
                email,
                username,
                password,
                phone_number,
                firstname,
                lastname,
                verify_status: false,
            },
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to create user" });
    }
});
exports.signUp = signUp;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const existingUser = yield prisma.user.findFirst({
            where: { email: email },
        });
        if (!existingUser) {
            return res.status(400).json({ error: "User does not exist" });
        }
        if (existingUser.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: existingUser.user_id, username: existingUser.username }, JWT_SECRET, {
            expiresIn: "1h",
        });
        res.status(200).json({ token: token });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to login" });
    }
});
exports.login = login;
// Get all users
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});
exports.getUsers = getUsers;
// Get a single user by ID
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const user = yield prisma.user.findUnique({
            where: { user_id: parseInt(id) },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
exports.getUserById = getUserById;
// Update a user by ID
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { firstname, lastname, email, gender, birthdate } = req.body;
    try {
        const user = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                firstname,
                lastname,
                email,
                gender,
                birthdate,
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.updateUser = updateUser;
// Create pet Profile
const createPet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { petname, e } = req.body;
    try {
        const user = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                pets: {
                    create: {
                        petname,
                        breeds: {},
                    },
                },
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.createPet = createPet;
// Delete a user by ID
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma.user.delete({
            where: { user_id: parseInt(id) },
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});
exports.deleteUser = deleteUser;
