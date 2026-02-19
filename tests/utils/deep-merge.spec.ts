import { describe, it, expect } from 'vitest';
import { deepMerge } from '../../src/utils/deep-merge';

describe('deepMerge', () => {
  it('should merge flat objects', () => {
    const result = deepMerge({ a: 1 }, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should deep-merge nested objects', () => {
    const result = deepMerge(
      { a: { b: 1 } },
      { a: { c: 2 } }
    );
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  it('should override target values with source values', () => {
    const result = deepMerge({ a: 1 }, { a: 2 });
    expect(result).toEqual({ a: 2 });
  });

  it('should replace arrays instead of merging them', () => {
    const result = deepMerge({ a: [1] }, { a: [2, 3] });
    expect(result).toEqual({ a: [2, 3] });
  });

  it('should handle empty source', () => {
    const result = deepMerge({ a: 1 }, {});
    expect(result).toEqual({ a: 1 });
  });

  it('should handle empty target', () => {
    const result = deepMerge({}, { a: 1 });
    expect(result).toEqual({ a: 1 });
  });

  it('should not mutate input objects', () => {
    const target = { a: { b: 1 } };
    const source = { a: { c: 2 } };
    deepMerge(target, source);
    expect(target).toEqual({ a: { b: 1 } });
    expect(source).toEqual({ a: { c: 2 } });
  });

  it('should handle three levels deep', () => {
    const result = deepMerge(
      { a: { b: { c: 1, d: 2 } } },
      { a: { b: { c: 3, e: 4 } } }
    );
    expect(result).toEqual({ a: { b: { c: 3, d: 2, e: 4 } } });
  });
});
