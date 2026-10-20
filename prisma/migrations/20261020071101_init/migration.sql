-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CREATOR', 'REVIEWER', 'READONLY') NOT NULL DEFAULT 'CREATOR',
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Domain` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `aliases` JSON NOT NULL,
    `subdomains` JSON NOT NULL,
    `terminology` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Domain_key_key`(`key`),
    UNIQUE INDEX `Domain_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobRole` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `aliases` JSON NOT NULL,
    `skillCategories` JSON NOT NULL,
    `summaryFocus` JSON NOT NULL,
    `includeQaBullets` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `JobRole_key_key`(`key`),
    UNIQUE INDEX `JobRole_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `domainId` VARCHAR(191) NOT NULL,
    `subdomain` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NULL,
    `seniority` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `projectPattern` TEXT NOT NULL,
    `requiredInputs` JSON NOT NULL,
    `optionalInputs` JSON NOT NULL,
    `domainBullets` JSON NOT NULL,
    `projectBullets` JSON NOT NULL,
    `supportingBullets` JSON NOT NULL,
    `qaBullets` JSON NOT NULL,
    `excludedClaims` JSON NOT NULL,
    `terminology` JSON NOT NULL,
    `suggestedTech` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `lastReviewedAt` DATETIME(3) NULL,
    `reviewer` VARCHAR(191) NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProjectTemplate_domainId_idx`(`domainId`),
    UNIQUE INDEX `ProjectTemplate_name_version_key`(`name`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Technology` (
    `id` VARCHAR(191) NOT NULL,
    `canonicalName` VARCHAR(191) NOT NULL,
    `aliases` JSON NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `roles` JSON NOT NULL,
    `domains` JSON NOT NULL,
    `projectTypes` JSON NOT NULL,
    `availableFrom` INTEGER NULL,
    `lifecycle` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Technology_canonicalName_key`(`canonicalName`),
    INDEX `Technology_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `normalizedName` VARCHAR(191) NOT NULL,
    `domainId` VARCHAR(191) NOT NULL,
    `subdomain` VARCHAR(191) NULL,
    `market` VARCHAR(191) NULL,
    `verificationStatus` ENUM('UNVERIFIED', 'CANDIDATE_CONFIRMED', 'VERIFIED') NOT NULL DEFAULT 'UNVERIFIED',
    `evidence` TEXT NULL,
    `verifiedAt` DATETIME(3) NULL,
    `isDemo` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `lastUsedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Client_normalizedName_key`(`normalizedName`),
    INDEX `Client_domainId_idx`(`domainId`),
    INDEX `Client_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientTechnology` (
    `clientId` VARCHAR(191) NOT NULL,
    `technologyId` VARCHAR(191) NOT NULL,
    `evidence` TEXT NULL,
    `verifiedAt` DATETIME(3) NULL,

    PRIMARY KEY (`clientId`, `technologyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientUsage` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ClientUsage_clientId_idx`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Candidate` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `team` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `linkedin` VARCHAR(191) NULL,
    `targetRole` VARCHAR(191) NULL,
    `targetTitle` VARCHAR(191) NULL,
    `domainKey` VARCHAR(191) NULL,
    `consentObtainedAt` DATETIME(3) NULL,
    `retentionUntil` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Candidate_ownerId_idx`(`ownerId`),
    INDEX `Candidate_domainKey_idx`(`domainKey`),
    INDEX `Candidate_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employment` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `employer` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NULL,
    `engagement` VARCHAR(191) NOT NULL DEFAULT 'FULL_TIME',
    `evidence` TEXT NULL,
    `status` ENUM('UNVERIFIED', 'CANDIDATE_CONFIRMED', 'VERIFIED') NOT NULL DEFAULT 'CANDIDATE_CONFIRMED',

    INDEX `Employment_candidateId_idx`(`candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Education` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `qualification` VARCHAR(191) NOT NULL,
    `startDate` DATE NULL,
    `endDate` DATE NULL,
    `status` ENUM('UNVERIFIED', 'CANDIDATE_CONFIRMED', 'VERIFIED') NOT NULL DEFAULT 'CANDIDATE_CONFIRMED',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Certification` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `issuer` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `issuedAt` DATE NULL,
    `status` ENUM('UNVERIFIED', 'CANDIDATE_CONFIRMED', 'VERIFIED') NOT NULL DEFAULT 'CANDIDATE_CONFIRMED',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CandidateSkill` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `technologyId` VARCHAR(191) NOT NULL,
    `years` DOUBLE NULL,
    `proficiency` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'USER_CONFIRMED',
    `status` ENUM('UNVERIFIED', 'CANDIDATE_CONFIRMED', 'VERIFIED') NOT NULL DEFAULT 'CANDIDATE_CONFIRMED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CandidateSkill_candidateId_technologyId_key`(`candidateId`, `technologyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `employmentId` VARCHAR(191) NULL,
    `templateId` VARCHAR(191) NULL,
    `position` INTEGER NOT NULL DEFAULT 1,
    `title` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `domainKey` VARCHAR(191) NOT NULL,
    `subdomain` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `responsibilities` JSON NOT NULL,
    `outcomes` JSON NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NULL,
    `clientConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Project_candidateId_idx`(`candidateId`),
    INDEX `Project_title_idx`(`title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectTechnology` (
    `projectId` VARCHAR(191) NOT NULL,
    `technologyId` VARCHAR(191) NOT NULL,
    `context` TEXT NULL,
    `evidence` TEXT NULL,
    `confirmed` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`projectId`, `technologyId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectBullet` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `type` ENUM('DOMAIN', 'PROJECT', 'SUPPORTING_TOOL', 'QA') NOT NULL,
    `sourceEvidence` TEXT NULL,
    `approvalState` ENUM('PROPOSED', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PROPOSED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Resume` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `domainKey` VARCHAR(191) NOT NULL,
    `roleKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Resume_candidateId_idx`(`candidateId`),
    INDEX `Resume_domainKey_roleKey_idx`(`domainKey`, `roleKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResumeVersion` (
    `id` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    `templateKey` VARCHAR(191) NOT NULL DEFAULT 'classic',
    `pageTarget` INTEGER NOT NULL DEFAULT 4,
    `projectMode` ENUM('FULL_DETAIL', 'STANDARD', 'CONCISE') NOT NULL DEFAULT 'STANDARD',
    `content` JSON NOT NULL,
    `validation` JSON NULL,
    `status` ENUM('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPORTED') NOT NULL DEFAULT 'DRAFT',
    `parentVersionId` VARCHAR(191) NULL,
    `changeNote` TEXT NULL,
    `reviewNote` TEXT NULL,
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ResumeVersion_status_idx`(`status`),
    INDEX `ResumeVersion_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `ResumeVersion_resumeId_version_key`(`resumeId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobDescription` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `sourceFileName` VARCHAR(191) NULL,
    `sourceMime` VARCHAR(191) NULL,
    `extractedText` LONGTEXT NOT NULL,
    `targetRole` VARCHAR(191) NULL,
    `processingStatus` ENUM('PENDING', 'EXTRACTED', 'ANALYZED', 'FAILED') NOT NULL DEFAULT 'EXTRACTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JobDescription_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JDRequirement` (
    `id` VARCHAR(191) NOT NULL,
    `jobDescriptionId` VARCHAR(191) NOT NULL,
    `keyword` VARCHAR(191) NOT NULL,
    `canonical` VARCHAR(191) NOT NULL,
    `technologyId` VARCHAR(191) NULL,
    `category` ENUM('MUST_HAVE', 'PREFERRED', 'DOMAIN', 'RESPONSIBILITY', 'QUALIFICATION', 'METHODOLOGY') NOT NULL,
    `weight` DOUBLE NOT NULL,
    `required` BOOLEAN NOT NULL,
    `sourceLine` TEXT NULL,

    INDEX `JDRequirement_jobDescriptionId_idx`(`jobDescriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResumeMatch` (
    `id` VARCHAR(191) NOT NULL,
    `resumeVersionId` VARCHAR(191) NOT NULL,
    `requirementId` VARCHAR(191) NOT NULL,
    `state` ENUM('SUPPORTED', 'PARTIAL', 'MISSING', 'NEEDS_CONFIRMATION') NOT NULL,
    `evidenceRefs` JSON NOT NULL,
    `explanation` TEXT NULL,
    `reviewerDecision` VARCHAR(191) NULL,
    `userConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ResumeMatch_resumeVersionId_requirementId_key`(`resumeVersionId`, `requirementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EditSuggestion` (
    `id` VARCHAR(191) NOT NULL,
    `resumeVersionId` VARCHAR(191) NOT NULL,
    `jobDescriptionId` VARCHAR(191) NULL,
    `section` VARCHAR(191) NOT NULL,
    `projectRef` VARCHAR(191) NULL,
    `originalText` TEXT NULL,
    `proposedText` TEXT NOT NULL,
    `jdKeywordRefs` JSON NOT NULL,
    `evidenceRefs` JSON NOT NULL,
    `requiresConfirmation` BOOLEAN NOT NULL DEFAULT false,
    `decision` ENUM('PROPOSED', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PROPOSED',
    `decidedById` VARCHAR(191) NULL,
    `decidedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EditSuggestion_resumeVersionId_idx`(`resumeVersionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GenerationJob` (
    `id` VARCHAR(191) NOT NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NULL,
    `status` ENUM('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `input` JSON NOT NULL,
    `inputVersion` INTEGER NULL,
    `outputVersionId` VARCHAR(191) NULL,
    `configVersion` VARCHAR(191) NOT NULL,
    `modelName` VARCHAR(191) NULL,
    `inputTokens` INTEGER NOT NULL DEFAULT 0,
    `outputTokens` INTEGER NOT NULL DEFAULT 0,
    `costUsd` DOUBLE NOT NULL DEFAULT 0,
    `durationMs` INTEGER NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `warnings` JSON NULL,
    `errorDetails` TEXT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GenerationJob_idempotencyKey_key`(`idempotencyKey`),
    INDEX `GenerationJob_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExportFile` (
    `id` VARCHAR(191) NOT NULL,
    `resumeId` VARCHAR(191) NOT NULL,
    `resumeVersionId` VARCHAR(191) NOT NULL,
    `format` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `storagePath` TEXT NULL,
    `data` LONGBLOB NULL,
    `bytes` INTEGER NOT NULL,
    `pageCount` INTEGER NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditEvent` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `recordType` VARCHAR(191) NOT NULL,
    `recordId` VARCHAR(191) NULL,
    `outcome` VARCHAR(191) NOT NULL,
    `detail` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditEvent_recordType_recordId_idx`(`recordType`, `recordId`),
    INDEX `AuditEvent_actorId_idx`(`actorId`),
    INDEX `AuditEvent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTemplate` ADD CONSTRAINT `ProjectTemplate_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTemplate` ADD CONSTRAINT `ProjectTemplate_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `JobRole`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Client` ADD CONSTRAINT `Client_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `Domain`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientTechnology` ADD CONSTRAINT `ClientTechnology_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientTechnology` ADD CONSTRAINT `ClientTechnology_technologyId_fkey` FOREIGN KEY (`technologyId`) REFERENCES `Technology`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientUsage` ADD CONSTRAINT `ClientUsage_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Candidate` ADD CONSTRAINT `Candidate_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Employment` ADD CONSTRAINT `Employment_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Education` ADD CONSTRAINT `Education_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Certification` ADD CONSTRAINT `Certification_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateSkill` ADD CONSTRAINT `CandidateSkill_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CandidateSkill` ADD CONSTRAINT `CandidateSkill_technologyId_fkey` FOREIGN KEY (`technologyId`) REFERENCES `Technology`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_employmentId_fkey` FOREIGN KEY (`employmentId`) REFERENCES `Employment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `ProjectTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTechnology` ADD CONSTRAINT `ProjectTechnology_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectTechnology` ADD CONSTRAINT `ProjectTechnology_technologyId_fkey` FOREIGN KEY (`technologyId`) REFERENCES `Technology`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectBullet` ADD CONSTRAINT `ProjectBullet_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resume` ADD CONSTRAINT `Resume_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `Candidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResumeVersion` ADD CONSTRAINT `ResumeVersion_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `Resume`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResumeVersion` ADD CONSTRAINT `ResumeVersion_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JobDescription` ADD CONSTRAINT `JobDescription_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JDRequirement` ADD CONSTRAINT `JDRequirement_jobDescriptionId_fkey` FOREIGN KEY (`jobDescriptionId`) REFERENCES `JobDescription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResumeMatch` ADD CONSTRAINT `ResumeMatch_resumeVersionId_fkey` FOREIGN KEY (`resumeVersionId`) REFERENCES `ResumeVersion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResumeMatch` ADD CONSTRAINT `ResumeMatch_requirementId_fkey` FOREIGN KEY (`requirementId`) REFERENCES `JDRequirement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EditSuggestion` ADD CONSTRAINT `EditSuggestion_resumeVersionId_fkey` FOREIGN KEY (`resumeVersionId`) REFERENCES `ResumeVersion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GenerationJob` ADD CONSTRAINT `GenerationJob_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `Resume`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExportFile` ADD CONSTRAINT `ExportFile_resumeId_fkey` FOREIGN KEY (`resumeId`) REFERENCES `Resume`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditEvent` ADD CONSTRAINT `AuditEvent_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
