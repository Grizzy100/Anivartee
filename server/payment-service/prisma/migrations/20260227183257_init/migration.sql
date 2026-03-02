-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "payments";

-- CreateEnum
CREATE TYPE "payments"."RoleType" AS ENUM ('USER', 'CHECKER');

-- CreateEnum
CREATE TYPE "payments"."RegionTier" AS ENUM ('IN', 'SEA', 'GLOBAL');

-- CreateEnum
CREATE TYPE "payments"."SubscriptionInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "payments"."SubscriptionStatus" AS ENUM ('INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID');

-- CreateTable
CREATE TABLE "payments"."UserPaymentCustomer" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "stripeCustomerId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPaymentCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."SubscriptionPlan" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "stripePriceId" VARCHAR(255),
    "amountCents" INTEGER,
    "currency" VARCHAR(10),
    "roleType" "payments"."RoleType" NOT NULL DEFAULT 'USER',
    "interval" "payments"."SubscriptionInterval" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."PlanPrice" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "regionTier" "payments"."RegionTier" NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "amount" INTEGER NOT NULL,
    "stripePriceId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."Subscription" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "stripeSubscriptionId" VARCHAR(255) NOT NULL,
    "status" "payments"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "regionTier" "payments"."RegionTier",
    "currency" VARCHAR(10),
    "amount" INTEGER,
    "provider" VARCHAR(50) NOT NULL DEFAULT 'STRIPE',
    "providerRef" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments"."PaymentEvent" (
    "id" UUID NOT NULL,
    "stripeEventId" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPaymentCustomer_userId_key" ON "payments"."UserPaymentCustomer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPaymentCustomer_stripeCustomerId_key" ON "payments"."UserPaymentCustomer"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "UserPaymentCustomer_stripeCustomerId_idx" ON "payments"."UserPaymentCustomer"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_stripePriceId_key" ON "payments"."SubscriptionPlan"("stripePriceId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_active_idx" ON "payments"."SubscriptionPlan"("active");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_stripePriceId_key" ON "payments"."PlanPrice"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_planId_regionTier_key" ON "payments"."PlanPrice"("planId", "regionTier");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "payments"."Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_providerRef_key" ON "payments"."Subscription"("providerRef");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "payments"."Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "payments"."Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "payments"."Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_stripeEventId_key" ON "payments"."PaymentEvent"("stripeEventId");

-- CreateIndex
CREATE INDEX "PaymentEvent_stripeEventId_idx" ON "payments"."PaymentEvent"("stripeEventId");

-- AddForeignKey
ALTER TABLE "payments"."PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "payments"."SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."Subscription" ADD CONSTRAINT "Subscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "payments"."UserPaymentCustomer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "payments"."SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
