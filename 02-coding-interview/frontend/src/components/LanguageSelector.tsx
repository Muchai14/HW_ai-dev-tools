import { FileCode, FileJson } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  language: 'javascript' | 'python';
  onChange: (language: 'javascript' | 'python') => void;
}

export const LanguageSelector = ({ language, onChange }: LanguageSelectorProps) => {
  return (
    <Select value={language} onValueChange={(value) => onChange(value as 'javascript' | 'python')}>
      <SelectTrigger className="w-[130px] md:w-[150px] bg-muted border-0">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="javascript">
          <div className="flex items-center gap-2">
            <FileJson className="h-4 w-4 text-yellow-500" />
            <span>JavaScript</span>
          </div>
        </SelectItem>
        <SelectItem value="python">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-blue-500" />
            <span>Python</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
