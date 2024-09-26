/*
  Warnings:

  - The primary key for the `User_HaveMet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `met_pet_id` on the `User_HaveMet` table. All the data in the column will be lost.
  - The primary key for the `User_Interest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `target_pet_id` on the `User_Interest` table. All the data in the column will be lost.
  - Added the required column `target_user_id` to the `User_Interest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User_HaveMet` DROP PRIMARY KEY,
    DROP COLUMN `met_pet_id`,
    ADD PRIMARY KEY (`user_id`, `met_user_id`);

-- AlterTable
ALTER TABLE `User_Interest` DROP PRIMARY KEY,
    DROP COLUMN `target_pet_id`,
    ADD COLUMN `target_user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`user_id`, `target_user_id`);
