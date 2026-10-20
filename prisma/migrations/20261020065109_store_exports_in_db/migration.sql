-- AlterTable
ALTER TABLE "ExportFile" ADD COLUMN     "data" BYTEA,
ALTER COLUMN "storagePath" DROP NOT NULL;
