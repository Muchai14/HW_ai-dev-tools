import { useState } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { LanguageSelector } from '@/components/LanguageSelector';
import { usePyodideWorker } from '@/hooks/usePyodideWorker';

const EditorDemo = () => {
  const [jsCode, setJsCode] = useState('// JavaScript example\nfunction greet(name) {\n  return `Hello, ${name}`;\n}\n\nconsole.log(greet("World"));');
  const [pyCode, setPyCode] = useState('# Python example\ndef greet(name):\n    return f"Hello, {name}"\n\nprint(greet("World"))');
  const [jsLang, setJsLang] = useState<'javascript' | 'python'>('javascript');
  const [pyLang, setPyLang] = useState<'javascript' | 'python'>('python');
  const pyodide = usePyodideWorker();
  const [jsOutput, setJsOutput] = useState<string>('');
  const [jsError, setJsError] = useState<string | null>(null);
  const [pyOutput, setPyOutput] = useState<string>('');
  const [pyError, setPyError] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Monaco Editor Demo — JavaScript & Python</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-[60vh] border rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">JavaScript</h2>
            <LanguageSelector language={jsLang} onChange={(l) => setJsLang(l)} />
          </div>
          <div className="h-full">
            <CodeEditor code={jsCode} language={jsLang} onChange={setJsCode} />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 rounded bg-primary text-primary-foreground"
              onClick={async () => {
                setJsOutput('Running...');
                setJsError(null);
                // For JS we evaluate in the browser (not via Pyodide)
                try {
                  // eslint-disable-next-line no-eval
                  const res = eval(jsCode);
                  setJsOutput(String(res ?? ''));
                } catch (err: any) {
                  setJsError(err?.message || String(err));
                }
              }}
            >
              Run JS
            </button>
            <div className="flex-1">
              <div className="font-mono text-sm whitespace-pre-wrap bg-muted p-2 rounded">{jsError ? `Error: ${jsError}` : jsOutput}</div>
            </div>
          </div>
        </div>

        <div className="h-[60vh] border rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Python</h2>
            <LanguageSelector language={pyLang} onChange={(l) => setPyLang(l)} />
          </div>
          <div className="h-full">
            <CodeEditor code={pyCode} language={pyLang} onChange={setPyCode} />
          </div>
          <div className="flex gap-2 mt-2 items-center">
            <button
              className="px-3 py-1 rounded bg-primary text-primary-foreground"
              onClick={async () => {
                setPyOutput('Running...');
                setPyError(null);
                if (!pyodide.isReady) {
                  // wait a little for initialization
                  setPyOutput('Initializing Pyodide...');
                }
                try {
                  const res = await pyodide.run(pyCode);
                  setPyOutput(res.output || '');
                  setPyError(res.error || null);
                } catch (err: any) {
                  setPyError(err?.message || String(err));
                }
              }}
            >
              Run Python
            </button>
            <div className="flex-1">
              <div className="font-mono text-sm whitespace-pre-wrap bg-muted p-2 rounded">{pyError ? `Error: ${pyError}` : pyOutput}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorDemo;
