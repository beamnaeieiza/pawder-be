/*
  Warnings:

  - The primary key for the `User_Dislike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dislike_user_id` on the `User_Dislike` table. All the data in the column will be lost.
  - The primary key for the `User_HaveMet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User_Interest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `target_id` on the `User_Interest` table. All the data in the column will be lost.
  - The primary key for the `User_Saved` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `saved_user_id` on the `User_Saved` table. All the data in the column will be lost.
  - Added the required column `dislike_pet_id` to the `User_Dislike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `met_pet_id` to the `User_HaveMet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `target_pet_id` to the `User_Interest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saved_pet_id` to the `User_Saved` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User_Dislike` DROP PRIMARY KEY,
    DROP COLUMN `dislike_user_id`,
    ADD COLUMN `dislike_pet_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`user_id`, `dislike_pet_id`);

-- AlterTable
ALTER TABLE `User_HaveMet` DROP PRIMARY KEY,
    ADD COLUMN `met_pet_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`user_id`, `met_pet_id`);

-- AlterTable
ALTER TABLE `User_Interest` DROP PRIMARY KEY,
    DROP COLUMN `target_id`,
    ADD COLUMN `target_pet_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`user_id`, `target_pet_id`);

-- AlterTable
ALTER TABLE `User_Saved` DROP PRIMARY KEY,
    DROP COLUMN `saved_user_id`,
    ADD COLUMN `saved_pet_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`user_id`, `saved_pet_id`);
