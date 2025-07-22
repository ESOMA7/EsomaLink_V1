
import React, { useState, useRef, useEffect } from 'react';
import { AppointmentEvent } from '../../types';
import { getEventColor } from '../../constants';
import { PlusCircle, X } from 'lucide-react';

interface MonthViewProps {
    currentDate: Date;
    events: AppointmentEvent[];
    onDayClick: (date: Date) => void;
    onEventClick: (event: AppointmentEvent) => void;
    onUpdateAppointmentDate: (eventId: string | number, newStartDate: Date, newEndDate: Date) => void;
}

interface PopoverState {
    isOpen: boolean;
    events: AppointmentEvent[];
    day: Date;
    position: { top: number; left: number };
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, onDayClick, onEventClick, onUpdateAppointmentDate }) => {
    const [draggedEvent, setDraggedEvent] = useState<AppointmentEvent | null>(null);
    const [dropTargetDay, setDropTargetDay] = useState<Date | null>(null);
    const [popover, setPopover] = useState<PopoverState | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setPopover(null);
            }
        };
        if (popover?.isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popover]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDayOfWeek = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const calendarDays: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const MOCK_TODAY = new Date(2025, 6, 2);

        const handleDrop = (e: React.DragEvent, dropDate: Date) => {
        e.preventDefault();
        const eventId = e.dataTransfer.getData('text/plain');
        const eventToMove = events.find(ev => String(ev.id) === eventId);
        
        if (eventToMove) {
            const duration = eventToMove.end.getTime() - eventToMove.start.getTime();
            
            const newStartDate = new Date(dropDate);
            newStartDate.setHours(eventToMove.start.getHours(), eventToMove.start.getMinutes(), eventToMove.start.getSeconds(), eventToMove.start.getMilliseconds());
            
            const newEndDate = new Date(newStartDate.getTime() + duration);

            onUpdateAppointmentDate(eventToMove.id, newStartDate, newEndDate);
        }
        setDraggedEvent(null);
        setDropTargetDay(null);
    };

    const handleShowMoreClick = (e: React.MouseEvent<HTMLButtonElement>, day: Date, dayEvents: AppointmentEvent[]) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        const buttonRect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const popoverWidth = 256; // w-64
        let top = buttonRect.top - containerRect.top + buttonRect.height + 4;
        let left = buttonRect.left - containerRect.left;

        if (left + popoverWidth > containerRect.width) {
            left = buttonRect.right - containerRect.left - popoverWidth;
        }

        if (left < 0) {
            left = 0;
        }
        
        setPopover({ isOpen: true, events: dayEvents, day, position: { top, left } });
    };

    return (
        <div className="h-full flex flex-col relative" ref={containerRef}>
            <div className="grid grid-cols-7">
                {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-700">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-grow gap-px bg-slate-200 dark:bg-slate-700">
                {calendarDays.map((day, index) => {
                    if (!day) return <div key={index} className="bg-slate-50 dark:bg-slate-800/50"></div>;

                    const isToday = day.toDateString() === MOCK_TODAY.toDateString();
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isDropTarget = dropTargetDay?.toDateString() === day.toDateString();
                    
                    const dayEvents = events
                        .filter(e => new Date(e.start).toDateString() === day.toDateString())
                        .sort((a, b) => a.start.getTime() - b.start.getTime());
                    
                    const eventsToShow = dayEvents.slice(0, 2);
                    const moreEventsCount = dayEvents.length - eventsToShow.length;

                    return (
                        <div 
                            key={index} 
                            className={`bg-white dark:bg-slate-800 p-1 relative flex flex-col group transition-colors duration-200 cursor-pointer 
                                ${isDropTarget ? 'bg-orange-100 dark:bg-orange-500/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={() => setDropTargetDay(day)}
                            onDragLeave={() => setDropTargetDay(null)}
                            onDrop={(e) => handleDrop(e, day)}
                            onClick={() => onDayClick(day)}
                        >
                           <div className="flex justify-between items-start">
                                <span className={`text-sm mb-1 ${isToday ? 'bg-orange-500 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold' : isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {day.getDate()}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDayClick(day); }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-orange-500 dark:text-slate-500 dark:hover:text-orange-400 p-1"
                                    title="Añadir cita"
                                >
                                    <PlusCircle className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-grow mt-1 space-y-1 overflow-y-auto">
                                {eventsToShow.map(event => (
                                    <div 
                                        key={event.id} 
                                        draggable
                                        onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('text/plain', String(event.id)); setDraggedEvent(event); }}
                                        onDragEnd={(e) => { e.stopPropagation(); setDraggedEvent(null); setDropTargetDay(null); }}
                                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }} 
                                        style={{ backgroundColor: event.color || getEventColor(event.professional) }}
                                        className={`p-1 rounded text-white text-[10px] leading-tight cursor-grab ${draggedEvent?.id === event.id ? 'opacity-50' : ''}`}
                                    >
                                        <p className="font-semibold truncate">{event.procedure}</p>
                                        <p className="truncate">{new Date(event.start).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: false })}</p>
                                    </div>
                                ))}
                                {moreEventsCount > 0 && (
                                     <button 
                                        onClick={(e) => handleShowMoreClick(e, day, dayEvents)}
                                        className="text-xs text-blue-500 dark:text-blue-400 hover:underline text-left w-full mt-1"
                                     >
                                         + {moreEventsCount} más
                                     </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {popover?.isOpen && (
                <div 
                    ref={popoverRef}
                    style={{ top: `${popover.position.top}px`, left: `${popover.position.left}px` }}
                    className="absolute z-30 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700"
                >
                   <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                       <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                                Citas del {popover.day.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                            </h4>
                            <button onClick={() => setPopover(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                <X className="h-4 w-4" />
                            </button>
                       </div>
                   </div>
                   <ul className="p-2 max-h-60 overflow-y-auto">
                        {popover.events.map(event => (
                            <li key={event.id}>
                                <button 
                                    onClick={() => { onEventClick(event); setPopover(null); }}
                                    className={`w-full text-left p-2 rounded flex items-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
                                >
                                    <span style={{ backgroundColor: event.color || getEventColor(event.professional) }} className={`w-2 h-2 flex-shrink-0 rounded-full mr-3`}></span>
                                    <div className="flex-grow text-xs">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{event.procedure}</p>
                                        <p className="text-slate-500 dark:text-slate-400 truncate">
                                            {event.start.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })} - {event.patient}
                                        </p>
                                    </div>
                                </button>
                            </li>
                        ))}
                   </ul>
                </div>
            )}
        </div>
    );
};

export default MonthView;
