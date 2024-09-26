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
exports.getPetCompatibility = void 0;
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
// Function to calculate personality score (same as before)
function calculatePersonalityScore(personality1, personality2) {
    const matchingTraits = personality1.filter(trait => personality2.includes(trait));
    return matchingTraits.length; // Score is the number of matching traits
}
// Function to calculate overall compatibility score (same as before)
function calculateCompatibility(breed1Data, breed2Data) {
    let score = 0;
    // GoodWithOtherDogs: Higher is better
    score += Math.max(breed1Data.goodWithDogs, breed2Data.goodWithDogs);
    // Adaptability: Higher is better
    score += Math.max(breed1Data.adaptability, breed2Data.adaptability);
    // Watchdog: Higher is worse, but ensure a minimum score of 1
    const watchdogScore = Math.max(1, 5 - Math.max(breed1Data.watchdog, breed2Data.watchdog));
    score += watchdogScore;
    // EnergyLevel: Higher score if they are the same
    if (breed1Data.energyLevel === breed2Data.energyLevel) {
        score += 5; // Perfect match
    }
    else {
        score += Math.max(0, 5 - Math.abs(breed1Data.energyLevel - breed2Data.energyLevel)); // Score decreases with difference
    }
    // PlayfulnessLevel: Higher score if they are the same
    if (breed1Data.playfulnessLevel === breed2Data.playfulnessLevel) {
        score += 5; // Perfect match
    }
    else {
        score += Math.max(0, 5 - Math.abs(breed1Data.playfulnessLevel - breed2Data.playfulnessLevel)); // Score decreases with difference
    }
    // Personality Score: Weight personality score more heavily
    const personalityScore = calculatePersonalityScore(breed1Data.personality.split(' / '), breed2Data.personality.split(' / '));
    score += personalityScore * 2; // Multiply by 2 for higher impact
    // Calculate maximum possible score
    const maxScore = 5 + 5 + 5 + 5 + 5 + (Math.max(breed1Data.personality.split(' / ').length, breed2Data.personality.split(' / ').length) * 2);
    // Calculate percentage
    const percentage = (score / maxScore) * 100;
    return percentage.toFixed(2); // Return percentage formatted to 2 decimal places
}
// API endpoint to get compatibility score between a target pet and all pets owned by a user
const getPetCompatibility = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { targetPetId } = req.body; // Expect target pet ID in the request body
    const userId = req.user.userId; // Extract user ID from the request (assuming user info is stored in the request)
    try {
        // Fetch the target pet's breed information
        const targetPet = yield prisma.pet.findUnique({
            where: { pet_id: targetPetId },
            include: { breed: true } // Assuming 'breed' relation is defined in Pet model
        });
        if (!targetPet) {
            return res.status(404).json({ error: "Target pet not found" });
        }
        // Fetch all pets owned by the user along with their breed information
        const userPets = yield prisma.pet.findMany({
            where: { user_id: userId },
            include: { breed: true } // Assuming 'breed' relation is defined in Pet model
        });
        // Calculate compatibility scores for each pet owned by the user
        const compatibilityResults = userPets.map(pet => {
            const compatibilityPercentage = calculateCompatibility(pet.breed, targetPet.breed);
            return {
                petId: pet.pet_id,
                petName: pet.petname, // Assuming there is a 'name' field in the Pet model
                compatibilityPercentage
            };
        });
        res.json(compatibilityResults); // Return compatibility scores for all owned pets
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to calculate compatibility" });
    }
});
exports.getPetCompatibility = getPetCompatibility;
