import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;


function calculatePersonalityScore(
  personality1: string[],
  personality2: string[]
): number {
  const matchingTraits = personality1.filter((trait) =>
    personality2.includes(trait)
  );
  return matchingTraits.length;
}


function calculateCompatibility(breed1Data: any, breed2Data: any) {
  let score = 0;
  const explanations: any = {}; 


  const goodWithDogsScore =
    Math.min(breed1Data.goodWithDogs, breed2Data.goodWithDogs) * 2;
  score += goodWithDogsScore; 
  explanations.goodWithOtherDogs1 = breed1Data.goodWithDogs;
  explanations.goodWithOtherDogs2 = breed2Data.goodWithDogs;
  explanations.goodWithOtherDogs = `${breed1Data.breedName} has ${breed1Data.goodWithDogs} points on good with other dogs, while ${breed2Data.breedName} has ${breed2Data.goodWithDogs}`;

  const adaptabilityScore =
    Math.min(breed1Data.adaptability, breed2Data.adaptability) * 2;
  score += adaptabilityScore; 
  explanations.adaptability1 = breed1Data.adaptability;
  explanations.adaptability2 = breed2Data.adaptability;
  explanations.adaptability = `${breed1Data.breedName} has ${breed1Data.adaptability} points on adaptability, while ${breed2Data.breedName} has ${breed2Data.adaptability}`;

  const watchdogScore = Math.max(
    1,
    5 - Math.max(breed1Data.watchdog, breed2Data.watchdog)
  );
  score += watchdogScore; 
  explanations.watchdog1 = breed1Data.watchdog;
  explanations.watchdog2 = breed2Data.watchdog;
  explanations.watchdog = `${breed1Data.breedName} has ${breed1Data.watchdog} points on watchdog trait, while ${breed2Data.breedName} has ${breed2Data.watchdog}.`;

  let energyLevelScore = 0;
  if (breed1Data.energyLevel === breed2Data.energyLevel) {
    energyLevelScore = 5; 
  } else {
    energyLevelScore = Math.max(
      0,
      5 - Math.abs(breed1Data.energyLevel - breed2Data.energyLevel)
    ); 
  }
  score += energyLevelScore;
  explanations.energyLevel1 = breed1Data.energyLevel;
  explanations.energyLevel2 = breed2Data.energyLevel;
  explanations.energyLevel = `${breed1Data.breedName} has ${breed1Data.energyLevel} points on energy level, while ${breed2Data.breedName} has ${breed2Data.energyLevel}`;


  let playfulnessLevelScore = 0;
  if (breed1Data.playfulnessLevel === breed2Data.playfulnessLevel) {
    playfulnessLevelScore = 5; 
  } else {
    playfulnessLevelScore = Math.max(
      0,
      5 - Math.abs(breed1Data.playfulnessLevel - breed2Data.playfulnessLevel)
    );
  }
  score += playfulnessLevelScore;
  explanations.playfulnessLevel1 = breed1Data.playfulnessLevel;
  explanations.playfulnessLevel2 = breed2Data.playfulnessLevel;
  explanations.playfulnessLevel = `${breed1Data.breedName} has ${breed1Data.playfulnessLevel} points on playfulness, while ${breed2Data.breedName} has ${breed2Data.playfulnessLevel}`;


  const personalityScore = calculatePersonalityScore(
    breed1Data.personality.split(" / "),
    breed2Data.personality.split(" / ")
  );
  score += personalityScore * 3; 
  explanations.personalityScore = `${breed1Data.breedName} and ${
    breed2Data.breedName
  } share ${personalityScore} common traits, contributing ${
    personalityScore * 3
  } points to the overall compatibility.`;

  const groupScore = breed1Data.group === breed2Data.group ? 5 : 0;
  score += groupScore;
  if (breed1Data.group !== breed2Data.group) {
    explanations.group = `${breed1Data.breedName} and ${breed2Data.breedName} both belong to the different group. `;
  } else {
    explanations.group = `${breed1Data.breedName} and ${breed2Data.breedName} both belong to the ${breed1Data.group} group.`;
  }

  const maxScore =
    5 +
    5 +
    5 +
    5 +
    5 +
    Math.max(
      breed1Data.personality.split(" / ").length,
      breed2Data.personality.split(" / ").length
    ) *
      3 +
    5; 

  const percentage = (score / maxScore) * 100;

  return {
    percentage: percentage.toFixed(2),
    explanations,
  };
}

export const getPetCompatibility = async (req: Request, res: Response) => {
  let { targetPetId } = req.query;
  if (targetPetId) {
    targetPetId = targetPetId.toString();
  } else {
    return res.status(400).json({ error: "target pet id is required" });
  }

  const userId = (req as any).user.userId; 

  try {
    const targetPet = await prisma.pet.findUnique({
      where: { pet_id: parseInt(targetPetId) },
      include: { breed: true }, 
    });

    if (!targetPet) {
      return res.status(404).json({ error: "Target pet not found" });
    }


    const userPets = await prisma.pet.findMany({
      where: { user_id: userId },
      include: { breed: true },
    });


    const compatibilityResults = userPets.map((pet) => {
      const { percentage, explanations } = calculateCompatibility(
        pet.breed,
        targetPet.breed
      );
      return {
        petId: pet.pet_id,
        petName: pet.petname, 
        breed: pet.breed?.breedName,
        pet_url: pet.pet_url,
        compatibilityPercentage: percentage,
        explanations,
      };
    });

    res.json(compatibilityResults);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to calculate compatibility" });
  }
};
