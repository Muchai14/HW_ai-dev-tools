// Centralized mock API layer - replace with real API calls when backend is ready

export interface Room {
  id: string;
  code: string;
  language: 'javascript' | 'python';
  createdAt: number;
  participants: number;
}

const STORAGE_KEY = 'coding-interview-rooms';
const BROADCAST_CHANNEL = 'coding-interview-sync';

// BroadcastChannel for multi-tab sync
let broadcastChannel: BroadcastChannel | null = null;

const getBroadcastChannel = (): BroadcastChannel => {
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
  }
  return broadcastChannel;
};

const getRooms = (): Record<string, Room> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const saveRooms = (rooms: Record<string, Room>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
};

const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Subscribe to real-time updates from other tabs
export const subscribeToRoom = (
  roomId: string,
  onUpdate: (room: Room) => void
): (() => void) => {
  const channel = getBroadcastChannel();
  
  const handler = (event: MessageEvent) => {
    if (event.data.type === 'ROOM_UPDATE' && event.data.roomId === roomId) {
      onUpdate(event.data.room);
    }
  };
  
  channel.addEventListener('message', handler);
  
  return () => {
    channel.removeEventListener('message', handler);
  };
};

// Broadcast room update to other tabs
const broadcastUpdate = (roomId: string, room: Room) => {
  const channel = getBroadcastChannel();
  channel.postMessage({ type: 'ROOM_UPDATE', roomId, room });
};

// API Methods
export const api = {
  createRoom: async (language: 'javascript' | 'python' = 'javascript'): Promise<Room> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const rooms = getRooms();
    const id = generateRoomId();
    
    const defaultCode = language === 'python' 
      ? '# Write your Python code here\nprint("Hello, World!")\n'
      : '// Write your JavaScript code here\nconsole.log("Hello, World!");\n';
    
    const room: Room = {
      id,
      code: defaultCode,
      language,
      createdAt: Date.now(),
      participants: 1,
    };
    
    rooms[id] = room;
    saveRooms(rooms);
    
    return room;
  },

  joinRoom: async (roomId: string): Promise<Room | null> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const rooms = getRooms();
    const room = rooms[roomId.toUpperCase()];
    
    if (room) {
      room.participants += 1;
      saveRooms(rooms);
      broadcastUpdate(roomId, room);
    }
    
    return room || null;
  },

  getRoom: async (roomId: string): Promise<Room | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const rooms = getRooms();
    return rooms[roomId.toUpperCase()] || null;
  },

  updateCode: async (roomId: string, code: string): Promise<Room | null> => {
    const rooms = getRooms();
    const room = rooms[roomId.toUpperCase()];
    
    if (room) {
      room.code = code;
      saveRooms(rooms);
      broadcastUpdate(roomId, room);
      return room;
    }
    
    return null;
  },

  updateLanguage: async (roomId: string, language: 'javascript' | 'python'): Promise<Room | null> => {
    const rooms = getRooms();
    const room = rooms[roomId.toUpperCase()];
    
    if (room) {
      room.language = language;
      saveRooms(rooms);
      broadcastUpdate(roomId, room);
      return room;
    }
    
    return null;
  },

  leaveRoom: async (roomId: string): Promise<void> => {
    const rooms = getRooms();
    const room = rooms[roomId.toUpperCase()];
    
    if (room) {
      room.participants = Math.max(0, room.participants - 1);
      saveRooms(rooms);
      broadcastUpdate(roomId, room);
    }
  },
};
