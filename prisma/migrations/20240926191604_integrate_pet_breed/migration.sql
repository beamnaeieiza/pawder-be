-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_breed_id_fkey` FOREIGN KEY (`breed_id`) REFERENCES `Pet_Breed`(`breed_id`) ON DELETE SET NULL ON UPDATE CASCADE;
