import { describe, it, expect } from 'vitest';
import type { ApiResponse, LoginRequest, LoginResponse } from '@/api/types';

describe('API Type Safety', () => {
  it('should enforce request types', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password123'
    };

    expect(request.email).toBeDefined();
    expect(request.password).toBeDefined();
  });

  it('should enforce response types', () => {
    const response: ApiResponse<LoginResponse> = {
      data: {
        token: 'jwt-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User'
        }
      },
      status: 200,
      message: 'Success'
    };

    expect(response.data.token).toBeDefined();
    expect(response.data.user.email).toBe('test@example.com');
  });

  it('should handle generic response types', () => {
    interface CustomData {
      id: number;
      value: string;
    }

    const response: ApiResponse<CustomData> = {
      data: { id: 1, value: 'test' },
      status: 200,
      message: 'Success'
    };

    expect(response.data.id).toBe(1);
    expect(response.data.value).toBe('test');
  });

  it('should enforce user type structure', () => {
    const response: LoginResponse = {
      token: 'test-token',
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin'
      }
    };

    expect(response.user.id).toBe(1);
    expect(response.user.role).toBe('admin');
  });
});
