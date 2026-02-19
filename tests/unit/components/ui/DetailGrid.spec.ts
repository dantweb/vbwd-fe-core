import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailGrid from '@/components/ui/DetailGrid.vue';

describe('DetailGrid', () => {
  it('renders slot content', () => {
    const wrapper = mount(DetailGrid, {
      slots: { default: '<div class="child">Item</div>' }
    });
    expect(wrapper.find('.vbwd-detail-grid .child').text()).toBe('Item');
  });

  it('defaults to 2 columns', () => {
    const wrapper = mount(DetailGrid);
    expect(wrapper.find('.vbwd-detail-grid').attributes('style')).toContain('grid-template-columns: repeat(2, 1fr)');
  });

  it('applies custom column count', () => {
    const wrapper = mount(DetailGrid, { props: { columns: 3 } });
    expect(wrapper.find('.vbwd-detail-grid').attributes('style')).toContain('grid-template-columns: repeat(3, 1fr)');
  });

  it('renders multiple children', () => {
    const wrapper = mount(DetailGrid, {
      slots: { default: '<span>A</span><span>B</span><span>C</span>' }
    });
    const spans = wrapper.findAll('.vbwd-detail-grid span');
    expect(spans).toHaveLength(3);
  });
});
