import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '../services/api';

describe('Mock API Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Health Check', () => {
    it('should have api object available', () => {
      expect(api).toBeDefined();
      expect(typeof api.createRoom).toBe('function');
      expect(typeof api.joinRoom).toBe('function');
      expect(typeof api.getRoom).toBe('function');
      expect(typeof api.updateCode).toBe('function');
      expect(typeof api.updateLanguage).toBe('function');
      expect(typeof api.leaveRoom).toBe('function');
    });
  });

  describe('Room Creation', () => {
    it('should create a room with default JavaScript language', async () => {
      const room = await api.createRoom();
      
      expect(room).toBeDefined();
      expect(room.id).toBeTruthy();
      expect(room.id.length).toBe(6);
      expect(room.language).toBe('javascript');
      expect(room.participants).toBe(1);
      expect(room.code).toContain('console.log');
    });

    it('should create a room with Python language', async () => {
      const room = await api.createRoom('python');
      
      expect(room).toBeDefined();
      expect(room.language).toBe('python');
      expect(room.code).toContain('print');
    });

    it('should generate unique room IDs', async () => {
      const room1 = await api.createRoom();
      const room2 = await api.createRoom();
      
      expect(room1.id).not.toBe(room2.id);
    });
  });

  describe('Room Operations', () => {
    it('should join an existing room', async () => {
      const created = await api.createRoom();
      const joined = await api.joinRoom(created.id);
      
      expect(joined).toBeDefined();
      expect(joined?.id).toBe(created.id);
      expect(joined?.participants).toBe(2);
    });

    it('should return null for non-existent room', async () => {
      const room = await api.joinRoom('NONEXISTENT');
      expect(room).toBeNull();
    });

    it('should get room by ID', async () => {
      const created = await api.createRoom();
      const fetched = await api.getRoom(created.id);
      
      expect(fetched).toBeDefined();
      expect(fetched?.id).toBe(created.id);
    });

    it('should update code in room', async () => {
      const room = await api.createRoom();
      const newCode = 'const x = 42;';
      
      const updated = await api.updateCode(room.id, newCode);
      
      expect(updated?.code).toBe(newCode);
    });

    it('should update language in room', async () => {
      const room = await api.createRoom('javascript');
      const updated = await api.updateLanguage(room.id, 'python');
      
      expect(updated?.language).toBe('python');
    });

    it('should leave room and decrement participants', async () => {
      const room = await api.createRoom();
      await api.joinRoom(room.id); // 2 participants
      await api.leaveRoom(room.id);
      
      const fetched = await api.getRoom(room.id);
      expect(fetched?.participants).toBe(1);
    });
  });
});
