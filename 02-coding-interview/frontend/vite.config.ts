import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
const MonacoEditorPlugin = (monacoEditorPlugin as any)?.default ?? monacoEditorPlugin;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    MonacoEditorPlugin({ languageWorkers: ['editorWorkerService', 'typescript'] }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
