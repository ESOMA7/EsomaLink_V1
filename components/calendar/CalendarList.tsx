import React from 'react';
import { Calendar } from '../../types/calendar';

interface CalendarListProps {
    calendars: Calendar[];
    visibleCalendars: Set<string>;
    onToggleCalendar: (calendarId: string) => void;
}

const CalendarList: React.FC<CalendarListProps> = ({ calendars, visibleCalendars, onToggleCalendar }) => {
    console.log('Calendars received in CalendarList:', calendars);
    return (
        <div className="p-4 border-r border-slate-200 dark:border-slate-700 w-64 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Mis Calendarios</h2>
            <ul>
                {calendars.map(calendar => (
                    <li key={calendar.id} className="mb-2">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={visibleCalendars.has(calendar.id)}
                                onChange={() => onToggleCalendar(calendar.id)}
                                className="form-checkbox h-5 w-5 rounded mr-3" 
                                style={{ accentColor: calendar.backgroundColor }}
                            />
                            <span 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: calendar.backgroundColor }}
                            ></span>
                            <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{calendar.summary}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CalendarList;
