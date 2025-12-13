import { User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ParticipantsListProps {
  count: number;
}

export const ParticipantsList = ({ count }: ParticipantsListProps) => {
  // Generate avatar placeholders for participants
  const avatars = Array.from({ length: Math.min(count, 5) }, (_, i) => i);
  const remaining = count > 5 ? count - 5 : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center -space-x-2 cursor-default">
          {avatars.map((i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center"
              style={{ zIndex: 5 - i }}
            >
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
          {remaining > 0 && (
            <div className="h-8 w-8 rounded-full bg-primary border-2 border-card flex items-center justify-center text-xs font-medium text-primary-foreground">
              +{remaining}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{count} participant{count !== 1 ? 's' : ''} in this room</p>
      </TooltipContent>
    </Tooltip>
  );
};
