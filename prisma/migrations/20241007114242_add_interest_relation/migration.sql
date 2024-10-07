-- AddForeignKey
ALTER TABLE `User_Interest` ADD CONSTRAINT `User_Interest_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
