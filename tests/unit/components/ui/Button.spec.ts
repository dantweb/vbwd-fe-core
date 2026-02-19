import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '@/components/ui/Button.vue';

describe('Button', () => {
  it('renders with default props', () => {
    const wrapper = mount(Button);
    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.classes()).toContain('vbwd-btn');
    expect(wrapper.classes()).toContain('vbwd-btn-primary');
    expect(wrapper.classes()).toContain('vbwd-btn-md');
  });

  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    });
    expect(wrapper.text()).toBe('Click me');
  });

  it('applies variant class', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost', 'link'] as const;

    variants.forEach(variant => {
      const wrapper = mount(Button, { props: { variant } });
      expect(wrapper.classes()).toContain(`vbwd-btn-${variant}`);
    });
  });

  it('applies size class', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach(size => {
      const wrapper = mount(Button, { props: { size } });
      expect(wrapper.classes()).toContain(`vbwd-btn-${size}`);
    });
  });

  it('sets disabled attribute when disabled prop is true', () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('shows spinner when loading', () => {
    const wrapper = mount(Button, { props: { loading: true } });
    expect(wrapper.find('.vbwd-spinner').exists()).toBe(true);
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('applies block class when block prop is true', () => {
    const wrapper = mount(Button, { props: { block: true } });
    expect(wrapper.classes()).toContain('vbwd-btn-block');
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('sets correct button type', () => {
    const wrapper = mount(Button, { props: { type: 'submit' } });
    expect(wrapper.find('button').attributes('type')).toBe('submit');
  });
});
