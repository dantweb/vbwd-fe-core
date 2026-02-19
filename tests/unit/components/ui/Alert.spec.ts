import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Alert from '@/components/ui/Alert.vue';

describe('Alert', () => {
  it('renders with default props', () => {
    const wrapper = mount(Alert);
    expect(wrapper.find('.vbwd-alert').exists()).toBe(true);
    expect(wrapper.classes()).toContain('vbwd-alert-info');
  });

  it('applies variant class', () => {
    const variants = ['success', 'error', 'warning', 'info'] as const;

    variants.forEach(variant => {
      const wrapper = mount(Alert, { props: { variant } });
      expect(wrapper.classes()).toContain(`vbwd-alert-${variant}`);
    });
  });

  it('renders title when provided', () => {
    const wrapper = mount(Alert, { props: { title: 'Alert Title' } });
    expect(wrapper.find('.vbwd-alert-title').text()).toBe('Alert Title');
  });

  it('renders message when provided', () => {
    const wrapper = mount(Alert, { props: { message: 'Alert message' } });
    expect(wrapper.find('.vbwd-alert-message').text()).toBe('Alert message');
  });

  it('renders slot content over message prop', () => {
    const wrapper = mount(Alert, {
      props: { message: 'Prop message' },
      slots: { default: 'Slot message' }
    });
    expect(wrapper.find('.vbwd-alert-message').text()).toBe('Slot message');
  });

  it('shows dismiss button when dismissible', () => {
    const wrapper = mount(Alert, { props: { dismissible: true } });
    expect(wrapper.find('.vbwd-alert-close').exists()).toBe(true);
  });

  it('hides dismiss button when not dismissible', () => {
    const wrapper = mount(Alert, { props: { dismissible: false } });
    expect(wrapper.find('.vbwd-alert-close').exists()).toBe(false);
  });

  it('hides alert and emits dismiss when dismiss button clicked', async () => {
    const wrapper = mount(Alert, { props: { dismissible: true } });
    await wrapper.find('.vbwd-alert-close').trigger('click');
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
    expect(wrapper.find('.vbwd-alert').exists()).toBe(false);
  });

  it('renders correct icon for each variant', () => {
    const variants = ['success', 'error', 'warning', 'info'] as const;

    variants.forEach(variant => {
      const wrapper = mount(Alert, { props: { variant } });
      expect(wrapper.find('.vbwd-alert-icon svg').exists()).toBe(true);
    });
  });

  it('renders custom icon via slot', () => {
    const wrapper = mount(Alert, {
      slots: { icon: '<span class="custom-icon">!</span>' }
    });
    expect(wrapper.find('.vbwd-alert-icon .custom-icon').exists()).toBe(true);
  });

  it('has correct role attribute', () => {
    const wrapper = mount(Alert);
    expect(wrapper.attributes('role')).toBe('alert');
  });
});
