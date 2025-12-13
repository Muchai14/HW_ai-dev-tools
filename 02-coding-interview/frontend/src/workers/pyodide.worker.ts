// Worker script to load Pyodide and execute Python code safely off the main thread.
// This file runs in a Web Worker context.

// NOTE: We use importScripts to load the Pyodide bootstrap from CDN.
(self as any).addEventListener('message', async (e: MessageEvent) => {
  const msg = e.data;
  if (!msg || !msg.type) return;

  if (msg.type === 'init') {
    try {
      // Load pyodide
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
      // @ts-ignore
      (self as any).pyodide = await (self as any).loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
      postMessage({ type: 'inited' });
    } catch (err) {
      postMessage({ type: 'init_error', error: err instanceof Error ? err.message : String(err) });
    }
    return;
  }

  if (msg.type === 'run') {
    const id = msg.id;
    const code: string = msg.code || '';

    try {
      const pyodide = (self as any).pyodide;
      if (!pyodide) {
        postMessage({ type: 'result', id, output: '', error: 'Pyodide not initialized' });
        return;
      }

      // Prepare capturing stdout/stderr
      await pyodide.runPythonAsync(`import sys\nfrom io import StringIO\n_sys_stdout = sys.stdout\n_sys_stderr = sys.stderr\nsys.stdout = StringIO()\nsys.stderr = StringIO()`);

      // Execute user code
      try {
        await pyodide.runPythonAsync(code);
      } catch (execErr) {
        // swallow; we'll fetch stderr below
      }

      // Retrieve outputs
      const result = await pyodide.runPythonAsync(`stdout_val = sys.stdout.getvalue()\nstderr_val = sys.stderr.getvalue()\nsys.stdout = _sys_stdout\nsys.stderr = _sys_stderr\n(stdout_val, stderr_val)`);
      const [stdout, stderr] = result as [string, string];

      postMessage({ type: 'result', id, output: stdout ?? '', error: stderr ?? null });
    } catch (err) {
      postMessage({ type: 'result', id, output: '', error: err instanceof Error ? err.message : String(err) });
    }
    return;
  }
});
