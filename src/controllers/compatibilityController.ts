import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

// Function to calculate personality score (same as before)
function calculatePersonalityScore(personality1: string[], personality2: string[]): number {
    const matchingTraits = personality1.filter(trait => personality2.includes(trait));
    return matchingTraits.length; // Score is the number of matching traits
}

// Function to calculate overall compatibility score (same as before)
function calculateCompatibility(breed1Data: any, breed2Data: any): string {
    // Check if breeds are the same
    if (breed1Data.breedName === breed2Data.breedName) {
        return "100.00"; // Return 100% if breeds are the same
    }

    let score = 0;

    // GoodWithOtherDogs: Weight higher values more heavily
    score += Math.min(breed1Data.goodWithDogs, breed2Data.goodWithDogs) * 2; // Weight: 2
    console.log("goodWithDogs", breed1Data.goodWithDogs, breed2Data.goodWithDogs);

    // Adaptability: Weight higher values
    score += Math.min(breed1Data.adaptability, breed2Data.adaptability) * 2; // Weight: 2
    console.log("adaptability", breed1Data.adaptability, breed2Data.adaptability);

    // Watchdog: Lower is better; ensure a minimum score of 1
    const watchdogScore = Math.max(1, 5 - Math.max(breed1Data.watchdog, breed2Data.watchdog));
    score += watchdogScore; // Weight: 1
    console.log("watchdog", breed1Data.watchdog, breed2Data.watchdog);

    // EnergyLevel: Adjusted scoring with more weight for exact matches
    if (breed1Data.energyLevel === breed2Data.energyLevel) {
        score += 5; // Perfect match
    } else {
        score += Math.max(0, 5 - Math.abs(breed1Data.energyLevel - breed2Data.energyLevel)); // Decreases with difference
    }
    console.log("energyLevel", breed1Data.energyLevel, breed2Data.energyLevel);

    // PlayfulnessLevel: Higher score if they are the same with more weight
    if (breed1Data.playfulnessLevel === breed2Data.playfulnessLevel) {
        score += 5; // Perfect match
    } else {
        score += Math.max(0, 5 - Math.abs(breed1Data.playfulnessLevel - breed2Data.playfulnessLevel)); // Decreases with difference
    }
    console.log("playfulnessLevel", breed1Data.playfulnessLevel, breed2Data.playfulnessLevel);

    // Personality Score: Weight personality score heavily
    const personalityScore = calculatePersonalityScore(
        breed1Data.personality.split(' / '), 
        breed2Data.personality.split(' / ')
    );
    score += personalityScore * 3; // Multiply by 3 for higher impact
    console.log("personalityScore", personalityScore);

    // Group Score: Higher score if breeds belong to the same group
    if (breed1Data.group === breed2Data.group) {
        score += 5; // Add a score of 5 for matching groups
    }
    console.log("group", breed1Data.group, breed2Data.group);
    console.log("==============================================")
    console.log(Math.max(breed1Data.personality.split(' / ').length, breed2Data.personality.split(' / ').length))

    // Calculate maximum possible score
    const maxScore = 5 + 5 + 5 + 5 + 5 + (Math.max(breed1Data.personality.split(' / ').length, breed2Data.personality.split(' / ').length) * 3) + 5; // Add 5 for the group match

    // Calculate percentage
    const percentage = (score / maxScore) * 100;

    return percentage.toFixed(2); // Return percentage formatted to 2 decimal places
}

// API endpoint to get compatibility score between a target pet and all pets owned by a user
export const getPetCompatibility = async (req: Request, res: Response) => {
    let { targetPetId } = req.query;
    if (targetPetId) {
        targetPetId = targetPetId.toString();
    } else {
        return res.status(400).json({ error: "chat_id is required" });
    }
    // let { targetPetId } = req.body; // Expect target pet ID in the request body
    // targetPetId = parseInt(targetPetId); // Convert target pet ID to number
    const userId = (req as any).user.userId; // Extract user ID from the request (assuming user info is stored in the request)

    try {
        // Fetch the target pet's breed information
        const targetPet = await prisma.pet.findUnique({
            where: { pet_id: parseInt(targetPetId) },
            include: { breed: true } // Assuming 'breed' relation is defined in Pet model
        });

        if (!targetPet) {
            return res.status(404).json({ error: "Target pet not found" });
        }

        // Fetch all pets owned by the user along with their breed information
        const userPets = await prisma.pet.findMany({
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
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to calculate compatibility" });
    }
};
