import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailField from '@/components/ui/DetailField.vue';

describe('DetailField', () => {
  it('renders label and value', () => {
    const wrapper = mount(DetailField, { props: { label: 'Name', value: 'Basic Plan' } });
    expect(wrapper.find('.vbwd-detail-field-label').text()).toBe('Name');
    expect(wrapper.find('.vbwd-detail-field-value').text()).toBe('Basic Plan');
  });

  it('shows dash when value is null', () => {
    const wrapper = mount(DetailField, { props: { label: 'Price', value: null } });
    expect(wrapper.find('.vbwd-detail-field-value').text()).toBe('-');
  });

  it('shows dash when value is undefined (default)', () => {
    const wrapper = mount(DetailField, { props: { label: 'Price' } });
    expect(wrapper.find('.vbwd-detail-field-value').text()).toBe('-');
  });

  it('shows dash when value is empty string', () => {
    const wrapper = mount(DetailField, { props: { label: 'Desc', value: '' } });
    expect(wrapper.find('.vbwd-detail-field-value').text()).toBe('-');
  });

  it('renders numeric value as string', () => {
    const wrapper = mount(DetailField, { props: { label: 'Tokens', value: 1000 } });
    expect(wrapper.find('.vbwd-detail-field-value').text()).toBe('1000');
  });

  it('renders Badge when badge prop is true', () => {
    const wrapper = mount(DetailField, { props: { label: 'Status', value: 'Active', badge: true } });
    expect(wrapper.find('.vbwd-detail-field-value').exists()).toBe(false);
    expect(wrapper.find('.vbwd-badge').exists()).toBe(true);
    expect(wrapper.find('.vbwd-badge').text()).toBe('Active');
  });

  it('passes badgeVariant to Badge', () => {
    const wrapper = mount(DetailField, {
      props: { label: 'Status', value: 'Paid', badge: true, badgeVariant: 'success' }
    });
    expect(wrapper.find('.vbwd-badge-success').exists()).toBe(true);
  });

  it('defaults badgeVariant to info', () => {
    const wrapper = mount(DetailField, {
      props: { label: 'Status', value: 'Pending', badge: true }
    });
    expect(wrapper.find('.vbwd-badge-info').exists()).toBe(true);
  });
});
