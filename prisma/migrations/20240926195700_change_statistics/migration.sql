/*
  Warnings:

  - The primary key for the `User_Dislike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dislike_pet_id` on the `User_Dislike` table. All the data in the column will be lost.
  - The primary key for the `User_Saved` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `saved_pet_id` on the `User_Saved` table. All the data in the column will be lost.
  - Added the required column `dislike_user_id` to the `User_Dislike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saved_user_id` to the `User_Saved` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User_Dislike` DROP PRIMARY KEY,
    DROP COLUMN `dislike_pet_id`,
    ADD COLUMN `dislike_user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`user_id`, `dislike_user_id`);

-- AlterTable
ALTER TABLE `User_Saved` DROP PRIMARY KEY,
    DROP COLUMN `saved_pet_id`,
    ADD COLUMN `saved_user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`user_id`, `saved_user_id`);
