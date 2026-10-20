-- CreateTable
CREATE TABLE `ApplicantProfile` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `baseResumeId` VARCHAR(191) NULL,
    `answers` JSON NOT NULL,
    `custom` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ApplicantProfile_candidateId_key`(`candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobApplication` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `jobKey` VARCHAR(191) NOT NULL,
    `jobUrl` VARCHAR(1000) NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'DICE',
    `title` VARCHAR(300) NULL,
    `company` VARCHAR(300) NULL,
    `location` VARCHAR(300) NULL,
    `jobDescriptionId` VARCHAR(191) NULL,
    `coverage` INTEGER NULL,
    `status` ENUM('READY', 'OPENED', 'APPLIED', 'SKIPPED', 'NOT_AVAILABLE') NOT NULL DEFAULT 'READY',
    `notes` TEXT NULL,
    `fetchError` VARCHAR(500) NULL,
    `openedAt` DATETIME(3) NULL,
    `appliedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobApplication_ownerId_status_idx`(`ownerId`, `status`),
    INDEX `JobApplication_appliedAt_idx`(`appliedAt`),
    UNIQUE INDEX `JobApplication_candidateId_jobKey_key`(`candidateId`, `jobKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApplicantProfile` ADD CONSTRAINT `ApplicantProfile_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobApplication` ADD CONSTRAINT `JobApplication_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
