import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Card from '@/components/ui/Card.vue';

describe('Card', () => {
  it('renders with default props', () => {
    const wrapper = mount(Card);
    expect(wrapper.find('.vbwd-card').exists()).toBe(true);
  });

  it('renders title when provided', () => {
    const wrapper = mount(Card, { props: { title: 'Card Title' } });
    expect(wrapper.find('.vbwd-card-title').text()).toBe('Card Title');
    expect(wrapper.find('.vbwd-card-header').exists()).toBe(true);
  });

  it('renders subtitle when provided', () => {
    const wrapper = mount(Card, { props: { title: 'Title', subtitle: 'Subtitle text' } });
    expect(wrapper.find('.vbwd-card-subtitle').text()).toBe('Subtitle text');
  });

  it('does not render header when no title or header slot', () => {
    const wrapper = mount(Card);
    expect(wrapper.find('.vbwd-card-header').exists()).toBe(false);
  });

  it('renders default slot content in body', () => {
    const wrapper = mount(Card, {
      slots: { default: '<p class="content">Card content</p>' }
    });
    expect(wrapper.find('.vbwd-card-body .content').text()).toBe('Card content');
  });

  it('renders header slot', () => {
    const wrapper = mount(Card, {
      slots: { header: '<h2 class="custom-header">Custom Header</h2>' }
    });
    expect(wrapper.find('.vbwd-card-header .custom-header').text()).toBe('Custom Header');
  });

  it('renders actions slot', () => {
    const wrapper = mount(Card, {
      props: { title: 'Title' },
      slots: { actions: '<button class="action-btn">Action</button>' }
    });
    expect(wrapper.find('.vbwd-card-actions .action-btn').text()).toBe('Action');
  });

  it('renders footer slot', () => {
    const wrapper = mount(Card, {
      slots: { footer: '<button>Footer Button</button>' }
    });
    expect(wrapper.find('.vbwd-card-footer button').text()).toBe('Footer Button');
  });

  it('does not render footer when no footer slot', () => {
    const wrapper = mount(Card);
    expect(wrapper.find('.vbwd-card-footer').exists()).toBe(false);
  });

  it('applies hoverable class when hoverable is true', () => {
    const wrapper = mount(Card, { props: { hoverable: true } });
    expect(wrapper.classes()).toContain('vbwd-card-hoverable');
  });

  it('does not apply hoverable class when hoverable is false', () => {
    const wrapper = mount(Card, { props: { hoverable: false } });
    expect(wrapper.classes()).not.toContain('vbwd-card-hoverable');
  });
});
