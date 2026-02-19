import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FeatureGate from '@/components/access/FeatureGate.vue';
import * as featureAccessModule from '@/composables/useFeatureAccess';

// Mock the composable
vi.mock('@/composables/useFeatureAccess', () => ({
  useFeatureAccess: vi.fn(),
}));

describe('FeatureGate', () => {
  let mockCanAccess: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCanAccess = vi.fn();
    vi.mocked(featureAccessModule.useFeatureAccess).mockReturnValue({
      canAccess: mockCanAccess,
    } as any);
  });

  it('should render slot content when user has access', () => {
    mockCanAccess.mockReturnValue(true);

    const wrapper = mount(FeatureGate, {
      props: { feature: 'premium_feature' },
      slots: { default: '<div class="content">Premium Content</div>' },
    });

    expect(wrapper.find('.content').exists()).toBe(true);
    expect(wrapper.find('.content').text()).toBe('Premium Content');
    expect(wrapper.find('.vbwd-feature-locked').exists()).toBe(false);
  });

  it('should render fallback when user lacks access', () => {
    mockCanAccess.mockReturnValue(false);

    const wrapper = mount(FeatureGate, {
      props: { feature: 'premium_feature' },
      slots: { default: '<div class="content">Premium Content</div>' },
    });

    expect(wrapper.find('.content').exists()).toBe(false);
    expect(wrapper.find('.vbwd-feature-locked').exists()).toBe(true);
  });

  it('should show required plan name in fallback', () => {
    mockCanAccess.mockReturnValue(false);

    const wrapper = mount(FeatureGate, {
      props: { feature: 'premium_feature', requiredPlan: 'Pro' },
    });

    expect(wrapper.text()).toContain('Pro plan');
  });

  it('should emit upgrade event when upgrade button clicked', async () => {
    mockCanAccess.mockReturnValue(false);

    const wrapper = mount(FeatureGate, {
      props: { feature: 'premium_feature' },
    });

    await wrapper.find('.vbwd-btn').trigger('click');

    expect(wrapper.emitted('upgrade')).toHaveLength(1);
  });

  it('should hide upgrade button when showUpgradeButton is false', () => {
    mockCanAccess.mockReturnValue(false);

    const wrapper = mount(FeatureGate, {
      props: { feature: 'premium_feature', showUpgradeButton: false },
    });

    expect(wrapper.find('.vbwd-btn').exists()).toBe(false);
  });

  it('should render custom fallback slot', () => {
    mockCanAccess.mockReturnValue(false);

    const wrapper = mount(FeatureGate, {
      props: { feature: 'premium_feature' },
      slots: {
        default: '<div class="content">Premium Content</div>',
        fallback: '<div class="custom-fallback">Custom Message</div>',
      },
    });

    expect(wrapper.find('.custom-fallback').exists()).toBe(true);
    expect(wrapper.find('.custom-fallback').text()).toBe('Custom Message');
  });

  it('should call canAccess with feature prop', () => {
    mockCanAccess.mockReturnValue(true);

    mount(FeatureGate, {
      props: { feature: 'test_feature' },
    });

    expect(mockCanAccess).toHaveBeenCalledWith('test_feature');
  });
});
