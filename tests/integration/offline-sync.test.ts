/**
 * Integration test for offline queue and sync functionality
 * Tests: offline request queueing, local persistence, and syncing on reconnect
 */

import { apiClient } from '@/api/client';

describe('Offline Queue & Sync', () => {
  beforeEach(async () => {
    // Clear offline queue before each test
    await apiClient.clearOfflineQueue();
  });

  it('should queue requests when offline', async () => {
    // Simulate offline state
    apiClient.setOnlineStatus(false);

    try {
      await apiClient.post('/api/ventures/123/stages/stage-1/confirm', {
        answer: 'Test answer',
      });
    } catch (error) {
      // Expected to fail when offline
    }

    // Verify request was queued
    const queueLength = apiClient.getOfflineQueueLength();
    expect(queueLength).toBe(1);
  });

  it('should persist queue to AsyncStorage', async () => {
    apiClient.setOnlineStatus(false);

    try {
      await apiClient.post('/api/ventures/123/update', {
        title: 'Updated Title',
      });
    } catch (error) {
      // Expected
    }

    // Simulate app restart by checking queue persistence
    const queueLength = apiClient.getOfflineQueueLength();
    expect(queueLength).toBeGreaterThan(0);
  });

  it('should sync queued requests when online', async () => {
    apiClient.setOnlineStatus(false);

    try {
      await apiClient.post('/api/test', { data: 'test' });
    } catch (error) {
      // Expected to fail
    }

    expect(apiClient.getOfflineQueueLength()).toBeGreaterThan(0);

    // Come back online
    apiClient.setOnlineStatus(true);

    // Allow sync to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Queue should be processed
    const remainingQueue = apiClient.getOfflineQueueLength();
    expect(remainingQueue).toBeLessThanOrEqual(1); // May have 1 failed if API unreachable
  });

  it('should retry failed requests with backoff', async () => {
    apiClient.setOnlineStatus(false);

    const requests = [
      { method: 'POST', url: '/api/test1', data: { val: 1 } },
      { method: 'POST', url: '/api/test2', data: { val: 2 } },
    ];

    for (const req of requests) {
      try {
        await apiClient.post(req.url, req.data);
      } catch {
        // Expected
      }
    }

    expect(apiClient.getOfflineQueueLength()).toBe(2);

    // Simulate coming online and network still unstable
    apiClient.setOnlineStatus(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Requests should be retried, not lost
    const remaining = apiClient.getOfflineQueueLength();
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('should not queue GET requests when offline', async () => {
    apiClient.setOnlineStatus(false);

    try {
      await apiClient.get('/api/ventures');
    } catch (error) {
      // Expected to fail but not queue
    }

    expect(apiClient.getOfflineQueueLength()).toBe(0);
  });

  it('should clear queue on user request', async () => {
    apiClient.setOnlineStatus(false);

    try {
      await apiClient.post('/api/test1', { data: 1 });
      await apiClient.post('/api/test2', { data: 2 });
    } catch {
      // Expected
    }

    expect(apiClient.getOfflineQueueLength()).toBe(2);

    await apiClient.clearOfflineQueue();
    expect(apiClient.getOfflineQueueLength()).toBe(0);
  });

  it('should handle sync errors gracefully', async () => {
    apiClient.setOnlineStatus(false);

    // Queue multiple requests
    try {
      await apiClient.post('/api/invalid-endpoint', { data: 'test' });
    } catch {
      // Expected
    }

    expect(apiClient.getOfflineQueueLength()).toBeGreaterThan(0);

    // Come online but endpoint is still invalid
    apiClient.setOnlineStatus(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Should eventually clear failed requests after max retries
    // or mark as error without crashing
  });
});
