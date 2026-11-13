import { describe, it, expect } from 'vitest';
import {
  speedToAngle,
  bpsToMbps,
  formatMs,
  maskIp,
  evaluateConnectionQuality
} from './speedTestUtils';

describe('speedTestUtils', () => {
  describe('bpsToMbps', () => {
    it('converts bits per second to megabits per second', () => {
      expect(bpsToMbps(100_000_000)).toBe(100);
      expect(bpsToMbps(52_400_000)).toBe(52.4);
      expect(bpsToMbps(0)).toBe(0);
      expect(bpsToMbps(-100)).toBe(0);
      expect(bpsToMbps(undefined)).toBe(0);
    });
  });

  describe('formatMs', () => {
    it('formats millisecond numbers to 1 decimal place', () => {
      expect(formatMs(14.25)).toBe(14.3);
      expect(formatMs(0)).toBe(0);
      expect(formatMs(null)).toBe(0);
      expect(formatMs(undefined)).toBe(0);
    });
  });

  describe('speedToAngle', () => {
    it('calculates proper speedometer angles between -120 and 120', () => {
      expect(speedToAngle(0)).toBe(-120);
      expect(speedToAngle(-10)).toBe(-120);
      expect(speedToAngle(1000)).toBe(120);
      // Mid-scale should be monotonically increasing
      const angle10 = speedToAngle(10);
      const angle50 = speedToAngle(50);
      const angle100 = speedToAngle(100);
      const angle500 = speedToAngle(500);

      expect(angle10).toBeGreaterThan(-120);
      expect(angle50).toBeGreaterThan(angle10);
      expect(angle100).toBeGreaterThan(angle50);
      expect(angle500).toBeGreaterThan(angle100);
      expect(angle500).toBeLessThan(120);
    });
  });

  describe('maskIp', () => {
    it('masks IPv4 address correctly', () => {
      expect(maskIp('192.168.1.100')).toBe('192.168.***.***');
      expect(maskIp('103.21.244.1')).toBe('103.21.***.***');
    });

    it('masks IPv6 address correctly', () => {
      expect(maskIp('2405:201:6800:1234::1')).toBe('2405:201:****:****');
    });

    it('handles null or empty IP', () => {
      expect(maskIp(null)).toBe('Unavailable');
      expect(maskIp('')).toBe('Unavailable');
    });
  });

  describe('evaluateConnectionQuality', () => {
    it('rates ultra-fast fiber connection as Excellent across all metrics', () => {
      const result = evaluateConnectionQuality(150, 60, 12, 1.8);
      expect(result.gaming.status).toBe('Excellent');
      expect(result.streaming.status).toBe('Excellent');
      expect(result.rtc.status).toBe('Excellent');
      expect(result.upload.status).toBe('Excellent');
    });

    it('rates high ping connection as Poor for gaming even if download is fast', () => {
      const result = evaluateConnectionQuality(100, 20, 140, 25);
      expect(result.gaming.status).toBe('Poor');
      expect(result.streaming.status).toBe('Excellent');
    });

    it('rates low bandwidth connection as Poor for 4K streaming and video calls', () => {
      const result = evaluateConnectionQuality(2, 0.5, 60, 8);
      expect(result.streaming.status).toBe('Poor');
      expect(result.rtc.status).toBe('Poor');
      expect(result.upload.status).toBe('Poor');
    });
  });
});
