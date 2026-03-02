/**
 * One-time script: sync post statuses from their latest fact-check verdict.
 * Run with: npx tsx fix-post-statuses.ts
 */
import { config } from 'dotenv';
config(); // Load .env before importing Prisma

import { PrismaClient } from './src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
    // Find posts that have a fact-check but status is still PENDING or UNDER_REVIEW
    const stalePosts = await prisma.link.findMany({
        where: {
            status: { in: ['PENDING', 'UNDER_REVIEW'] as any },
            factChecks: { some: {} },
            deletedAt: null,
        },
        include: {
            factChecks: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
    });

    console.log(`Found ${stalePosts.length} posts with stale status.`);

    for (const post of stalePosts) {
        const latestVerdict = post.factChecks[0]?.verdict;
        if (!latestVerdict) continue;

        const newStatus = latestVerdict === 'VALIDATED' ? 'VALIDATED' : 'DEBUNKED';
        await prisma.link.update({
            where: { id: post.id },
            data: { status: newStatus as any },
        });

        console.log(`  Fixed post ${post.id}: ${post.status} -> ${newStatus}`);
    }

    console.log('Done!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
