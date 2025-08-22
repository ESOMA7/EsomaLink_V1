import React, { useState, useEffect } from 'react';

const Timeline: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(timer);
    };
  }, []);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const topPosition = (currentTime.getHours() + currentTime.getMinutes() / 60) * 6; // 6rem per hour

  return (
    <div className="relative h-full">
      {hours.map(hour => (
        <div key={hour} className="h-24 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500 dark:text-slate-400 p-1">{`${hour}:00`}</span>
        </div>
      ))}
      <div 
        className="absolute w-full bg-red-500 h-0.5"
        style={{ top: `${topPosition}rem` }}
      >
        <div className="absolute -left-2 w-4 h-4 bg-red-500 rounded-full -mt-1.5"></div>
      </div>
    </div>
  );
};

export default Timeline;