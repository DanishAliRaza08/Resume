-- AlterTable
ALTER TABLE `Technology` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `knowledge` JSON NULL;

-- CreateTable
CREATE TABLE `ResumeSample` (
    `id` VARCHAR(191) NOT NULL,
    `domainKey` VARCHAR(191) NOT NULL,
    `roleKey` VARCHAR(191) NOT NULL,
    `sourceName` VARCHAR(255) NOT NULL,
    `text` LONGTEXT NOT NULL,
    `bullets` JSON NOT NULL,
    `bulletCount` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ResumeSample_domainKey_roleKey_idx`(`domainKey`, `roleKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResumeSample` ADD CONSTRAINT `ResumeSample_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
