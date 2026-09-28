import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';

interface DigitalClockProps {
  onClick?: () => void;
  isActive?: boolean;
}

export const DigitalClock: React.FC<DigitalClockProps> = ({ onClick, isActive = false }) => {
  const { settings } = useSystem();
  const [time, setTime] = useState<Date>(new Date());
  const [showSeconds, setShowSeconds] = useState<boolean>(false);

  // Real-time synchronization interval
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format hours and minutes according to settings.timeFormat & settings.timezone
  const is12Hour = settings.timeFormat === '12h';
  
  let hoursDisplay = '';
  let minutesDisplay = '';
  let secondsDisplay = '';
  let ampmDisplay = '';

  try {
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: settings.timezone || undefined,
      hour: is12Hour ? 'numeric' : '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: is12Hour
    };

    const parts = new Intl.DateTimeFormat('en-US', timeOptions).formatToParts(time);
    const hourPart = parts.find(p => p.type === 'hour')?.value || '12';
    const minPart = parts.find(p => p.type === 'minute')?.value || '00';
    const secPart = parts.find(p => p.type === 'second')?.value || '00';
    const dayPeriodPart = parts.find(p => p.type === 'dayPeriod')?.value || '';

    hoursDisplay = is12Hour ? hourPart : hourPart.padStart(2, '0');
    minutesDisplay = minPart.padStart(2, '0');
    secondsDisplay = secPart.padStart(2, '0');
    ampmDisplay = dayPeriodPart;
  } catch {
    // Fallback standard calculation
    let rawHours = time.getHours();
    if (is12Hour) {
      ampmDisplay = rawHours >= 12 ? 'PM' : 'AM';
      rawHours = rawHours % 12 || 12;
      hoursDisplay = rawHours.toString();
    } else {
      hoursDisplay = rawHours.toString().padStart(2, '0');
    }
    minutesDisplay = time.getMinutes().toString().padStart(2, '0');
    secondsDisplay = time.getSeconds().toString().padStart(2, '0');
  }

  // Localized date formatting based on system settings
  const localeMap: Record<string, string> = {
    'pt-BR': 'pt-BR',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'en': 'en-US'
  };
  const locale = localeMap[settings.language] || 'en-US';

  const dateString = time.toLocaleDateString(locale, {
    timeZone: settings.timezone || undefined,
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const fullDateTooltip = time.toLocaleDateString(locale, {
    timeZone: settings.timezone || undefined,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ` (${settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone})`;

  return (
    <button
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowSeconds(prev => !prev);
      }}
      className={`group flex flex-col items-end px-2.5 py-1 rounded-xl transition-all select-none cursor-pointer ${
        isActive 
          ? 'bg-slate-800 ring-1 ring-violet-400/30 text-white' 
          : 'hover:bg-slate-800/80 text-slate-300'
      }`}
      title={`${fullDateTooltip} — Right-click to toggle seconds`}
    >
      {/* Time Display with Tabular Numerals */}
      <div className="flex items-center text-[11px] font-mono font-semibold text-white tracking-wide tabular-nums leading-tight">
        <span>{hoursDisplay}</span>
        <span className="text-violet-400 opacity-90 mx-[1px] inline-block">:</span>
        <span>{minutesDisplay}</span>
        {showSeconds && (
          <>
            <span className="text-violet-400/80 opacity-70 mx-[1px] inline-block">:</span>
            <span className="text-violet-300 text-[10px]">{secondsDisplay}</span>
          </>
        )}
        {is12Hour && ampmDisplay && (
          <span className="text-[9px] text-slate-400 ml-1 font-sans uppercase font-bold">{ampmDisplay}</span>
        )}
      </div>

      {/* Date Display */}
      <div className="text-[10px] text-slate-400 font-mono tracking-tight capitalize leading-tight mt-0.5 group-hover:text-slate-200 transition-colors">
        {dateString}
      </div>
    </button>
  );
};
