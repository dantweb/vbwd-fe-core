import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFeatureAccess } from '@/composables/useFeatureAccess';
import * as subscriptionStore from '@/stores/subscription';

// Mock the subscription store
vi.mock('@/stores/subscription', () => ({
  useSubscriptionStore: vi.fn(),
}));

describe('useFeatureAccess', () => {
  let mockSubscriptionStore: {
    hasFeature: ReturnType<typeof vi.fn>;
    getUsage: ReturnType<typeof vi.fn>;
    isWithinLimit: ReturnType<typeof vi.fn>;
    isActive: { value: boolean };
    planName: { value: string | null };
    features: { value: string[] };
    usage: { value: Record<string, any> };
  };

  beforeEach(() => {
    mockSubscriptionStore = {
      hasFeature: vi.fn(),
      getUsage: vi.fn(),
      isWithinLimit: vi.fn(),
      isActive: { value: true },
      planName: { value: 'Pro' },
      features: { value: ['feature_a', 'feature_b'] },
      usage: { value: {} },
    };
    vi.mocked(subscriptionStore.useSubscriptionStore).mockReturnValue(
      mockSubscriptionStore as any
    );
  });

  it('should return true when user has feature access', () => {
    mockSubscriptionStore.hasFeature.mockReturnValue(true);

    const { canAccess } = useFeatureAccess();
    const result = canAccess('premium_feature');

    expect(mockSubscriptionStore.hasFeature).toHaveBeenCalledWith('premium_feature');
    expect(result).toBe(true);
  });

  it('should return false when user lacks feature access', () => {
    mockSubscriptionStore.hasFeature.mockReturnValue(false);

    const { canAccess } = useFeatureAccess();
    const result = canAccess('enterprise_feature');

    expect(result).toBe(false);
  });

  it('should return correct usage statistics', () => {
    mockSubscriptionStore.getUsage.mockReturnValue({
      limit: 100,
      used: 50,
      remaining: 50,
    });

    const { getUsage } = useFeatureAccess();
    const result = getUsage('api_calls');

    expect(result).toEqual({
      limit: 100,
      used: 50,
      remaining: 50,
    });
  });

  it('should return default usage when not tracked', () => {
    mockSubscriptionStore.getUsage.mockReturnValue(null);

    const { getUsage } = useFeatureAccess();
    const result = getUsage('unknown_feature');

    expect(result).toEqual({
      limit: 0,
      used: 0,
      remaining: 0,
    });
  });

  it('should check usage limits correctly', () => {
    mockSubscriptionStore.isWithinLimit.mockReturnValue(true);

    const { isWithinLimit } = useFeatureAccess();
    const result = isWithinLimit('api_calls', 5);

    expect(mockSubscriptionStore.isWithinLimit).toHaveBeenCalledWith('api_calls', 5);
    expect(result).toBe(true);
  });

  it('should use default amount of 1 for limit check', () => {
    mockSubscriptionStore.isWithinLimit.mockReturnValue(true);

    const { isWithinLimit } = useFeatureAccess();
    isWithinLimit('api_calls');

    expect(mockSubscriptionStore.isWithinLimit).toHaveBeenCalledWith('api_calls', 1);
  });

  it('should expose hasActiveSubscription computed', () => {
    const { hasActiveSubscription } = useFeatureAccess();
    expect(hasActiveSubscription.value).toBe(true);
  });

  it('should return false for hasActiveSubscription when inactive', () => {
    mockSubscriptionStore.isActive.value = false;
    const { hasActiveSubscription } = useFeatureAccess();
    expect(hasActiveSubscription.value).toBe(false);
  });

  it('should expose planName computed', () => {
    const { planName } = useFeatureAccess();
    expect(planName.value).toBe('Pro');
  });

  it('should expose features computed', () => {
    const { features } = useFeatureAccess();
    expect(features.value).toEqual(['feature_a', 'feature_b']);
  });
});
