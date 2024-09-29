-- DropForeignKey
ALTER TABLE `User_Interest` DROP FOREIGN KEY `User_Interest_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `User_Interest` ADD CONSTRAINT `User_Interest_target_user_id_fkey` FOREIGN KEY (`target_user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
