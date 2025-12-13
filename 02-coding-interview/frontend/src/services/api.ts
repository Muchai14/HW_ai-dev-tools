// Centralized API layer: uses real backend if `VITE_API_URL` is set, otherwise falls back to in-browser mock.

export interface Room {
  id: string;
  code: string;
  language: 'javascript' | 'python';
  createdAt: number;
  participants: number;
}

export interface Participant {
  id: string;
  name?: string | null;
  joinedAt: number;
}

const BASE = (import.meta as any).env?.VITE_API_URL || '';
const WS_BASE = BASE ? BASE.replace(/^http/, 'ws') : '';

// Fallback mock (keeps existing behavior when no backend URL provided)
const useRemote = Boolean(BASE);

// --- simple mock (same as before, trimmed) ---
const STORAGE_KEY = 'coding-interview-rooms';
const BROADCAST_CHANNEL = 'coding-interview-sync';
let broadcastChannel: BroadcastChannel | null = null;
const getBroadcastChannel = (): BroadcastChannel => {
  if (!broadcastChannel) broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL);
  return broadcastChannel;
};
const getRooms = (): Record<string, Room> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};
const saveRooms = (rooms: Record<string, Room>) => localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// WebSocket handling for remote mode
let ws: WebSocket | null = null;
let wsHandlers: Record<string, ((room: Room) => void)[]> = {};

// WebSocket connection status handlers
export type WSStatus = 'connected' | 'connecting' | 'disconnected';
let wsStatus: WSStatus = WS_BASE ? 'disconnected' : 'disconnected';
let wsStatusHandlers: ((s: WSStatus) => void)[] = [];
const setWSStatus = (s: WSStatus) => {
  wsStatus = s;
  wsStatusHandlers.forEach(h => {
    try { h(s); } catch (e) { /* ignore handler errors */ }
  });
};

export const onWebSocketStatusChange = (cb: (s: WSStatus) => void) => {
  wsStatusHandlers.push(cb);
  // immediately notify current status
  try { cb(wsStatus); } catch (e) {}
  return () => { wsStatusHandlers = wsStatusHandlers.filter(x => x !== cb); };
};

const ensureWebSocket = (roomId?: string) => {
  if (!WS_BASE) return;
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    setWSStatus('connecting');
    ws = new WebSocket(WS_BASE + '/ws');
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data?.type === 'ROOM_UPDATE' && data.roomId && data.room) {
          const handlers = wsHandlers[data.roomId];
          if (handlers) handlers.forEach(h => h(data.room as Room));
        }
      } catch (e) {
        // ignore
      }
    };
    ws.onopen = () => setWSStatus('connected');
    ws.onclose = () => setWSStatus('disconnected');
    ws.onerror = () => setWSStatus('disconnected');
  }
  // if roomId provided, send subscribe after OPEN
  if (roomId && ws) {
    ws.addEventListener('open', () => ws?.send(JSON.stringify({ action: 'subscribe', roomId })));
  }
};

export const subscribeToRoom = (roomId: string, onUpdate: (room: Room) => void): (() => void) => {
  if (useRemote && WS_BASE) {
    wsHandlers[roomId] = wsHandlers[roomId] || [];
    wsHandlers[roomId].push(onUpdate);
    ensureWebSocket(roomId);
    return () => {
      wsHandlers[roomId] = (wsHandlers[roomId] || []).filter(h => h !== onUpdate);
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ action: 'unsubscribe', roomId }));
    };
  }

  // fallback to BroadcastChannel
  const channel = getBroadcastChannel();
  const handler = (event: MessageEvent) => {
    if (event.data.type === 'ROOM_UPDATE' && event.data.roomId === roomId) onUpdate(event.data.room);
  };
  channel.addEventListener('message', handler);
  return () => channel.removeEventListener('message', handler);
};

const broadcastUpdate = (roomId: string, room: Room) => {
  const channel = getBroadcastChannel();
  channel.postMessage({ type: 'ROOM_UPDATE', roomId, room });
};

// --- API Implementation ---
const remoteFetch = async (path: string, opts?: RequestInit) => {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
};

export const api = {
  createRoom: async (language: 'javascript' | 'python' = 'javascript'): Promise<Room> => {
    if (useRemote) {
      return remoteFetch('/rooms', { method: 'POST', body: JSON.stringify({ language }) });
    }
    await new Promise(r => setTimeout(r, 100));
    const rooms = getRooms();
    const id = generateRoomId();
    const defaultCode = language === 'python' ? '# Write your Python code here\nprint("Hello, World!")\n' : '// Write your JavaScript code here\nconsole.log("Hello, World!");\n';
    const room: Room = { id, code: defaultCode, language, createdAt: Date.now(), participants: 1 };
    rooms[id] = room; saveRooms(rooms); return room;
  },

  joinRoom: async (roomId: string) => {
    if (useRemote) return remoteFetch(`/rooms/${roomId}/join`, { method: 'POST' });
    await new Promise(r => setTimeout(r, 100));
    const rooms = getRooms();
    const room = rooms[roomId.toUpperCase()];
    if (room) { room.participants += 1; saveRooms(rooms); broadcastUpdate(roomId, room); }
    return room || null;
  },

  getRoom: async (roomId: string) => {
    if (useRemote) return remoteFetch(`/rooms/${roomId}`);
    await new Promise(r => setTimeout(r, 50));
    const rooms = getRooms(); return rooms[roomId.toUpperCase()] || null;
  },

  updateCode: async (roomId: string, code: string) => {
    if (useRemote) return remoteFetch(`/rooms/${roomId}/code`, { method: 'PATCH', body: JSON.stringify({ code }) });
    const rooms = getRooms(); const room = rooms[roomId.toUpperCase()]; if (room) { room.code = code; saveRooms(rooms); broadcastUpdate(roomId, room); return room; } return null;
  },

  updateLanguage: async (roomId: string, language: 'javascript' | 'python') => {
    if (useRemote) return remoteFetch(`/rooms/${roomId}/language`, { method: 'PATCH', body: JSON.stringify({ language }) });
    const rooms = getRooms(); const room = rooms[roomId.toUpperCase()]; if (room) { room.language = language; saveRooms(rooms); broadcastUpdate(roomId, room); return room; } return null;
  },

  leaveRoom: async (roomId: string) => {
    if (useRemote) return remoteFetch(`/rooms/${roomId}/leave`, { method: 'POST' });
    const rooms = getRooms(); const room = rooms[roomId.toUpperCase()]; if (room) { room.participants = Math.max(0, room.participants - 1); saveRooms(rooms); broadcastUpdate(roomId, room); }
  },

  // participants
  addParticipant: async (roomId: string, name?: string) => {
    if (useRemote) return remoteFetch(`/rooms/${roomId}/participants`, { method: 'POST', body: JSON.stringify({ name }) });
    const pid = generateRoomId(); const entry = { id: pid, name: name || null, joinedAt: Date.now() }; // store in room mock map
    const rooms = getRooms(); const room = rooms[roomId.toUpperCase()]; if (room) { room.participants += 1; saveRooms(rooms); broadcastUpdate(roomId, room); return entry; } return null;
  },

  listParticipants: async (roomId: string) => {
    if (useRemote) return remoteFetch(`/rooms/${roomId}/participants`);
    // best-effort: not tracked in mock persistently
    return [] as Participant[];
  },

  removeParticipant: async (roomId: string, participantId: string) => {
    if (useRemote) return remoteFetch(`/rooms/${roomId}/participants/${participantId}`, { method: 'DELETE' });
    return null;
  },
};
