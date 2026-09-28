import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const CalendarWidget: React.FC = () => {
  const { settings } = useSystem();
  const today = new Date();

  const localeMap: Record<string, string> = {
    'pt-BR': 'pt-BR',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'en': 'en-US'
  };
  const locale = localeMap[settings.language] || 'en-US';

  const dayName = today.toLocaleDateString(locale, { 
    timeZone: settings.timezone || undefined,
    weekday: 'long' 
  });
  const monthName = today.toLocaleDateString(locale, { 
    timeZone: settings.timezone || undefined,
    month: 'long', 
    year: 'numeric' 
  });
  const currentDay = today.getDate();

  const is12Hour = settings.timeFormat === '12h';
  const timeFormatted = today.toLocaleTimeString(locale, {
    timeZone: settings.timezone || undefined,
    hour: is12Hour ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12: is12Hour
  });

  // Days in month grid
  const daysInMonth = 30; // standard month grid representation
  const isMondayFirst = settings.firstDayOfWeek === 'monday';
  const startOffset = isMondayFirst ? 2 : 3;

  const weekHeaders = isMondayFirst
    ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-14 right-3 w-76 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl z-50 text-xs text-slate-200 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="text-sm font-bold text-white capitalize">{dayName}</div>
          <div className="text-[11px] text-slate-400 capitalize">{monthName}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold text-violet-400">
            {timeFormatted}
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            {settings.timezone.split('/')[1]?.replace('_', ' ') || settings.timezone}
          </div>
        </div>
      </div>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400">
        {weekHeaders.map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>

      {/* Days Matrix */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {Array.from({ length: startOffset }).map((_, i) => (
          <span key={`empty-${i}`} className="p-1 text-slate-700">·</span>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = dayNum === currentDay;
          return (
            <span
              key={dayNum}
              className={`p-1 rounded-lg font-medium transition-colors ${
                isToday 
                  ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-500/30' 
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {dayNum}
            </span>
          );
        })}
      </div>
    </div>
  );
};
