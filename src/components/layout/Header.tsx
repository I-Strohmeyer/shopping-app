import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}

export function Header({ title, onBack, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="flex items-center gap-2 px-4 h-14 max-w-3xl">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
        )}
        <h1 className="flex-1 font-semibold text-slate-900 truncate text-lg">
          {title}
        </h1>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}
