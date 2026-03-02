import 'dotenv/config';
import prisma from '../src/utils/prisma.js';

async function main() {
    const targetId = '550e8400-e29b-41d4-a716-446655440000';
    console.log("Deleting child PlanPrices first...");
    await prisma.planPrice.deleteMany({
        where: { planId: targetId }
    });
    console.log("Deleted PlanPrices. Now deleting SubscriptionPlan...");
    await prisma.subscriptionPlan.delete({
        where: { id: targetId }
    });
    console.log("Successfully deleted the dummy Pro plan.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
