import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Badge from '@/components/ui/Badge.vue';

describe('Badge', () => {
  it('renders with default props', () => {
    const wrapper = mount(Badge);
    expect(wrapper.find('.vbwd-badge').exists()).toBe(true);
    expect(wrapper.classes()).toContain('vbwd-badge-primary');
    expect(wrapper.classes()).toContain('vbwd-badge-md');
  });

  it('renders label prop', () => {
    const wrapper = mount(Badge, { props: { label: 'New' } });
    expect(wrapper.text()).toBe('New');
  });

  it('renders slot content over label prop', () => {
    const wrapper = mount(Badge, {
      props: { label: 'Prop Label' },
      slots: { default: 'Slot Content' }
    });
    expect(wrapper.text()).toBe('Slot Content');
  });

  it('applies variant class', () => {
    const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'] as const;

    variants.forEach(variant => {
      const wrapper = mount(Badge, { props: { variant } });
      expect(wrapper.classes()).toContain(`vbwd-badge-${variant}`);
    });
  });

  it('applies size class', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach(size => {
      const wrapper = mount(Badge, { props: { size } });
      expect(wrapper.classes()).toContain(`vbwd-badge-${size}`);
    });
  });
});
