import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, subscribeToRoom, Room as RoomType } from '@/services/api';
import { usePyodide } from '@/hooks/usePyodide';
import { CodeEditor } from '@/components/CodeEditor';
import { ConsolePanel } from '@/components/ConsolePanel';
import { RoomHeader } from '@/components/RoomHeader';
import { toast } from 'sonner';

const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [returnValue, setReturnValue] = useState<string | undefined>();
  const [executionTime, setExecutionTime] = useState<number | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  
  const { runPython, isLoading: isPyodideLoading, initialize } = usePyodide();

  // Load room on mount
  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) return;
      
      const existingRoom = await api.getRoom(roomId);
      
      if (existingRoom) {
        setRoom(existingRoom);
      } else {
        toast.error('Room not found');
        navigate('/');
      }
      
      setLoading(false);
    };

    loadRoom();
  }, [roomId, navigate]);

  // Subscribe to multi-tab sync
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => {
      unsubscribe();
      api.leaveRoom(roomId);
    };
  }, [roomId]);

  // Pre-load Pyodide when Python is selected
  useEffect(() => {
    if (room?.language === 'python') {
      initialize();
    }
  }, [room?.language, initialize]);

  const handleCodeChange = useCallback(async (code: string) => {
    if (!roomId || !room) return;
    
    // Update local state immediately for responsiveness
    setRoom(prev => prev ? { ...prev, code } : null);
    
    // Sync to other tabs
    await api.updateCode(roomId, code);
  }, [roomId, room]);

  const handleLanguageChange = useCallback(async (language: 'javascript' | 'python') => {
    if (!roomId) return;
    
    const updated = await api.updateLanguage(roomId, language);
    if (updated) {
      setRoom(updated);
    }
  }, [roomId]);

  const handleRun = useCallback(async () => {
    if (!room) return;
    
    setIsRunning(true);
    setOutput('');
    setError(null);
    setReturnValue(undefined);
    setExecutionTime(undefined);

    const startTime = performance.now();

    try {
      if (room.language === 'python') {
        const result = await runPython(room.code);
        const endTime = performance.now();
        setExecutionTime(Math.round(endTime - startTime));
        setOutput(result.output);
        setError(result.error);
        // Python return value is included in output
      } else {
        // JavaScript execution
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        };

        try {
          // eslint-disable-next-line no-eval
          const result = eval(room.code);
          const endTime = performance.now();
          setExecutionTime(Math.round(endTime - startTime));
          setOutput(logs.join('\n'));
          
          // Capture return value if it's not undefined
          if (result !== undefined) {
            const formatted = typeof result === 'object' 
              ? JSON.stringify(result, null, 2) 
              : String(result);
            setReturnValue(formatted);
          }
        } catch (err) {
          const endTime = performance.now();
          setExecutionTime(Math.round(endTime - startTime));
          setError(err instanceof Error ? err.message : 'Execution error');
        } finally {
          console.log = originalLog;
        }
      }
    } catch (err) {
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setError(err instanceof Error ? err.message : 'Execution error');
    } finally {
      setIsRunning(false);
    }
  }, [room, runPython]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl gradient-primary animate-pulse" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <RoomHeader
        roomId={room.id}
        language={room.language}
        participants={room.participants}
        isRunning={isRunning}
        isPyodideLoading={isPyodideLoading}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
      />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        <div className="flex-1 min-w-0 min-h-[300px] lg:min-h-0">
          <CodeEditor
            code={room.code}
            language={room.language}
            onChange={handleCodeChange}
          />
        </div>
        
        <div className="h-[300px] lg:h-auto lg:w-[400px] flex-shrink-0">
          <ConsolePanel
            output={output}
            error={error}
            returnValue={returnValue}
            executionTime={executionTime}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
