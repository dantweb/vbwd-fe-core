import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Input from '@/components/ui/Input.vue';

describe('Input', () => {
  it('renders with default props', () => {
    const wrapper = mount(Input);
    expect(wrapper.find('input').exists()).toBe(true);
    expect(wrapper.find('.vbwd-input-wrapper').exists()).toBe(true);
  });

  it('renders label when provided', () => {
    const wrapper = mount(Input, { props: { label: 'Email' } });
    expect(wrapper.find('.vbwd-input-label').text()).toBe('Email');
  });

  it('shows required asterisk when required', () => {
    const wrapper = mount(Input, { props: { label: 'Email', required: true } });
    expect(wrapper.find('.vbwd-input-required').exists()).toBe(true);
    expect(wrapper.find('.vbwd-input-required').text()).toBe('*');
  });

  it('binds modelValue correctly', async () => {
    const wrapper = mount(Input, { props: { modelValue: 'test value' } });
    expect(wrapper.find('input').element.value).toBe('test value');
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input);
    await wrapper.find('input').setValue('new value');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value']);
  });

  it('shows error message when error prop is provided', () => {
    const wrapper = mount(Input, { props: { error: 'Invalid email' } });
    expect(wrapper.find('.vbwd-input-error-text').text()).toBe('Invalid email');
    expect(wrapper.classes()).toContain('vbwd-input-has-error');
  });

  it('shows hint when provided and no error', () => {
    const wrapper = mount(Input, { props: { hint: 'Enter your email' } });
    expect(wrapper.find('.vbwd-input-hint').text()).toBe('Enter your email');
  });

  it('hides hint when error is shown', () => {
    const wrapper = mount(Input, {
      props: { hint: 'Enter your email', error: 'Invalid email' }
    });
    expect(wrapper.find('.vbwd-input-hint').exists()).toBe(false);
    expect(wrapper.find('.vbwd-input-error-text').exists()).toBe(true);
  });

  it('applies size class', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach(size => {
      const wrapper = mount(Input, { props: { size } });
      expect(wrapper.find('input').classes()).toContain(`vbwd-input-${size}`);
    });
  });

  it('sets input type correctly', () => {
    const wrapper = mount(Input, { props: { type: 'password' } });
    expect(wrapper.find('input').attributes('type')).toBe('password');
  });

  it('sets placeholder correctly', () => {
    const wrapper = mount(Input, { props: { placeholder: 'Enter value' } });
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter value');
  });

  it('handles disabled state', () => {
    const wrapper = mount(Input, { props: { disabled: true } });
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });

  it('handles readonly state', () => {
    const wrapper = mount(Input, { props: { readonly: true } });
    expect(wrapper.find('input').attributes('readonly')).toBeDefined();
  });

  it('emits blur event', async () => {
    const wrapper = mount(Input);
    await wrapper.find('input').trigger('blur');
    expect(wrapper.emitted('blur')).toHaveLength(1);
  });

  it('emits focus event', async () => {
    const wrapper = mount(Input);
    await wrapper.find('input').trigger('focus');
    expect(wrapper.emitted('focus')).toHaveLength(1);
  });

  it('renders prefix slot', () => {
    const wrapper = mount(Input, {
      slots: { prefix: '<span class="icon">@</span>' }
    });
    expect(wrapper.find('.vbwd-input-prefix').exists()).toBe(true);
    expect(wrapper.find('.vbwd-input-prefix .icon').text()).toBe('@');
  });

  it('renders suffix slot', () => {
    const wrapper = mount(Input, {
      slots: { suffix: '<span class="icon">✓</span>' }
    });
    expect(wrapper.find('.vbwd-input-suffix').exists()).toBe(true);
  });
});
