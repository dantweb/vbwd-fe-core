import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import Modal from '@/components/ui/Modal.vue';

describe('Modal', () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    document.body.innerHTML = '';
    document.body.style.overflow = '';
  });

  it('does not render when modelValue is false', () => {
    wrapper = mount(Modal, {
      props: { modelValue: false },
      global: { stubs: { teleport: true } }
    });
    expect(wrapper.find('.vbwd-modal-overlay').exists()).toBe(false);
  });

  it('renders when modelValue is true', () => {
    wrapper = mount(Modal, {
      props: { modelValue: true },
      global: { stubs: { teleport: true } }
    });
    expect(wrapper.find('.vbwd-modal-overlay').exists()).toBe(true);
  });

  it('renders title when provided', () => {
    wrapper = mount(Modal, {
      props: { modelValue: true, title: 'Modal Title' },
      global: { stubs: { teleport: true } }
    });
    expect(wrapper.find('.vbwd-modal-title').text()).toBe('Modal Title');
  });

  it('applies size class', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;

    sizes.forEach(size => {
      wrapper = mount(Modal, {
        props: { modelValue: true, size },
        global: { stubs: { teleport: true } }
      });
      expect(wrapper.find('.vbwd-modal').classes()).toContain(`vbwd-modal-${size}`);
      wrapper.unmount();
    });
  });

  it('shows close button when closable is true', () => {
    wrapper = mount(Modal, {
      props: { modelValue: true, closable: true, title: 'Test' },
      global: { stubs: { teleport: true } }
    });
    expect(wrapper.find('.vbwd-modal-close').exists()).toBe(true);
  });

  it('hides close button when closable is false', () => {
    wrapper = mount(Modal, {
      props: { modelValue: true, closable: false, title: 'Test' },
      global: { stubs: { teleport: true } }
    });
    expect(wrapper.find('.vbwd-modal-close').exists()).toBe(false);
  });

  it('emits update:modelValue and close when close button clicked', async () => {
    wrapper = mount(Modal, {
      props: { modelValue: true, closable: true, title: 'Test' },
      global: { stubs: { teleport: true } }
    });
    await wrapper.find('.vbwd-modal-close').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('closes on overlay click when closeOnOverlay is true', async () => {
    wrapper = mount(Modal, {
      props: { modelValue: true, closeOnOverlay: true },
      global: { stubs: { teleport: true } }
    });
    await wrapper.find('.vbwd-modal-overlay').trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('does not close on overlay click when closeOnOverlay is false', async () => {
    wrapper = mount(Modal, {
      props: { modelValue: true, closeOnOverlay: false },
      global: { stubs: { teleport: true } }
    });
    await wrapper.find('.vbwd-modal-overlay').trigger('click');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('renders default slot content', () => {
    wrapper = mount(Modal, {
      props: { modelValue: true },
      slots: { default: '<p class="content">Modal content</p>' },
      global: { stubs: { teleport: true } }
    });
    expect(wrapper.find('.vbwd-modal-body .content').text()).toBe('Modal content');
  });

  it('renders footer slot', () => {
    wrapper = mount(Modal, {
      props: { modelValue: true },
      slots: { footer: '<button>Save</button>' },
      global: { stubs: { teleport: true } }
    });
    expect(wrapper.find('.vbwd-modal-footer button').text()).toBe('Save');
  });

  it('renders header slot', () => {
    wrapper = mount(Modal, {
      props: { modelValue: true },
      slots: { header: '<h2 class="custom-header">Custom Header</h2>' },
      global: { stubs: { teleport: true } }
    });
    expect(wrapper.find('.vbwd-modal-header .custom-header').text()).toBe('Custom Header');
  });

  it('has correct ARIA attributes', () => {
    wrapper = mount(Modal, {
      props: { modelValue: true, title: 'Test Modal' },
      global: { stubs: { teleport: true } }
    });
    const modal = wrapper.find('.vbwd-modal');
    expect(modal.attributes('role')).toBe('dialog');
    expect(modal.attributes('aria-modal')).toBe('true');
    expect(modal.attributes('aria-labelledby')).toBeDefined();
  });
});
