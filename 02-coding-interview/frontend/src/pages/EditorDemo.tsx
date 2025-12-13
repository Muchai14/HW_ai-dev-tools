import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import { LanguageSelector } from '@/components/LanguageSelector';

const EditorDemo = () => {
  const [jsCode, setJsCode] = useState('// JavaScript example\nfunction greet(name) {\n  return `Hello, ${name}`;\n}\n\nconsole.log(greet("World"));');
  const [pyCode, setPyCode] = useState('# Python example\ndef greet(name):\n    return f"Hello, {name}"\n\nprint(greet("World"))');
  const [jsLang, setJsLang] = useState<'javascript' | 'python'>('javascript');
  const [pyLang, setPyLang] = useState<'javascript' | 'python'>('python');

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
        </div>

        <div className="h-[60vh] border rounded-lg p-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Python</h2>
            <LanguageSelector language={pyLang} onChange={(l) => setPyLang(l)} />
          </div>
          <div className="h-full">
            <CodeEditor code={pyCode} language={pyLang} onChange={setPyCode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorDemo;
