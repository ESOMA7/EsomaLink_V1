
import { useState, useCallback, useMemo } from 'react';
import { User } from '../types';

export const useAuth = () => {
    // In a real app, you would check localStorage or a cookie for a session
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const isAuthenticated = useMemo(() => !!user, [user]);

    // Simulates logging in with email and password
    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        setAuthError(null);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network request
        if (email === 'test@esomalink.com' && password === 'password123') {
            setUser({ id: '123', email: 'test@esomalink.com' });
            setIsLoading(false);
            return { success: true };
        } else {
            const errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.';
            setAuthError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
        }
    }, []);
    
    // Simulates logging in with Google
    const loginWithGoogle = useCallback(async () => {
        setIsLoading(true);
        setAuthError(null);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network request & popup
        setUser({ id: '456', email: 'google.user@example.com' });
        setIsLoading(false);
        return { success: true };
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network request
        setUser(null);
        setIsLoading(false);
    }, []);

    return { user, isAuthenticated, isAuthLoading, authError, setAuthError, login, loginWithGoogle, logout };
};
