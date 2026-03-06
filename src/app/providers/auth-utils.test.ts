import { describe, expect, it } from 'vitest';
import { getHashAuthParams, normalizeAuthError } from '@/app/providers/auth-utils';

describe('auth-utils', () => {
  it('extracts auth tokens from plain hash callback format', () => {
    const params = getHashAuthParams('#access_token=abc&refresh_token=xyz');

    expect(params?.get('access_token')).toBe('abc');
    expect(params?.get('refresh_token')).toBe('xyz');
  });

  it('extracts auth tokens from hash-router callback format', () => {
    const params = getHashAuthParams('#/auth#access_token=abc&refresh_token=xyz');

    expect(params?.get('access_token')).toBe('abc');
    expect(params?.get('refresh_token')).toBe('xyz');
  });

  it('extracts callback errors from hash-router query format', () => {
    const params = getHashAuthParams('#/auth?error=access_denied&error_description=Link+expired');

    expect(params?.get('error')).toBe('access_denied');
    expect(params?.get('error_description')).toBe('Link expired');
  });

  it('returns null when hash does not contain auth params', () => {
    expect(getHashAuthParams('#/materials')).toBeNull();
  });

  it('normalizes auth error values from callback encoding', () => {
    expect(normalizeAuthError('Ogiltig+l%C3%A4nk')).toBe('Ogiltig länk');
    expect(normalizeAuthError(null)).toBeNull();
  });
});
