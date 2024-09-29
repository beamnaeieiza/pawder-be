-- DropForeignKey
ALTER TABLE `User_Dislike` DROP FOREIGN KEY `User_Dislike_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `User_HaveMet` DROP FOREIGN KEY `User_HaveMet_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `User_Saved` DROP FOREIGN KEY `User_Saved_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `User_Saved` ADD CONSTRAINT `User_Saved_saved_user_id_fkey` FOREIGN KEY (`saved_user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_Dislike` ADD CONSTRAINT `User_Dislike_dislike_user_id_fkey` FOREIGN KEY (`dislike_user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User_HaveMet` ADD CONSTRAINT `User_HaveMet_met_user_id_fkey` FOREIGN KEY (`met_user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
