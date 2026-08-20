import request from 'supertest';
import { createApp } from '../app';
import { computeBannerStatus } from '@adspace/shared';

describe('Server API Unit & Integration Tests', () => {
  const app = createApp();

  describe('GET /api/v1/health', () => {
    it('should return 200 and success status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('Banner Status Computation Unit Test', () => {
    it('should mark banner available when no slots exist', () => {
      const status = computeBannerStatus([]);
      expect(status).toBe('available');
    });

    it('should mark banner busy when today falls within booked slots', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const status = computeBannerStatus([
        {
          from: yesterday.toISOString(),
          to: tomorrow.toISOString(),
        },
      ]);
      expect(status).toBe('busy');
    });

    it('should mark banner available when booked slot is in the past', () => {
      const pastStart = new Date('2020-01-01');
      const pastEnd = new Date('2020-01-10');

      const status = computeBannerStatus([
        {
          from: pastStart.toISOString(),
          to: pastEnd.toISOString(),
        },
      ]);
      expect(status).toBe('available');
    });
  });
});
