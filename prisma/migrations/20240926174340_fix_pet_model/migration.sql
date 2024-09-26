/*
  Warnings:

  - You are about to drop the `Personality` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Personality_Relation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pet_Breed_Relation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `breed_id` to the `Pet` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Personality_Relation` DROP FOREIGN KEY `Personality_Relation_breed_id_fkey`;

-- DropForeignKey
ALTER TABLE `Personality_Relation` DROP FOREIGN KEY `Personality_Relation_personality_id_fkey`;

-- DropForeignKey
ALTER TABLE `Pet_Breed_Relation` DROP FOREIGN KEY `Pet_Breed_Relation_breed_id_fkey`;

-- DropForeignKey
ALTER TABLE `Pet_Breed_Relation` DROP FOREIGN KEY `Pet_Breed_Relation_pet_id_fkey`;

-- AlterTable
ALTER TABLE `Pet` ADD COLUMN `breed_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Personality`;

-- DropTable
DROP TABLE `Personality_Relation`;

-- DropTable
DROP TABLE `Pet_Breed_Relation`;
