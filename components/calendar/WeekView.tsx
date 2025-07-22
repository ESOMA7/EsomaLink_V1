import React, { useEffect, useRef, useState } from 'react';
import { AppointmentEvent } from '../../types';

interface WeekViewProps {
    currentDate: Date;
    events: AppointmentEvent[];
    onEventClick: (event: AppointmentEvent) => void;
    onUpdateAppointmentDate: (eventId: string | number, newStartDate: Date, newEndDate: Date) => Promise<{ success: boolean }>;
    onSlotClick: (date: Date) => void;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, events, onEventClick, onUpdateAppointmentDate, onSlotClick, selectedDate, onDateSelect }) => {
    const HOUR_HEIGHT = 48; // Corresponds to h-12 in Tailwind
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
        return () => clearInterval(timer);
    }, []);

    const dayOfWeek = currentDate.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Sunday (0) to be the last day
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - diff);

    const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getTopPositionForTime = (date: Date) => {
        const totalMinutes = date.getHours() * 60 + date.getMinutes();
        return (totalMinutes / 60) * HOUR_HEIGHT;
    };

    const handleSlotClick = (e: React.MouseEvent, day: Date) => {
        if (!containerRef.current) return;

        const gridRect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - gridRect.top;
        const totalMinutes = (clickY / (HOUR_HEIGHT * 24)) * 24 * 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);

        const clickedDate = new Date(day);
        clickedDate.setHours(hours, minutes, 0, 0);

        onSlotClick(clickedDate);
    };

    const handleDrop = (e: React.DragEvent, dropDate: Date) => {
        e.preventDefault();
        const eventId = e.dataTransfer.getData('text/plain');
        const eventToMove = events.find(ev => String(ev.id) === eventId);

        if (!eventToMove || !containerRef.current) return;

        const gridRect = e.currentTarget.getBoundingClientRect();
        const dropY = e.clientY - gridRect.top;
        const totalMinutes = (dropY / (HOUR_HEIGHT * 24)) * 24 * 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);

        const duration = eventToMove.end.getTime() - eventToMove.start.getTime();
        
        const newStartDate = new Date(dropDate);
        newStartDate.setHours(hours, minutes, 0, 0);

        const newEndDate = new Date(newStartDate.getTime() + duration);

        onUpdateAppointmentDate(eventToMove.id, newStartDate, newEndDate);
    };

    return (
        <div className="flex flex-col h-full" ref={containerRef}>
            {/* Header with day names and numbers */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <div className="w-16 flex-shrink-0"></div> {/* Spacer for time column */}
                {days.map(day => (
                    <div key={day.toISOString()} className="flex-1 text-center py-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{day.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}</p>
                        <button 
                            onClick={() => onDateSelect(day)}
                            className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full transition-colors ${day.toDateString() === selectedDate.toDateString() ? 'bg-orange-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            {day.getDate()}
                        </button>
                    </div>
                ))}
            </div>

            {/* Grid container */}
            <div className="flex-grow overflow-y-auto relative h-full">
                <div className="flex h-full">
                    {/* Time column */}
                    <div className="w-16 flex-shrink-0">
                        {hours.map(hour => {
                            if (hour === 0) return <div key={hour} className="h-12 border-r border-slate-200 dark:border-slate-700"></div>;
                            const h12 = hour % 12 === 0 ? 12 : hour % 12;
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            return (
                                <div key={hour} className="h-12 border-r border-slate-200 dark:border-slate-700 text-right pr-2 pt-1 text-xs text-slate-400 dark:text-slate-500">
                                    {`${h12} ${ampm}`}
                                </div>
                            );
                        })}
                    </div>

                    {/* Day columns */}
                    <div className="flex-grow grid grid-cols-7 relative">
                        {days.map(day => (
                            <div 
                                key={day.toISOString()} 
                                className="flex-1 border-r border-slate-200 dark:border-slate-700 relative"
                                onDragOver={(e) => e.preventDefault()} // Allow dropping
                                onDrop={(e) => handleDrop(e, day)}
                                onClick={(e) => handleSlotClick(e, day)}
                            >
                                {hours.map(hour => (
                                    <div key={hour} className="h-12 border-b border-slate-200 dark:border-slate-700"></div>
                                ))}
                            </div>
                        ))}

                        {/* Render events */}
                        {events.map(event => {
                            const eventStart = new Date(event.start);
                            const eventEnd = new Date(event.end);

                            const dayIndex = days.findIndex(d => d.toDateString() === eventStart.toDateString());
                            if (dayIndex === -1) return null;

                            const top = getTopPositionForTime(eventStart);
                            const durationMinutes = (eventEnd.getTime() - eventStart.getTime()) / 60000;
                            const height = (durationMinutes / 60) * HOUR_HEIGHT;

                            return (
                                <div
                                    key={`${event.id}-${new Date(event.start).toISOString()}`}
                                    draggable
                                    onDragStart={(e) => {
                                        e.stopPropagation();
                                        e.dataTransfer.setData('text/plain', String(event.id));
                                    }}
                                    onClick={() => {
                                        // This timeout helps differentiate between a click and a drag
                                        setTimeout(() => onEventClick(event), 0);
                                    }}
                                    className="absolute p-1 rounded-lg text-white text-xs leading-tight z-10 cursor-grab"
                                    style={{
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        left: `${(dayIndex / 7) * 100}%`,
                                        width: `calc(${(1 / 7) * 100}% - 4px)`,
                                        marginLeft: '2px',
                                        marginRight: '2px',
                                        backgroundColor: event.color || '#3b82f6'
                                    }}
                                >
                                    <p className="font-semibold truncate">{event.procedure}</p>
                                    <p className="truncate">{event.patient}</p>
                                </div>
                            );
                        })}

                        {/* Current time indicator */}
                        {days.some(d => d.toDateString() === new Date().toDateString()) && (
                             <div 
                                className="absolute w-full h-0.5 bg-orange-500 z-20 flex items-center"
                                style={{ top: `${getTopPositionForTime(currentTime)}px` }}
                            >
                                <div className="w-2 h-2 bg-orange-500 rounded-full -ml-1"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeekView;