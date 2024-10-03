/*
  Warnings:

  - You are about to alter the column `age` on the `Pet` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Pet` MODIFY `age` DOUBLE NULL;
