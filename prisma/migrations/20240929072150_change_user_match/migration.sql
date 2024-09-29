-- AddForeignKey
ALTER TABLE `Match` ADD CONSTRAINT `Match_user_id2_fkey` FOREIGN KEY (`user_id2`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
