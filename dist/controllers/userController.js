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
exports.getStatistic = exports.deleteUser = exports.getPetList = exports.createPet = exports.updateUser = exports.getDogById = exports.getUserIdInfo = exports.getUserById = exports.getUsers = exports.login = exports.signUp = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password, phone_number, firstname, lastname, gender, birthdate } = req.body;
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
                gender,
                phone_number,
                firstname,
                lastname,
                birthdate,
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
const getUserIdInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { user_id } = req.query;
    if (user_id) {
        user_id = user_id.toString();
    }
    else {
        return res.status(400).json({ error: "user_id is required" });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { user_id: parseInt(user_id) },
            include: {
                pets: {
                    include: {
                        breed: {
                            select: {
                                breed_id: true,
                                breedName: true,
                            }
                        }
                    }
                },
                // rating: {
                // where: { user_id: parseInt(user_id) },
                //   include: {
                //     rating_user : {
                //       select : {
                //         user_id : true,
                //         username : true,
                //         firstname : true,
                //         lastname : true,
                //         profile_url : true
                //       }
                //     },
                //   }
                // }
            }
        });
        const rating = yield prisma.rating.findMany({
            where: { user_id: parseInt(user_id) },
            include: {
                rating_user: {
                    select: {
                        user_id: true,
                        username: true,
                        firstname: true,
                        lastname: true,
                        profile_url: true
                    }
                },
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user, rating });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
exports.getUserIdInfo = getUserIdInfo;
const getDogById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { pet_id } = req.query;
    if (pet_id) {
        pet_id = pet_id.toString();
    }
    else {
        return res.status(400).json({ error: "pet_id is required" });
    }
    try {
        const pet = yield prisma.pet.findUnique({
            where: { pet_id: parseInt(pet_id) },
            include: {
                user: true,
                breed: {
                    select: {
                        breed_id: true,
                        breedName: true,
                    }
                }
            }
        });
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }
        res.json(pet);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
exports.getDogById = getDogById;
// Update a user by ID
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { firstname, lastname, email, gender, birthdate, location_latitude, location_longitude } = req.body;
    try {
        const user = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                firstname,
                lastname,
                email,
                gender,
                birthdate,
                location_latitude,
                location_longitude
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.updateUser = updateUser;
//Create pet Profile
const createPet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { breed_id, petname, pet_url, gender, age, pet_description } = req.body;
    breed_id = parseInt(breed_id);
    age = parseFloat(age);
    try {
        const user = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                pets: {
                    create: {
                        breed_id: parseInt(breed_id),
                        petname,
                        pet_description,
                        pet_url,
                        gender,
                        age: parseFloat(age)
                    },
                },
            },
        });
        const pet = yield prisma.pet.findMany({
            where: { user_id: parseInt(id) },
        });
        res.json(pet);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.createPet = createPet;
const getPetList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const pet = yield prisma.pet.findMany({
            where: { user_id: parseInt(id) },
            include: {
                breed: true
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
const getStatistic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const totalSwipes = yield prisma.user_Interest.count({
            where: { user_id: id },
        });
        const totalLikes = yield prisma.user_Interest.count({
            where: { target_user_id: id },
        });
        const totalMatches = yield prisma.match.count({
            where: {
                OR: [
                    { user_id1: id },
                    { user_id2: id },
                ],
            },
        });
        const totalNotMatches = totalSwipes - totalMatches;
        res.json({ totalSwipes, totalMatches, totalNotMatches, totalLikes });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve user saved information." });
    }
});
exports.getStatistic = getStatistic;
