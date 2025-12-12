import { Copy, Play, Loader2, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSelector } from './LanguageSelector';
import { ParticipantsList } from './ParticipantsList';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RoomHeaderProps {
  roomId: string;
  language: 'javascript' | 'python';
  participants: number;
  isRunning: boolean;
  isPyodideLoading: boolean;
  onLanguageChange: (language: 'javascript' | 'python') => void;
  onRun: () => void;
}

export const RoomHeader = ({
  roomId,
  language,
  participants,
  isRunning,
  isPyodideLoading,
  onLanguageChange,
  onRun,
}: RoomHeaderProps) => {
  const copyRoomLink = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success('Room link copied to clipboard!');
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3 md:gap-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link 
              to="/" 
              className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <Home className="h-4 w-4 text-muted-foreground" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>Back to home</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Room:</span>
          <code className="px-3 py-1.5 bg-muted rounded-lg text-sm font-mono font-medium text-foreground">
            {roomId}
          </code>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={copyRoomLink} className="h-8 w-8">
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy room link</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="hidden md:block">
          <ParticipantsList count={participants} />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <LanguageSelector language={language} onChange={onLanguageChange} />
        
        <Button 
          onClick={onRun} 
          disabled={isRunning || (language === 'python' && isPyodideLoading)}
          className="gap-2 gradient-primary hover:opacity-90"
        >
          {isRunning || isPyodideLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Run</span>
        </Button>
      </div>
    </header>
  );
};
