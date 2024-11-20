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
exports.getBlockedUsers = exports.changeActivateAccount = exports.unblockUser = exports.blockUser = exports.verifyId = exports.updateDistanceInterest = exports.updateLocation = exports.getStatistic = exports.getUserLikeByList = exports.deleteUser = exports.getPetList = exports.deletePet = exports.createPet = exports.updateUser = exports.getDogById = exports.getUserIdInfo = exports.getUserById = exports.getUsers = exports.login = exports.signUp = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password, phone_number, firstname, lastname, gender, birthdate, } = req.body;
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
            expiresIn: "24h",
        });
        res.status(200).json({ token: token, twoFA: existingUser.twoFA });
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
            select: {
                user_id: true,
                username: true,
                firstname: true,
                lastname: true,
                profile_url: true,
                email: true,
                verify_status: true,
                subscription: true,
                location_latitude: true,
                location_longitude: true,
                gender: true,
                birthdate: true,
                distance_interest: true,
                twoFA: true,
                deactivate: true,
            },
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
            select: {
                user_id: true,
                username: true,
                firstname: true,
                lastname: true,
                profile_url: true,
                email: true,
                verify_status: true,
                subscription: true,
                location_latitude: true,
                location_longitude: true,
                gender: true,
                birthdate: true,
                distance_interest: true,
                pets: {
                    include: {
                        breed: {
                            select: {
                                breed_id: true,
                                breedName: true,
                            },
                        },
                    },
                },
            },
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
                        profile_url: true,
                    },
                },
            },
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
                    },
                },
                habits: {
                    select: {
                        habit_id: true,
                        habit_name: true,
                    },
                },
            },
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
    const { firstname, lastname, email, gender, birthdate, location_latitude, location_longitude, } = req.body;
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
                location_longitude,
            },
        });
        res.json("Updated user successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.updateUser = updateUser;
//Create pet Profile
const createPet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    let { breed_id, petname, pet_url, gender, age, pet_description, mixed_breed, habitId, } = req.body;
    breed_id = parseInt(breed_id);
    age = parseFloat(age);
    if (!Array.isArray(habitId)) {
        return res
            .status(400)
            .json({ error: "habitId are required or need to be array." });
    }
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
                        mixed_breed: mixed_breed,
                        age: parseFloat(age),
                        habits: {
                            connect: habitId.map((habitId) => ({
                                habit_id: parseInt(habitId.toString()),
                            })),
                        },
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
const deletePet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { pet_id } = req.body;
    try {
        const pet = yield prisma.pet.findUnique({
            where: { pet_id: parseInt(pet_id) },
        });
        if (!pet) {
            return res.status(404).json({ error: "Pet not found" });
        }
        if (pet.user_id !== id) {
            return res
                .status(403)
                .json({ error: "You are not the owner of this pet" });
        }
        yield prisma.pet.delete({
            where: { pet_id: parseInt(pet_id) },
        });
        res.status(204).send();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to delete pet" });
    }
});
exports.deletePet = deletePet;
const getPetList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const pet = yield prisma.pet.findMany({
            where: { user_id: parseInt(id) },
            include: {
                breed: true,
                habits: true,
            },
        });
        res.json(pet);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get pet list" });
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
const getUserLikeByList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const likeList = yield prisma.user_Interest.findMany({
            where: { target_user_id: parseInt(id) },
            include: {
                owner: {
                    select: {
                        user_id: true,
                        username: true,
                        firstname: true,
                        lastname: true,
                        profile_url: true,
                    },
                },
            },
        });
        res.json(likeList);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get like information" });
    }
});
exports.getUserLikeByList = getUserLikeByList;
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
                OR: [{ user_id1: id }, { user_id2: id }],
            },
        });
        const totalNotMatches = totalSwipes - totalMatches;
        res.json({ totalSwipes, totalMatches, totalNotMatches, totalLikes });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Failed to retrieve user saved information." });
    }
});
exports.getStatistic = getStatistic;
const updateLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { location_latitude, location_longitude } = req.body;
    try {
        const user = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                location_latitude,
                location_longitude,
            },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.updateLocation = updateLocation;
const updateDistanceInterest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { distance_interest } = req.body;
    try {
        const user = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                distance_interest,
            },
        });
        res.json("Updated distance interest successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.updateDistanceInterest = updateDistanceInterest;
const verifyId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { id_card } = req.body;
    try {
        const user = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                id_card,
                verify_status: true,
            },
        });
        res.json("Verified successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to verify user" });
    }
});
exports.verifyId = verifyId;
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { blocked_user_id } = req.body;
    try {
        const block = yield prisma.user_Blocked.create({
            data: {
                user_id: id,
                blocked_user_id: parseInt(blocked_user_id),
            },
        });
        res.json("Blocked successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to block user" });
    }
});
exports.blockUser = blockUser;
const unblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    const { blocked_user_id } = req.body;
    try {
        const block = yield prisma.user_Blocked.deleteMany({
            where: {
                user_id: id,
                blocked_user_id: parseInt(blocked_user_id),
            },
        });
        res.json("Unblocked successfully");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to unblock user" });
    }
});
exports.unblockUser = unblockUser;
const changeActivateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const user = yield prisma.user.findUnique({
            where: { user_id: parseInt(id) }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const updatedUser = yield prisma.user.update({
            where: { user_id: parseInt(id) },
            data: {
                deactivate: !user.deactivate,
            },
        });
        res.json(`Account ${updatedUser.deactivate ? 'deactivated' : 'activated'} successfully`);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to toggle account activation status" });
    }
});
exports.changeActivateAccount = changeActivateAccount;
const getBlockedUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const blockedUsers = yield prisma.user_Blocked.findMany({
            where: { user_id: id },
            include: {
                user: {
                    select: {
                        user_id: true,
                        username: true,
                        firstname: true,
                        lastname: true,
                        profile_url: true,
                    },
                },
            },
        });
        res.json(blockedUsers);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to get blocked users" });
    }
});
exports.getBlockedUsers = getBlockedUsers;
