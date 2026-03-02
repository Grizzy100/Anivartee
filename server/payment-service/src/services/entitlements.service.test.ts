import prisma from '../utils/prisma.js';
import { EntitlementsService } from './entitlements.service.js';
import { SubscriptionStatus } from '../generated/prisma/client.js';

jest.mock('../utils/prisma.js', () => ({
  __esModule: true,
  default: {
    subscription: {
      findFirst: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  subscription: {
    findFirst: jest.Mock;
  };
};

describe('EntitlementsService', () => {
  const service = new EntitlementsService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns no entitlements when user has no active subscription', async () => {
    mockedPrisma.subscription.findFirst.mockResolvedValue(null);

    const result = await service.getEntitlementsForUser('user-1');

    expect(result).toEqual({
      extraPosts: 0,
      extraEdits: 0,
      hasAnalytics: false,
      hasDrafts: false,
      hasProBadge: false,
    });
  });

  it('returns entitlements when user has active subscription with valid period', async () => {
    mockedPrisma.subscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: new Date(Date.now() + 60_000),
    });

    const result = await service.getEntitlementsForUser('user-1');

    expect(result).toEqual({
      extraPosts: 1,
      extraEdits: 1,
      hasAnalytics: true,
      hasDrafts: true,
      hasProBadge: true,
    });
  });
});

