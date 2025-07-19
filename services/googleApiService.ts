
/**
 * Service for Google API calls via a secure backend (e.g., Vercel Serverless Functions).
 * 
 * This file contains placeholder functions that will invoke your backend endpoints.
 * This pattern keeps your Google API keys and user tokens secure.
 * The frontend should NEVER call Google APIs directly with sensitive credentials.
 */

// Helper to simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Google Calendar API Functions ---

const fetchCalendarEvents = async (): Promise<any[]> => {
    console.log("Simulating fetch from Google Calendar via Backend Function...");
    await sleep(1200);
    // In a real app, you would:
    // const response = await fetch('/api/google/calendar/events');
    // if (!response.ok) throw new Error('Failed to fetch');
    // return response.json();
    console.warn("Using mock data for Google Calendar. Implement backend connection.");
    return []; // Return empty array to indicate no events are configured yet.
};

const saveCalendarEvent = async (eventData: any): Promise<any> => {
     console.log("Simulating save to Google Calendar via Backend Function...", eventData);
    await sleep(800);
    return { success: true, ...eventData };
};

const deleteCalendarEvent = async (eventId: number): Promise<{success: boolean}> => {
    console.log(`Simulating delete event ${eventId} from Google Calendar via Backend Function...`);
    await sleep(500);
    return { success: true };
};

const updateCalendarEventDate = async (eventId: number, newStartDate: Date, newEndDate: Date): Promise<any> => {
    console.log(`Simulating update event ${eventId} date in Google Calendar...`);
    await sleep(700);
    return { success: true, id: eventId, start: newStartDate, end: newEndDate };
}

// --- Google Sheets API Functions ---

const fetchSheetData = async (sheetName: 'payments' | 'interventions'): Promise<any[]> => {
    console.log(`Simulating fetch from Google Sheet "${sheetName}" via Backend Function...`);
    await sleep(1500);
    console.warn(`Using mock data for Google Sheet "${sheetName}". Implement backend connection.`);
    return []; // Return empty array
};

const saveSheetRow = async (sheetName: 'payments' | 'interventions', rowData: any): Promise<any> => {
    console.log(`Simulating save row to Google Sheet "${sheetName}"...`, rowData);
    await sleep(800);
    return { success: true, ...rowData };
};

const deleteSheetRow = async (sheetName: 'payments' | 'interventions', rowId: number): Promise<{success: boolean}> => {
    console.log(`Simulating delete row ${rowId} from Google Sheet "${sheetName}"...`);
    await sleep(500);
    return { success: true };
};

const updateSheetRow = async (sheetName: 'payments' | 'interventions', rowId: number, dataToUpdate: any): Promise<any> => {
    console.log(`Simulating update row ${rowId} in Google Sheet "${sheetName}"...`, dataToUpdate);
    await sleep(600);
    return { success: true };
};


export const googleApiService = {
    fetchCalendarEvents,
    saveCalendarEvent,
    deleteCalendarEvent,
    updateCalendarEventDate,
    fetchSheetData,
    saveSheetRow,
    deleteSheetRow,
    updateSheetRow,
};
