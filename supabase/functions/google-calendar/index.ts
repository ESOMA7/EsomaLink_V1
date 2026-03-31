import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Configuración CORS para el preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Inicializar Supabase cliente con las variables de entorno inyectadas
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verificar al usuario
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Sin autorización')
    }

    // Parsear el body JSON enviado desde el cliente
    const { action, calendarId, eventData, eventId, params } = await req.json()

    // 1. Obtener su token de renovación (refresh_token) de user_integrations
    const { data: integration, error: dbError } = await supabaseClient
      .from('user_integrations')
      .select('google_refresh_token')
      .eq('user_id', user.id)
      .single()

    if (dbError || !integration || !integration.google_refresh_token) {
      throw new Error('No hay integración activa de Google Calendar.')
    }

    // 2. Refrescar el token contra Google OAuth
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
        refresh_token: integration.google_refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('Error refreshed access token:', tokenData)
      throw new Error('No se pudo refrescar el token de acceso.')
    }

    const accessToken = tokenData.access_token

    // 3. Ejecutar la acción solicitada usando el nuevo accessToken
    let googleApiResponse;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }

    if (action === 'listCalendars') {
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', { headers })
      googleApiResponse = await response.json()
    } 
    else if (action === 'listEvents') {
      const { timeMin, timeMax } = params || {}
      let url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?singleEvents=true&maxResults=250&orderBy=startTime`
      if (timeMin) url += `&timeMin=${encodeURIComponent(timeMin)}`
      if (timeMax) url += `&timeMax=${encodeURIComponent(timeMax)}`
      
      const response = await fetch(url, { headers })
      googleApiResponse = await response.json()
    }
    else if (action === 'createEvent') {
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify(eventData),
      })
      googleApiResponse = await response.json()
    }
    else if (action === 'updateEvent') {
      const realEventId = eventId.split('#').pop()
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(realEventId)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(eventData),
      })
      googleApiResponse = await response.json()
    }
    else if (action === 'patchEvent') {
      const realEventId = eventId.split('#').pop()
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(realEventId)}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(eventData),
      })
      googleApiResponse = await response.json()
    }
    else if (action === 'deleteEvent') {
      const realEventId = eventId.split('#').pop()
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(realEventId)}`, {
        method: 'DELETE',
        headers,
      })
      googleApiResponse = { success: response.ok } 
    }
    else {
      throw new Error(`Acción desconocida: ${action}`)
    }

    if (googleApiResponse.error) {
       console.error('Google API Error:', googleApiResponse.error)
       throw new Error(googleApiResponse.error.message || 'Error realizando la operación en Google Calendar')
    }

    return new Response(JSON.stringify(googleApiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
