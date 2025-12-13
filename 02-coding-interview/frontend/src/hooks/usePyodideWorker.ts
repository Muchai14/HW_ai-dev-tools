import { useEffect, useRef, useState } from 'react';

type Resolver = (v: { output: string; error: string | null }) => void;

export const usePyodideWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Record<string, Resolver>>({});
  const idCounter = useRef(1);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create worker
    const worker = new Worker(new URL('../workers/pyodide.worker.ts?worker', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (!msg || !msg.type) return;

      if (msg.type === 'inited') {
        setIsReady(true);
        return;
      }

      if (msg.type === 'init_error') {
        setError(msg.error || 'Failed to init pyodide worker');
        return;
      }

      if (msg.type === 'result') {
        const id = String(msg.id);
        const resolver = pendingRef.current[id];
        if (resolver) {
          resolver({ output: msg.output || '', error: msg.error || null });
          delete pendingRef.current[id];
        }
      }
    };

    worker.onerror = (ev) => {
      setError(ev?.message || 'Worker error');
    };

    // initialize
    worker.postMessage({ type: 'init' });

    return () => {
      try {
        worker.terminate();
      } catch {}
      workerRef.current = null;
    };
  }, []);

  const run = (code: string) => {
    return new Promise<{ output: string; error: string | null }>((resolve) => {
      const id = String(idCounter.current++);
      pendingRef.current[id] = resolve;
      workerRef.current?.postMessage({ type: 'run', id, code });
    });
  };

  const terminate = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setIsReady(false);
  };

  return { isReady, error, run, terminate };
};
