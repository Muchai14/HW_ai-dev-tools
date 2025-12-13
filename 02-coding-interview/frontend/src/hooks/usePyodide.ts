import { useState, useCallback, useRef, useEffect } from 'react';

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string[]) => Promise<void>;
}

declare global {
  interface Window {
    loadPyodide: () => Promise<PyodideInterface>;
  }
}

export const usePyodide = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const outputRef = useRef<string[]>([]);

  useEffect(() => {
    // Load Pyodide script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
    script.async = true;
    script.onload = () => {
      console.log('Pyodide script loaded');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initialize = useCallback(async () => {
    if (pyodideRef.current || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!window.loadPyodide) {
        throw new Error('Pyodide not loaded yet. Please wait...');
      }

      const pyodide = await window.loadPyodide();
      pyodideRef.current = pyodide;
      setIsReady(true);
      console.log('Pyodide initialized');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Pyodide');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const runPython = useCallback(async (code: string): Promise<{ output: string; error: string | null }> => {
    outputRef.current = [];
    
    if (!pyodideRef.current) {
      await initialize();
    }

    if (!pyodideRef.current) {
      return { output: '', error: 'Pyodide not initialized' };
    }

    try {
      // Redirect stdout
      await pyodideRef.current.runPythonAsync(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      // Run user code
      await pyodideRef.current.runPythonAsync(code);

      // Get output
      const result = await pyodideRef.current.runPythonAsync(`
stdout_output = sys.stdout.getvalue()
stderr_output = sys.stderr.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
(stdout_output, stderr_output)
      `) as [string, string];

      const [stdout, stderr] = result;
      
      if (stderr) {
        return { output: stdout, error: stderr };
      }
      
      return { output: stdout, error: null };
    } catch (err) {
      return { 
        output: '', 
        error: err instanceof Error ? err.message : 'Execution error' 
      };
    }
  }, [initialize]);

  return {
    isLoading,
    isReady,
    error,
    runPython,
    initialize,
  };
};
