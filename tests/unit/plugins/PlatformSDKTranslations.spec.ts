import { describe, it, expect, vi } from 'vitest';
import { PlatformSDK } from '../../../src/plugins/PlatformSDK';

describe('PlatformSDK — translations', () => {
  it('should store translations via addTranslations', () => {
    const sdk = new PlatformSDK();
    sdk.addTranslations('en', { greeting: 'Hello' });
    expect(sdk.getTranslations()['en']).toEqual({ greeting: 'Hello' });
  });

  it('should store translations for multiple locales', () => {
    const sdk = new PlatformSDK();
    sdk.addTranslations('en', { greeting: 'Hello' });
    sdk.addTranslations('de', { greeting: 'Hallo' });
    const t = sdk.getTranslations();
    expect(t['en']).toEqual({ greeting: 'Hello' });
    expect(t['de']).toEqual({ greeting: 'Hallo' });
  });

  it('should deep-merge multiple addTranslations calls', () => {
    const sdk = new PlatformSDK();
    sdk.addTranslations('en', { a: { b: 1 } });
    sdk.addTranslations('en', { a: { c: 2 } });
    expect(sdk.getTranslations()['en']).toEqual({ a: { b: 1, c: 2 } });
  });

  it('should not overwrite existing keys from different plugins', () => {
    const sdk = new PlatformSDK();
    sdk.addTranslations('en', { landing1: { title: 'Plans' } });
    sdk.addTranslations('en', { checkout: { title: 'Checkout' } });
    const en = sdk.getTranslations()['en'];
    expect(en).toHaveProperty('landing1');
    expect(en).toHaveProperty('checkout');
  });

  it('should call i18n.global.mergeLocaleMessage when i18n provided', () => {
    const mockMerge = vi.fn();
    const mockI18n = { global: { mergeLocaleMessage: mockMerge } };
    const sdk = new PlatformSDK(mockI18n);
    sdk.addTranslations('en', { test: 'value' });
    expect(mockMerge).toHaveBeenCalledWith('en', { test: 'value' });
  });

  it('should work without i18n instance (collect-only mode)', () => {
    const sdk = new PlatformSDK();
    expect(() => sdk.addTranslations('en', { test: 'value' })).not.toThrow();
    expect(sdk.getTranslations()['en']).toEqual({ test: 'value' });
  });

  it('should return a copy from getTranslations', () => {
    const sdk = new PlatformSDK();
    sdk.addTranslations('en', { a: 1 });
    const copy = sdk.getTranslations();
    copy['en'] = { modified: true };
    expect(sdk.getTranslations()['en']).toEqual({ a: 1 });
  });

  it('should accept i18n in constructor', () => {
    const mockI18n = { global: { mergeLocaleMessage: vi.fn() } };
    const sdk = new PlatformSDK(mockI18n);
    sdk.addTranslations('de', { key: 'Wert' });
    expect(mockI18n.global.mergeLocaleMessage).toHaveBeenCalledWith('de', { key: 'Wert' });
  });
});
