-- CreateTable
CREATE TABLE "userinfo" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userinfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userinfo_email_key" ON "userinfo"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "userinfo"("email");
