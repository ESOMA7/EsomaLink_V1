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

// Funciones auxiliares fuera del componente para evitar re-creaciones
const saveGoogleRefreshToken = async (refreshToken: string, userId: string) => {
    console.log('[useAuth] saveGoogleRefreshToken called');
    
    try {
        console.log('[useAuth] Attempting to save refresh token to Supabase...');
        const { error } = await supabase
            .from('notes')
            .upsert({ 
                user_id: userId,
                title: 'google_refresh_token', 
                content: refreshToken,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'user_id,title' });

        if (error) {
            console.error('[useAuth] Error saving Google refresh token:', error);
        } else {
            console.log('[useAuth] Google refresh token saved successfully');
        }
    } catch (error) {
        console.error('[useAuth] Exception saving Google refresh token:', error);
    }
};

const saveGoogleAccessToken = async (accessToken: string, userId: string) => {
    console.log('[useAuth] saveGoogleAccessToken called');
    
    try {
        console.log('[useAuth] Attempting to save access token to Supabase...');
        const { error } = await supabase
            .from('notes')
            .upsert({ 
                user_id: userId,
                title: 'google_access_token', 
                content: accessToken,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'user_id,title' });

        if (error) {
            console.error('[useAuth] Error saving Google access token:', error);
        } else {
            console.log('[useAuth] Google access token saved successfully');
        }
    } catch (error) {
        console.error('[useAuth] Exception saving Google access token:', error);
    }
};

export const useAuth = () => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [session, setSession] = useState<any | null>(null); // Add session state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    // 2. Escuchar el estado de autenticación REAL de Supabase
    useEffect(() => {
        // Esta función se ejecuta inmediatamente y cuando el estado de auth cambia (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[useAuth] Auth state change:', { event, hasSession: !!session });
                setSession(session); // Store the session
                
                try {
                    const supabaseUser = session?.user;
                    if (supabaseUser) {
                        console.log('[useAuth] Setting user data...');
                        setUser({
                            id: supabaseUser.id,
                            email: supabaseUser.email,
                            name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
                        });
                        setIsAuthenticated(true);
                        console.log('[useAuth] User authenticated successfully');

                        // Si es un login con Google, guardar los tokens (COMPLETAMENTE DESHABILITADO PARA DEBUGGING)
                        if (event === 'SIGNED_IN' && session?.provider_token) {
                            console.log('[useAuth] Google login detected - token saving COMPLETELY DISABLED for debugging');
                            console.log('[useAuth] Has access token:', !!session.provider_token);
                            console.log('[useAuth] Has refresh token:', !!session.provider_refresh_token);
                            console.log('[useAuth] Skipping token saving to isolate re-render issue');
                        }
                    } else {
                        console.log('[useAuth] No user session, setting unauthenticated state');
                        setUser(null);
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error('[useAuth] Error in auth state change handler:', error);
                } finally {
                    // Ya sea que haya sesión o no, la carga inicial ha terminado
                    console.log('[useAuth] Setting loading to false');
                    setIsLoading(false);
                }
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

    return { user, session, isAuthenticated, isAuthLoading, authError, setAuthError, loginWithGoogle, logout }; // Return session
};