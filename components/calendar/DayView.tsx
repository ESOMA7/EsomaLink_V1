import React from 'react';
import { AppointmentEvent } from '../../types';
import Timeline from './Timeline';

interface DayViewProps {
  currentDate: Date;
  events: AppointmentEvent[];
  onEventClick: (event: AppointmentEvent) => void;
  onSlotClick: (date: Date) => void;
}

const DayView: React.FC<DayViewProps> = ({ currentDate, events, onEventClick, onSlotClick }) => {
  const dayHours = Array.from({ length: 24 }, (_, i) => i);

  const handleSlotClick = (hour: number) => {
    const clickedDate = new Date(currentDate);
    clickedDate.setHours(hour, 0, 0, 0);
    onSlotClick(clickedDate);
  };

  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.getDate() === currentDate.getDate() && 
           eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="flex flex-col h-full">
      <header className="flex-none">
        <div className="grid grid-cols-1">
          <div className="text-center py-2 font-semibold text-slate-700 dark:text-slate-200">
            {currentDate.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>
      <div className="flex-grow overflow-y-auto relative">
        <Timeline />
        <div className="grid grid-cols-1 absolute top-0 left-0 right-0 bottom-0">
          {dayHours.map(hour => (
            <div 
              key={hour} 
              className="h-24 border-b border-r border-slate-200 dark:border-slate-700 p-1 relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => handleSlotClick(hour)}
            >
              {dayEvents
                .filter(event => new Date(event.start).getHours() === hour)
                .map(event => {
                  const eventDate = new Date(event.start);
                  const topPosition = eventDate.getMinutes() / 60 * 100; // Position within the hour slot
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      className="absolute left-10 right-2 mt-1 p-1 rounded-lg text-white text-xs truncate"
                      style={{ 
                        backgroundColor: event.backgroundColor || '#3174ad',
                        top: `${topPosition}%`
                      }}
                    >
                      {event.title}
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayView;