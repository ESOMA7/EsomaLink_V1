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

    // Función para guardar el refresh token de Google en Supabase
    const saveGoogleRefreshToken = async (refreshToken: string) => {
        try {
            const { error } = await supabase
                .from('configuraciones')
                .upsert({ clave: 'google_refresh_token', valor: refreshToken }, { onConflict: 'clave' });

            if (error) {
                console.error('Error saving Google refresh token:', error);
            } else {
                console.log('Google refresh token saved successfully');
            }
        } catch (error) {
            console.error('Error saving Google refresh token:', error);
        }
    };

    // Función para guardar el access token de Google en Supabase
    const saveGoogleAccessToken = async (accessToken: string) => {
        try {
            const { error } = await supabase
                .from('configuraciones')
                .upsert({ clave: 'google_access_token', valor: accessToken }, { onConflict: 'clave' });

            if (error) {
                console.error('Error saving Google access token:', error);
            } else {
                console.log('Google access token saved successfully');
            }
        } catch (error) {
            console.error('Error saving Google access token:', error);
        }
    };

    // 2. Escuchar el estado de autenticación REAL de Supabase
    useEffect(() => {
        // Esta función se ejecuta inmediatamente y cuando el estado de auth cambia (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const supabaseUser = session?.user;
                if (supabaseUser) {
                    setUser({
                        id: supabaseUser.id,
                        email: supabaseUser.email,
                        name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
                    });
                    setIsAuthenticated(true);

                    // Si es un login con Google, guardar los tokens
                    if (event === 'SIGNED_IN' && session?.provider_token && session?.provider_refresh_token) {
                        console.log('Google login detected, saving tokens...');
                        console.log('Access token:', session.provider_token);
                        console.log('Refresh token:', session.provider_refresh_token);
                        
                        // Guardar ambos tokens
                        await saveGoogleAccessToken(session.provider_token);
                        await saveGoogleRefreshToken(session.provider_refresh_token);
                    }
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
    
    // 3. Implementación REAL de login con Google con scopes de calendario
    const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; }> => {
        setIsLoading(true);
        setAuthError(null);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
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