import { Terminal, XCircle, CheckCircle, Clock, Code } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConsolePanelProps {
  output: string;
  error: string | null;
  returnValue?: string;
  executionTime?: number;
  isRunning: boolean;
}

export const ConsolePanel = ({ 
  output, 
  error, 
  returnValue,
  executionTime,
  isRunning 
}: ConsolePanelProps) => {
  const hasContent = output || error || returnValue;
  
  return (
    <div className="h-full flex flex-col bg-background border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Output</span>
        {isRunning && (
          <span className="ml-auto text-xs text-muted-foreground animate-pulse">
            Running...
          </span>
        )}
        {!isRunning && executionTime !== undefined && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {executionTime < 1 ? '<1' : executionTime}ms
          </span>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {!hasContent && !isRunning && (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <Code className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              Run your code to see output here
            </p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Press the Run button or use the keyboard
            </p>
          </div>
        )}
        
        {returnValue && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Return Value
              </span>
            </div>
            <pre className="text-sm text-primary font-mono whitespace-pre-wrap bg-primary/5 border border-primary/20 p-3 rounded-md">
              {returnValue}
            </pre>
          </div>
        )}
        
        {output && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Console Output
              </span>
            </div>
            <pre className="text-sm text-foreground font-mono whitespace-pre-wrap bg-muted/30 p-3 rounded-md border border-border">
              {output}
            </pre>
          </div>
        )}
        
        {error && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-3 w-3 text-destructive" />
              <span className="text-xs text-destructive uppercase tracking-wide font-medium">
                Error
              </span>
            </div>
            <pre className="text-sm text-destructive font-mono whitespace-pre-wrap bg-destructive/10 border border-destructive/20 p-3 rounded-md">
              {error}
            </pre>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
