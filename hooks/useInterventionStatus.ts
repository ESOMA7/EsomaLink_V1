import React from 'react';
interface Intervention {
    estado: string;
    // Add other necessary properties based on usage
}
import { AlertTriangle, CheckCircle } from 'lucide-react';
// Define intervention status constants
export const INTERVENTION_STATUS = {
    PENDIENTE: 'PENDIENTE',
    EN_PROCESO: 'EN_PROCESO'
} as const;

// Define intervention text constants
export const INTERVENTION_TEXTS = {
    PENDING_TITLE: 'Pending Interventions',
    IN_PROCESS_TITLE: 'Interventions in Process',
    UP_TO_DATE_TITLE: 'Up to Date',
    ACTIVE_FOLLOW_UP_SUBTITLE: 'Active follow-up cases',
    NO_URGENT_CASES_SUBTITLE: 'No urgent cases',
    IN_PROCESS_SUBTITLE: (count: number) => `${count} cases in process`
} as const;

export const useInterventionStatus = (interventions: Intervention[]) => {
    const pendingCount = interventions.filter(i => i.estado === INTERVENTION_STATUS.PENDIENTE).length;
    const inProcessCount = interventions.filter(i => i.estado === INTERVENTION_STATUS.EN_PROCESO).length;

    let interventionsIcon: React.ComponentType<any>;
    let interventionsTitle: string;
    let interventionsValue: string;
    let interventionsColor: 'red' | 'yellow' | 'green';
    let interventionsSubtitle: string;

    if (pendingCount > 0) {
        interventionsIcon = AlertTriangle;
        interventionsTitle = INTERVENTION_TEXTS.PENDING_TITLE;
        interventionsValue = pendingCount.toString();
        interventionsColor = 'red';
        interventionsSubtitle = INTERVENTION_TEXTS.IN_PROCESS_SUBTITLE(inProcessCount);
    } else if (inProcessCount > 0) {
        interventionsIcon = AlertTriangle;
        interventionsTitle = INTERVENTION_TEXTS.IN_PROCESS_TITLE;
        interventionsValue = inProcessCount.toString();
        interventionsColor = 'yellow';
        interventionsSubtitle = INTERVENTION_TEXTS.ACTIVE_FOLLOW_UP_SUBTITLE;
    } else {
        interventionsIcon = CheckCircle;
        interventionsTitle = INTERVENTION_TEXTS.UP_TO_DATE_TITLE;
        interventionsValue = "0";
        interventionsColor = 'green';
        interventionsSubtitle = INTERVENTION_TEXTS.NO_URGENT_CASES_SUBTITLE;
    }

    return {
        interventionsIcon,
        interventionsTitle,
        interventionsValue,
        interventionsColor,
        interventionsSubtitle
    };
};