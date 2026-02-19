/**
 * Subscription store for feature access management.
 *
 * Tracks user's subscription features and usage limits.
 */
import { ref, computed } from 'vue';

export interface FeatureUsage {
  limit: number;
  used: number;
  remaining: number;
}

export interface SubscriptionState {
  planName: string | null;
  features: string[];
  usage: Record<string, FeatureUsage>;
  isActive: boolean;
}

// Reactive state
const planName = ref<string | null>(null);
const features = ref<string[]>([]);
const usage = ref<Record<string, FeatureUsage>>({});
const isActive = ref(false);

/**
 * Subscription store composable.
 *
 * Provides subscription state and feature access methods.
 * Apps should sync this store with their API responses.
 */
export function useSubscriptionStore() {
  const hasFeature = (featureName: string): boolean => {
    return features.value.includes(featureName);
  };

  const getUsage = (featureName: string): FeatureUsage | null => {
    return usage.value[featureName] || null;
  };

  const isWithinLimit = (featureName: string, amount: number = 1): boolean => {
    const featureUsage = usage.value[featureName];
    if (!featureUsage) return true; // No limit tracked
    return featureUsage.remaining >= amount;
  };

  const setSubscription = (data: {
    planName?: string | null;
    features?: string[];
    usage?: Record<string, FeatureUsage>;
    isActive?: boolean;
  }) => {
    if (data.planName !== undefined) planName.value = data.planName;
    if (data.features !== undefined) features.value = data.features;
    if (data.usage !== undefined) usage.value = data.usage;
    if (data.isActive !== undefined) isActive.value = data.isActive;
  };

  const updateUsage = (featureName: string, newUsage: FeatureUsage) => {
    usage.value = {
      ...usage.value,
      [featureName]: newUsage,
    };
  };

  const clearSubscription = () => {
    planName.value = null;
    features.value = [];
    usage.value = {};
    isActive.value = false;
  };

  return {
    // State
    planName: computed(() => planName.value),
    features: computed(() => features.value),
    usage: computed(() => usage.value),
    isActive: computed(() => isActive.value),

    // Getters
    hasFeature,
    getUsage,
    isWithinLimit,

    // Actions
    setSubscription,
    updateUsage,
    clearSubscription,
  };
}

// Export type for use in other modules
export type SubscriptionStore = ReturnType<typeof useSubscriptionStore>;
