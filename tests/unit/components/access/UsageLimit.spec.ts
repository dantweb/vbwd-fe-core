import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UsageLimit from '@/components/access/UsageLimit.vue';
import * as featureAccessModule from '@/composables/useFeatureAccess';

// Mock the composable
vi.mock('@/composables/useFeatureAccess', () => ({
  useFeatureAccess: vi.fn(),
}));

describe('UsageLimit', () => {
  let mockGetUsage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetUsage = vi.fn();
    vi.mocked(featureAccessModule.useFeatureAccess).mockReturnValue({
      getUsage: mockGetUsage,
    } as any);
  });

  it('should display usage count', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 50, remaining: 50 });

    const wrapper = mount(UsageLimit, {
      props: { feature: 'api_calls' },
    });

    expect(wrapper.find('.vbwd-usage-count').text()).toBe('50 / 100');
  });

  it('should display label when provided', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 50, remaining: 50 });

    const wrapper = mount(UsageLimit, {
      props: { feature: 'api_calls', label: 'API Calls' },
    });

    expect(wrapper.find('.vbwd-usage-label').text()).toBe('API Calls');
  });

  it('should display feature name as label when no label provided', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 50, remaining: 50 });

    const wrapper = mount(UsageLimit, {
      props: { feature: 'api_calls' },
    });

    expect(wrapper.find('.vbwd-usage-label').text()).toBe('api_calls');
  });

  it('should show progress bar with correct width', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 50, remaining: 50 });

    const wrapper = mount(UsageLimit, {
      props: { feature: 'api_calls' },
    });

    const progress = wrapper.find('.vbwd-usage-progress');
    expect(progress.attributes('style')).toContain('width: 50%');
  });

  it('should show warning class when approaching limit', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 85, remaining: 15 });

    const wrapper = mount(UsageLimit, {
      props: { feature: 'api_calls', warningThreshold: 0.8 },
    });

    expect(wrapper.classes()).toContain('vbwd-usage-warning');
    expect(wrapper.find('.vbwd-usage-warning-text').exists()).toBe(true);
  });

  it('should show exceeded class when at limit', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 100, remaining: 0 });

    const wrapper = mount(UsageLimit, {
      props: { feature: 'api_calls' },
    });

    expect(wrapper.classes()).toContain('vbwd-usage-exceeded');
    expect(wrapper.find('.vbwd-usage-exceeded-text').exists()).toBe(true);
  });

  it('should display custom warning message', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 85, remaining: 15 });

    const wrapper = mount(UsageLimit, {
      props: {
        feature: 'api_calls',
        warningMessage: 'Running low!',
      },
    });

    expect(wrapper.find('.vbwd-usage-warning-text').text()).toBe('Running low!');
  });

  it('should display custom exceeded message', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 100, remaining: 0 });

    const wrapper = mount(UsageLimit, {
      props: {
        feature: 'api_calls',
        exceededMessage: 'Limit reached!',
      },
    });

    expect(wrapper.find('.vbwd-usage-exceeded-text').text()).toBe('Limit reached!');
  });

  it('should show infinity symbol for unlimited features', () => {
    mockGetUsage.mockReturnValue({ limit: 0, used: 50, remaining: 0 });

    const wrapper = mount(UsageLimit, {
      props: { feature: 'unlimited_feature' },
    });

    expect(wrapper.find('.vbwd-usage-count').text()).toBe('50 / ∞');
  });

  it('should not show progress bar for unlimited features', () => {
    mockGetUsage.mockReturnValue({ limit: 0, used: 50, remaining: 0 });

    const wrapper = mount(UsageLimit, {
      props: { feature: 'unlimited_feature' },
    });

    expect(wrapper.find('.vbwd-usage-bar').exists()).toBe(false);
  });

  it('should call getUsage with feature prop', () => {
    mockGetUsage.mockReturnValue({ limit: 100, used: 50, remaining: 50 });

    mount(UsageLimit, {
      props: { feature: 'test_feature' },
    });

    expect(mockGetUsage).toHaveBeenCalledWith('test_feature');
  });
});
