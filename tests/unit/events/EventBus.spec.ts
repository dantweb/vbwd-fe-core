import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus, eventBus } from '@/events/EventBus';
import { AppEvents } from '@/events/events';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  describe('emit and on', () => {
    it('should emit event to registered listener', () => {
      const handler = vi.fn();
      bus.on('test:event', handler);

      bus.emit('test:event', { data: 'test' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should emit to multiple listeners', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus.on('test:event', handler1);
      bus.on('test:event', handler2);

      bus.emit('test:event', 'payload');

      expect(handler1).toHaveBeenCalledWith('payload');
      expect(handler2).toHaveBeenCalledWith('payload');
    });

    it('should not call listeners for different events', () => {
      const handler = vi.fn();
      bus.on('event:a', handler);

      bus.emit('event:b', 'payload');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle emit without payload', () => {
      const handler = vi.fn();
      bus.on('test:event', handler);

      bus.emit('test:event');

      expect(handler).toHaveBeenCalledWith(undefined);
    });
  });

  describe('off', () => {
    it('should unsubscribe listener', () => {
      const handler = vi.fn();
      bus.on('test:event', handler);
      bus.off('test:event', handler);

      bus.emit('test:event', 'payload');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should return unsubscribe function from on()', () => {
      const handler = vi.fn();
      const unsubscribe = bus.on('test:event', handler);

      unsubscribe();
      bus.emit('test:event', 'payload');

      expect(handler).not.toHaveBeenCalled();
    });

    it('should not affect other listeners when removing one', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus.on('test:event', handler1);
      bus.on('test:event', handler2);

      bus.off('test:event', handler1);
      bus.emit('test:event', 'payload');

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith('payload');
    });
  });

  describe('once', () => {
    it('should only trigger listener once', () => {
      const handler = vi.fn();
      bus.once('test:event', handler);

      bus.emit('test:event', 'first');
      bus.emit('test:event', 'second');

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith('first');
    });
  });

  describe('hasListeners and listenerCount', () => {
    it('should return false when no listeners', () => {
      expect(bus.hasListeners('test:event')).toBe(false);
    });

    it('should return true when listeners exist', () => {
      bus.on('test:event', vi.fn());
      expect(bus.hasListeners('test:event')).toBe(true);
    });

    it('should return correct listener count', () => {
      expect(bus.listenerCount('test:event')).toBe(0);

      bus.on('test:event', vi.fn());
      expect(bus.listenerCount('test:event')).toBe(1);

      bus.on('test:event', vi.fn());
      expect(bus.listenerCount('test:event')).toBe(2);
    });
  });

  describe('history', () => {
    it('should record emitted events', () => {
      bus.emit('event:a', 'payload1');
      bus.emit('event:b', 'payload2');

      const history = bus.getHistory();

      expect(history).toHaveLength(2);
      expect(history[0].event).toBe('event:a');
      expect(history[0].payload).toBe('payload1');
      expect(history[1].event).toBe('event:b');
    });

    it('should filter history by event name', () => {
      bus.emit('event:a', 'payload1');
      bus.emit('event:b', 'payload2');
      bus.emit('event:a', 'payload3');

      const filtered = bus.getHistory('event:a');

      expect(filtered).toHaveLength(2);
      expect(filtered[0].payload).toBe('payload1');
      expect(filtered[1].payload).toBe('payload3');
    });

    it('should limit history to maxHistory option', () => {
      const smallBus = new EventBus({ maxHistory: 3 });

      smallBus.emit('e1', 1);
      smallBus.emit('e2', 2);
      smallBus.emit('e3', 3);
      smallBus.emit('e4', 4);

      const history = smallBus.getHistory();

      expect(history).toHaveLength(3);
      expect(history[0].payload).toBe(2);
      expect(history[2].payload).toBe(4);
    });

    it('should include timestamp in history entries', () => {
      const before = new Date();
      bus.emit('test:event', 'payload');
      const after = new Date();

      const history = bus.getHistory();

      expect(history[0].timestamp).toBeInstanceOf(Date);
      expect(history[0].timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(history[0].timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('clear methods', () => {
    it('should clear all listeners and history', () => {
      bus.on('test:event', vi.fn());
      bus.emit('test:event', 'payload');

      bus.clear();

      expect(bus.hasListeners('test:event')).toBe(false);
      expect(bus.getHistory()).toHaveLength(0);
    });

    it('should clear only history', () => {
      const handler = vi.fn();
      bus.on('test:event', handler);
      bus.emit('test:event', 'payload');

      bus.clearHistory();

      expect(bus.getHistory()).toHaveLength(0);
      expect(bus.hasListeners('test:event')).toBe(true);
    });

    it('should clear specific event listeners', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus.on('event:a', handler1);
      bus.on('event:b', handler2);

      bus.clearEvent('event:a');

      expect(bus.hasListeners('event:a')).toBe(false);
      expect(bus.hasListeners('event:b')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should catch errors in handlers and continue', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const successHandler = vi.fn();

      bus.on('test:event', errorHandler);
      bus.on('test:event', successHandler);

      // Should not throw
      expect(() => bus.emit('test:event', 'payload')).not.toThrow();

      // Both handlers should have been called
      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe('debug mode', () => {
    it('should log events when debug is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const debugBus = new EventBus({ debug: true });

      debugBus.emit('test:event', 'payload');

      expect(consoleSpy).toHaveBeenCalledWith('[EventBus] test:event', 'payload');
      consoleSpy.mockRestore();
    });

    it('should not log when debug is disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      bus.emit('test:event', 'payload');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('typed events', () => {
    it('should work with AppEvents constants', () => {
      const handler = vi.fn();
      bus.on(AppEvents.AUTH_LOGIN, handler);

      bus.emit(AppEvents.AUTH_LOGIN, { userId: '123', email: 'test@example.com' });

      expect(handler).toHaveBeenCalledWith({ userId: '123', email: 'test@example.com' });
    });

    it('should work with subscription events', () => {
      const handler = vi.fn();
      bus.on(AppEvents.SUBSCRIPTION_ACTIVATED, handler);

      bus.emit(AppEvents.SUBSCRIPTION_ACTIVATED, {
        subscriptionId: 'sub-123',
        planId: 'plan-456',
        planName: 'Pro',
      });

      expect(handler).toHaveBeenCalled();
    });
  });
});

describe('eventBus singleton', () => {
  it('should export a singleton instance', () => {
    expect(eventBus).toBeInstanceOf(EventBus);
  });
});
