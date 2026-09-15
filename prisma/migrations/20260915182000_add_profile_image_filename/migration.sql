-- AlterTable
ALTER TABLE "users" ADD COLUMN "profile_image_filename" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
