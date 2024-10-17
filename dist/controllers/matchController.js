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
exports.getUserSaved = exports.getUserNotInterests = exports.getUserInterests = exports.savePet = exports.notLikePet = exports.likePet = exports.randomPet = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const haversine_distance_1 = __importDefault(require("haversine-distance"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const randomPet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.userId;
    try {
        const user = yield prisma.user.findUnique({
            where: { user_id: id },
            select: {
                location_latitude: true,
                location_longitude: true,
                distance_interest: true,
            },
        });
        if (!user ||
            !user.location_latitude === null ||
            !user.location_longitude === null) {
            return res.status(404).json({ error: "User location not found." });
        }
        const userLocation = {
            latitude: parseFloat(user.location_latitude),
            longitude: parseFloat(user.location_longitude),
        };
        const metPets = yield prisma.user_HaveMet.findMany({
            where: { user_id: id },
            select: { met_user_id: true }, // Select only the met_pet_id
        });
        const metPetIds = metPets.map((met) => met.met_user_id);
        const totalCount = yield prisma.user.count({
            where: {
                NOT: {
                    user_id: {
                        in: metPetIds,
                    },
                },
            },
        });
        if (totalCount === 0) {
            return res.status(404).json({ error: "No available user found." });
        }
        const randomIndex = Math.floor(Math.random() * totalCount);
        // console.log(`Total Count: ${totalCount}, Random Index: ${randomIndex}`);
        const potentialPets = yield prisma.user.findMany({
            where: {
                NOT: {
                    user_id: {
                        in: [...metPetIds, id],
                    },
                },
            },
            include: {
                pets: {
                    include: {
                        habits: true,
                    },
                },
            },
        });
        const usersWithinDistance = potentialPets
            .filter((petUser) => {
            if (petUser.location_latitude === null ||
                petUser.location_longitude === null)
                return false;
            const petUserLocation = {
                latitude: parseFloat(petUser.location_latitude),
                longitude: parseFloat(petUser.location_longitude),
            };
            const distance = (0, haversine_distance_1.default)(userLocation, petUserLocation);
            return distance <= parseFloat(user.distance_interest) * 1000; // 10km in meters
        })
            .map((metUser) => {
            const distanceInMeters = (0, haversine_distance_1.default)(userLocation, {
                latitude: parseFloat(metUser.location_latitude),
                longitude: parseFloat(metUser.location_longitude),
            });
            const distanceInKm = (distanceInMeters / 1000).toFixed(2); // Convert meters to kilometers
            return Object.assign(Object.assign({}, metUser), { distance: distanceInKm });
        });
        const usersWithPets = usersWithinDistance.filter((user) => {
            const hasPets = Array.isArray(user.pets) && user.pets.length > 0;
            return hasPets;
        });
        const shuffledUsers = usersWithPets.sort(() => 0.5 - Math.random());
        res.json(shuffledUsers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve random pet." });
    }
});
exports.randomPet = randomPet;
const likePet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    let { target_user_id } = req.body;
    target_user_id = parseInt(target_user_id);
    if (!target_user_id) {
        return res.status(400).json({ error: "Target User ID is required." });
    }
    try {
        const existingLike = yield prisma.user_Interest.findUnique({
            where: {
                user_id_target_user_id: {
                    user_id: userId,
                    target_user_id: target_user_id,
                },
            },
        });
        if (existingLike) {
            return res
                .status(409)
                .json({ error: "You have already liked this user." });
        }
        const likeToMatch = yield prisma.user_Interest.findUnique({
            where: {
                user_id_target_user_id: {
                    user_id: target_user_id,
                    target_user_id: userId,
                },
            },
        });
        if (likeToMatch) {
            const newLike = yield prisma.user_Interest.create({
                data: {
                    user_id: userId,
                    target_user_id: target_user_id,
                },
            });
            const newMet = yield prisma.user_HaveMet.create({
                data: {
                    user_id: userId,
                    met_user_id: target_user_id,
                },
            });
            const newMatch = yield prisma.match.create({
                data: {
                    user_id1: userId,
                    user_id2: target_user_id,
                },
            });
            const user = yield prisma.user.findUnique({
                where: { user_id: parseInt(userId) },
            });
            const userTarget = yield prisma.user.findUnique({
                where: { user_id: parseInt(target_user_id) },
            });
            const notification = yield prisma.notification.create({
                data: {
                    user_id: userId,
                    title: "New Match",
                    message: "You have match with " + (userTarget === null || userTarget === void 0 ? void 0 : userTarget.firstname),
                    read_status: false,
                },
            });
            const notification2 = yield prisma.notification.create({
                data: {
                    user_id: target_user_id,
                    title: "New Match",
                    message: "You have match with " + (user === null || user === void 0 ? void 0 : user.firstname),
                    read_status: false,
                },
            });
            res.status(201).json(newMatch);
        }
        else {
            const newLike = yield prisma.user_Interest.create({
                data: {
                    user_id: userId,
                    target_user_id: target_user_id,
                },
            });
            const newMet = yield prisma.user_HaveMet.create({
                data: {
                    user_id: userId,
                    met_user_id: target_user_id,
                },
            });
            res.status(201).json(newLike);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to like user." });
    }
});
exports.likePet = likePet;
const notLikePet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    let { dislike_user_id } = req.body;
    dislike_user_id = parseInt(dislike_user_id);
    if (!dislike_user_id) {
        return res.status(400).json({ error: "Target User ID is required." });
    }
    try {
        const existingDislike = yield prisma.user_Dislike.findUnique({
            where: {
                user_id_dislike_user_id: {
                    user_id: userId,
                    dislike_user_id: dislike_user_id,
                },
            },
        });
        if (existingDislike) {
            return res
                .status(409)
                .json({ error: "You have already disliked this user." });
        }
        const newMet = yield prisma.user_HaveMet.create({
            data: {
                user_id: userId,
                met_user_id: dislike_user_id,
            },
        });
        const newDislike = yield prisma.user_Dislike.create({
            data: {
                user_id: userId,
                dislike_user_id: dislike_user_id,
            },
        });
        res.status(201).json(newDislike);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to dislike user." });
    }
});
exports.notLikePet = notLikePet;
const savePet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    let { saved_user_id } = req.body;
    saved_user_id = parseInt(saved_user_id);
    if (!saved_user_id) {
        return res.status(400).json({ error: "Target User ID is required." });
    }
    try {
        const existingSaved = yield prisma.user_Saved.findUnique({
            where: {
                user_id_saved_user_id: {
                    user_id: userId,
                    saved_user_id: saved_user_id,
                },
            },
        });
        if (existingSaved) {
            return res
                .status(409)
                .json({ error: "You have already saved this user." });
        }
        const newMet = yield prisma.user_HaveMet.create({
            data: {
                user_id: userId,
                met_user_id: saved_user_id,
            },
        });
        const newSave = yield prisma.user_Saved.create({
            data: {
                user_id: userId,
                saved_user_id: saved_user_id,
            },
        });
        res.status(201).json(newSave);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save user." });
    }
});
exports.savePet = savePet;
const getUserInterests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const userInterests = yield prisma.user_Interest.findMany({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        username: true,
                        firstname: true,
                        email: true,
                        birthdate: true,
                        pets: {
                            select: {
                                petname: true,
                                pet_url: true,
                                gender: true,
                                breed: {
                                    select: {
                                        breedName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (userInterests.length === 0) {
            return res
                .status(404)
                .json({ message: "No interests found for this user." });
        }
        res.json(userInterests);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve user interests." });
    }
});
exports.getUserInterests = getUserInterests;
const getUserNotInterests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const userNotInterests = yield prisma.user_Dislike.findMany({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        username: true,
                        firstname: true,
                        email: true,
                        birthdate: true,
                        pets: {
                            select: {
                                petname: true,
                                pet_url: true,
                                gender: true,
                                breed: {
                                    select: {
                                        breedName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (userNotInterests.length === 0) {
            return res
                .status(404)
                .json({ message: "No not interests found for this user." });
        }
        res.json(userNotInterests);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve user not interests." });
    }
});
exports.getUserNotInterests = getUserNotInterests;
const getUserSaved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const userSaved = yield prisma.user_Saved.findMany({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        username: true,
                        firstname: true,
                        email: true,
                        birthdate: true,
                        pets: {
                            select: {
                                petname: true,
                                pet_url: true,
                                gender: true,
                                breed: {
                                    select: {
                                        breedName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (userSaved.length === 0) {
            return res.status(404).json({ message: "No saved found for this user." });
        }
        res.json(userSaved);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "Failed to retrieve user saved information." });
    }
});
exports.getUserSaved = getUserSaved;
