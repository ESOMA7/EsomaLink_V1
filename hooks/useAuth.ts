// En hooks/useAuth.ts

import { useState, useCallback, useEffect } from 'react';
// 1. Importar el cliente de Supabase (¡Esto es crucial!)
import { supabase } from '../services/supabaseClient';
// Definimos nuestro tipo de usuario para la aplicación
interface AppUser {
  id: string;
  email?: string;
  name?: string;
}

export const useAuth = () => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    // 2. Escuchar el estado de autenticación REAL de Supabase
    useEffect(() => {
        // Esta función se ejecuta inmediatamente y cuando el estado de auth cambia (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const supabaseUser = session?.user;
                if (supabaseUser) {
                    setUser({
                        id: supabaseUser.id,
                        email: supabaseUser.email,
                        name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
                    });
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
                // Ya sea que haya sesión o no, la carga inicial ha terminado
                setIsLoading(false);
            }
        );

        // Limpiar la suscripción cuando el componente se desmonte
        return () => subscription.unsubscribe();
    }, []);
    
    // 3. Implementación REAL de login con Google
    const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; }> => {
        setIsLoading(true);
        setAuthError(null);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });

        if (error) {
            console.error('Error durante el inicio de sesión con Google:', error);
            setAuthError(error.message);
            setIsLoading(false);
            return { success: false };
        }
        
        // No necesitamos hacer más aquí, el onAuthStateChange se encargará del resto
        return { success: true };
    }, []);

    // 4. Implementación REAL de logout
    const logout = useCallback(async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Error durante el cierre de sesión:', error);
            setAuthError(error.message);
            setIsLoading(false);
        }
        
        // onAuthStateChange se encargará de actualizar el estado a "no autenticado"
    }, []);

    return { user, isAuthenticated, isAuthLoading, authError, setAuthError, loginWithGoogle, logout };
};