-- AlterTable
ALTER TABLE `Pet` ADD COLUMN `height` DOUBLE NULL,
    ADD COLUMN `mixed_breed` VARCHAR(191) NULL,
    ADD COLUMN `weight` DOUBLE NULL;

-- CreateTable
CREATE TABLE `Pet_Habit` (
    `habit_id` INTEGER NOT NULL,
    `habit_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`habit_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PetHabits` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PetHabits_AB_unique`(`A`, `B`),
    INDEX `_PetHabits_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_PetHabits` ADD CONSTRAINT `_PetHabits_A_fkey` FOREIGN KEY (`A`) REFERENCES `Pet`(`pet_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PetHabits` ADD CONSTRAINT `_PetHabits_B_fkey` FOREIGN KEY (`B`) REFERENCES `Pet_Habit`(`habit_id`) ON DELETE CASCADE ON UPDATE CASCADE;
