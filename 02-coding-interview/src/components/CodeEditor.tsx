import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  language: 'javascript' | 'python';
  onChange: (code: string) => void;
  readOnly?: boolean;
}

// Disable Monaco workers (not needed for basic JS/Python editing)
self.MonacoEnvironment = {
  getWorker: () => null as unknown as Worker,
};

export const CodeEditor = ({ code, language, onChange, readOnly = false }: CodeEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create editor
    editorRef.current = monaco.editor.create(containerRef.current, {
      value: code,
      language: language,
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      padding: { top: 16, bottom: 16 },
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      readOnly,
      tabSize: 2,
    });

    // Listen for changes
    editorRef.current.onDidChangeModelContent(() => {
      const value = editorRef.current?.getValue() || '';
      onChange(value);
    });

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  // Update language when it changes
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Update code from external changes (multi-tab sync)
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== code) {
        const position = editorRef.current.getPosition();
        editorRef.current.setValue(code);
        if (position) {
          editorRef.current.setPosition(position);
        }
      }
    }
  }, [code]);

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full rounded-lg overflow-hidden border border-border"
    />
  );
};
