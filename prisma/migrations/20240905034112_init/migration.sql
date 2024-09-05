-- CreateTable
CREATE TABLE `User` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `username` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `phone_number` INTEGER NULL,
    `profile_url` VARCHAR(191) NULL,
    `firstname` VARCHAR(191) NULL,
    `lastname` VARCHAR(191) NULL,
    `verify_status` BOOLEAN NULL,
    `subscription` ENUM('FREE', 'PREMIUM') NULL,
    `location_latitude` VARCHAR(191) NULL,
    `location_longitude` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pet` (
    `pet_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `petname` VARCHAR(191) NULL,
    `gender` ENUM('MALE', 'FEMALE') NULL,
    `age` INTEGER NULL,
    `size` ENUM('SMALL', 'MEDIUM', 'LARGE') NULL,
    `rating` DOUBLE NULL,

    PRIMARY KEY (`pet_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event` (
    `event_id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` INTEGER NOT NULL,
    `eventTitle` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `eventDate` DATETIME(3) NULL,
    `status` BOOLEAN NULL,
    `createdAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `notification_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match` (
    `match_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id1` INTEGER NOT NULL,
    `user_id2` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`match_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Match_Message` (
    `message_id` INTEGER NOT NULL AUTO_INCREMENT,
    `match_id` INTEGER NOT NULL,
    `sender_id` INTEGER NOT NULL,
    `receiver_id` INTEGER NOT NULL,
    `types` ENUM('TEXT', 'IMAGE', 'VIDEO') NULL,
    `message` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL,

    PRIMARY KEY (`message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_Saved` (
    `user_id` INTEGER NOT NULL,
    `saved_user_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `saved_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_Dislike` (
    `user_id` INTEGER NOT NULL,
    `dislike_user_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `dislike_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_HaveMet` (
    `user_id` INTEGER NOT NULL,
    `met_user_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `met_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User_Interest` (
    `user_id` INTEGER NOT NULL,
    `target_id` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `target_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Event_UserEnrolled` (
    `enroll_id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`enroll_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pet_Breed` (
    `breed_id` INTEGER NOT NULL AUTO_INCREMENT,
    `breedName` VARCHAR(191) NOT NULL,
    `group` VARCHAR(191) NOT NULL,
    `heightInches` VARCHAR(191) NOT NULL,
    `weightPounds` VARCHAR(191) NOT NULL,
    `personality` VARCHAR(191) NOT NULL,
    `goodWithDogs` INTEGER NOT NULL,
    `playfulnessLevel` INTEGER NOT NULL,
    `watchdog` INTEGER NOT NULL,
    `adaptability` INTEGER NOT NULL,
    `energyLevel` INTEGER NOT NULL,

    PRIMARY KEY (`breed_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pet_Breed_Relation` (
    `pet_id` INTEGER NOT NULL,
    `breed_id` INTEGER NOT NULL,

    PRIMARY KEY (`pet_id`, `breed_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Personality` (
    `personality_id` INTEGER NOT NULL AUTO_INCREMENT,
    `trait` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`personality_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Personality_Relation` (
    `breed_id` INTEGER NOT NULL,
    `personality_id` INTEGER NOT NULL,

    PRIMARY KEY (`breed_id`, `personality_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_user_id1_fkey` FOREIGN KEY (`user_id1`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Match_Message` ADD CONSTRAINT `Match_Message_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `Match`(`match_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Saved` ADD CONSTRAINT `User_Saved_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Dislike` ADD CONSTRAINT `User_Dislike_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_HaveMet` ADD CONSTRAINT `User_HaveMet_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Interest` ADD CONSTRAINT `User_Interest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event_UserEnrolled` ADD CONSTRAINT `Event_UserEnrolled_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`event_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event_UserEnrolled` ADD CONSTRAINT `Event_UserEnrolled_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pet_Breed_Relation` ADD CONSTRAINT `Pet_Breed_Relation_pet_id_fkey` FOREIGN KEY (`pet_id`) REFERENCES `Pet`(`pet_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pet_Breed_Relation` ADD CONSTRAINT `Pet_Breed_Relation_breed_id_fkey` FOREIGN KEY (`breed_id`) REFERENCES `Pet_Breed`(`breed_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Personality_Relation` ADD CONSTRAINT `Personality_Relation_breed_id_fkey` FOREIGN KEY (`breed_id`) REFERENCES `Pet_Breed`(`breed_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Personality_Relation` ADD CONSTRAINT `Personality_Relation_personality_id_fkey` FOREIGN KEY (`personality_id`) REFERENCES `Personality`(`personality_id`) ON DELETE CASCADE ON UPDATE CASCADE;
