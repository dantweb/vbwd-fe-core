/**
 * Feature access composable.
 *
 * Provides reactive feature access checking based on
 * user's subscription plan.
 */
import { computed } from 'vue';
import { useSubscriptionStore, type FeatureUsage } from '../stores/subscription';

/**
 * Feature access composable.
 *
 * Usage:
 * ```typescript
 * const { canAccess, getUsage, isWithinLimit } = useFeatureAccess();
 *
 * if (canAccess('premium_analytics')) {
 *   // Show premium analytics
 * }
 *
 * const usage = getUsage('api_calls');
 * console.log(`${usage.used} / ${usage.limit} API calls used`);
 * ```
 */
export function useFeatureAccess() {
  const subscription = useSubscriptionStore();

  /**
   * Check if user can access a feature.
   *
   * @param featureName - Name of the feature to check
   * @returns True if user has access
   */
  const canAccess = (featureName: string): boolean => {
    return subscription.hasFeature(featureName);
  };

  /**
   * Get usage statistics for a feature.
   *
   * @param featureName - Name of the feature
   * @returns Usage stats or default values if not tracked
   */
  const getUsage = (featureName: string): FeatureUsage => {
    return subscription.getUsage(featureName) || {
      limit: 0,
      used: 0,
      remaining: 0,
    };
  };

  /**
   * Check if user is within usage limit for a feature.
   *
   * @param featureName - Name of the feature
   * @param amount - Amount to check against (default 1)
   * @returns True if within limit
   */
  const isWithinLimit = (featureName: string, amount: number = 1): boolean => {
    return subscription.isWithinLimit(featureName, amount);
  };

  /**
   * Check if user has an active subscription.
   */
  const hasActiveSubscription = computed(() => subscription.isActive.value);

  /**
   * Get user's current plan name.
   */
  const planName = computed(() => subscription.planName.value);

  return {
    // Methods
    canAccess,
    getUsage,
    isWithinLimit,

    // Computed
    features: computed(() => subscription.features.value),
    usage: computed(() => subscription.usage.value),
    hasActiveSubscription,
    planName,
  };
}
