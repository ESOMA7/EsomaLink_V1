import { createContext, useContext, ReactNode } from 'react';
import { useAppointments } from '@/hooks/useAppointments';

// 1. Create the context
const AppointmentsContext = createContext<ReturnType<typeof useAppointments> | undefined>(undefined);

// 2. Create a custom hook for easy consumption
export const useAppointmentsContext = () => {
    const context = useContext(AppointmentsContext);
    if (context === undefined) {
        throw new Error('useAppointmentsContext must be used within an AppointmentsProvider');
    }
    return context;
};

// 3. Create the Provider component
export const AppointmentsProvider = ({ children }: { children: ReactNode }) => {
    const appointmentsData = useAppointments();

    return (
        <AppointmentsContext.Provider value={appointmentsData}>
            {children}
        </AppointmentsContext.Provider>
    );
};
