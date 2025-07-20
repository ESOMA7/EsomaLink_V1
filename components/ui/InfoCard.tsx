import React, { useState } from 'react';
import { LucideProps, Eye, EyeOff } from 'lucide-react';

interface InfoCardProps {
    icon: React.ComponentType<LucideProps>;
    title: string;
    value: string;
    subtitle: string;
    color: 'blue' | 'red' | 'green' | 'orange' | 'yellow';
    onClick?: () => void;
    isSensitive?: boolean;
    newInterventionAvailable?: boolean;
}

const colorClasses = {
    blue: {
        bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
        text: 'text-white',
        subtitle: 'text-blue-200',
        hover: 'hover:shadow-blue-400/40'
    },
    red: {
        bg: 'bg-gradient-to-br from-red-500 to-red-600',
        text: 'text-white',
        subtitle: 'text-red-200',
        hover: 'hover:shadow-red-400/40'
    },
    green: {
        bg: 'bg-gradient-to-br from-green-500 to-green-600',
        text: 'text-white',
        subtitle: 'text-green-200',
        hover: 'hover:shadow-green-400/40'
    },
    orange: {
        bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
        text: 'text-white',
        subtitle: 'text-orange-200',
        hover: 'hover:shadow-orange-400/40'
    },
    yellow: {
        bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
        text: 'text-white',
        subtitle: 'text-yellow-100',
        hover: 'hover:shadow-yellow-400/40'
    },
};

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, value, subtitle, color, onClick, isSensitive = false, newInterventionAvailable = false }) => {
    const classes = colorClasses[color];
    const [isVisible, setIsVisible] = useState(!isSensitive);

    const handleToggleVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(prev => !prev);
    };

    return (
        <div 
            className={`relative p-5 rounded-xl shadow-lg flex flex-col justify-between h-44 ${classes.bg} ${classes.text} ${onClick ? 'cursor-pointer' : ''} transition-all duration-300 transform hover:-translate-y-2 ${classes.hover}`}
            onClick={onClick}
            role={onClick ? 'button' : 'region'}
            aria-label={`${title}: ${value}. ${subtitle}`}
            tabIndex={onClick ? 0 : -1}
            onKeyDown={(e) => {
                if(onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            <div className="flex justify-between items-start">
                <div className="p-3 bg-black bg-opacity-20 rounded-lg">
                    <Icon className="h-6 w-6" />
                </div>
                {newInterventionAvailable && (
                    <span className="absolute top-3 right-3 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-400"></span>
                    </span>
                )}
                {isSensitive && (
                    <button 
                        onClick={handleToggleVisibility} 
                        className="p-1 rounded-full text-white/80 hover:bg-black/20 hover:text-white"
                        aria-label={isVisible ? 'Ocultar valor' : 'Mostrar valor'}
                    >
                        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
            <div>
                <p className="text-3xl font-bold">
                    {isVisible ? value : '••••••'}
                </p>
                <p className="font-medium">{title}</p>
                <p className={`text-sm ${classes.subtitle}`}>{subtitle}</p>
            </div>
        </div>
    );
};

export default InfoCard;