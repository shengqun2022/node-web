-- AlterTable: align User with schema (avatar, nickname were missing from initial migration)
ALTER TABLE `User` ADD COLUMN `avatar` VARCHAR(191) NULL,
    ADD COLUMN `nickname` VARCHAR(191) NULL;
