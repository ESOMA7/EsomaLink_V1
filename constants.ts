
import { AppointmentEvent, Intervention, Payment, Note } from './types';

export const APP_LOGO_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAd8SURBVHhe7ZxrbBxlHce/jtnZ3e1aW2vb9hImtQcSmhY0iXkQ2pAmNW0aTyAIpUeKEHhS0/SgUUpDoSmQeFAoBRpoqFpCoRZKIVQqECmQQuGhbQ8EglSCJtImITG2sS9t7Nu1r+2ud+/OzP6xz/5md9fOzh5a6g/zZGd3Z2fn+f3O/81/ZgLgR2QyqR1vH75+9M7JvXv/9vXf1/237+bTz+c3L363/ZfX/b/rL23D+8z3f75x9/7D9+4+k802G09++qE20s8/+/lXgO/a22cAvA3A2wA8c/++1Pz5j9/vP315/p03r5++dP70B998+8LpX375+5O37j3+6Xfbp5794k0fH/z9h5+/+/7P77z41u0H7/758v1rZ++9ff7h23efun3r2QcffbJ54+kHHz4E8A37n37y2TfffgXgG08++ugTf3jwnRdfAvAmAD8AeOLA77/9/JvvPvv8i68BeOPJRx/95P37D1959bXX337j/vsfvnP34TtffvvNN9+8cvX+ve/eevnFlwA8DUB/095/+/Yv37/+9v2v3n3wzsV33333wTt3Hx384cEHd+8/dPvum+8/cP/+A++++faFN8/9/V8uXPr4+ZevPfnk4w/ffLNZd/H5l1/evvn080++AeANAH7u5p27f/n2/fuvvfn6K2/efvDO7/eef/b1t95+84UXX3gBwLfefPPNd9/84x9+uHTpwr9+/fI/fvn693eefvLxh+9+9Obrrz19+85Pfv+Hjz/++OKpRx9//KFHn3zk4w8++uhjjx5/+NEjH3/y8YcefeLxxx/5h9/849NPP/j3D3/4vYce/vOff/rxp//655/++Yce/uv//PzP/3r80Y8+8uSTjz755OMPPPLoY08/+uhjjx7++OOPPPLoI4/+/eGHn3j8kUceeeTRRx5/9MEHH3/4oYceePzRh//+4Yfff//Rx5949JFHHz/y6OMPP/Lojz/y5OPPffTRRx95+KFHHz/80OOPPPzwYw8/+shDDx/98EMP/uMPv/nwYw8+8uihRx55+NHDDx/++IMPPvLwwx//+EMPP/jgww8/9PCDj3/y+CNPfvzxH/7+4//xxz/+6fHHP/704x/++fFHf/7xZ3/+6Mf/+uP/fPxZAP7l23//4Ycff/j+Rx9/8rFHn3zy0Uce/fijj/718Ucf/f2jj/7l0QfffvwRxJt3P3nrzdcAvPf2m9//+w8++eRTTz3x5BNPfvzx5z/29OMfP/7p5x/+9fHHP/5z1t/v/u1/v/kLAA+N3gB44dUnn3z++beuvPbqG1ffef2N114/98VXXgHwwqtv/Plf/+7Lz/31n5++evXp/b8DwL5773322Wdf/tWrb1557dV/e+uNN19/7bVXgH//66++8voryAIAv/jCS0+e/vLFl5/+8suvPv3lAHDx5ZdffuXrL7146eXnnn/+7fNfe/PqN1976/Xnr77y8muvPfvmG29dfuV//vLLPz//8suvPf/8m+9++eW//PX5N9549fVX3njz9dd++9WnXnr11aeffvnlV14++8WXnnz6pbdef/GFF688+9abn3/pzZdfef7Fl//yrz335htPfvHFZz/75Jt//eLp//zL17/+3Tfff//Ff/r6P/+99a+vfv7Ft17/2lsvvf7qG1df/fqrr7/z1usvPfP6V7+x5pXnXr/x3BvPPfX8G98+9cIzf/raF84+/YyLLz/z4ovPPPHEw3/8z39e+8zPfvSjf/z5Pz39tIsvP/v6Cy89c/7pV1965u3nX//qa6+f+8Izr7/wzBvPf+WFN9544w0AXnjh9Veee//t1z/1zLNPv/jUcy++9vrbZ19969W3Xn/tjddff/01ABdeeO21VwH8/OtvPf/qK688+9arr7/6+iu//dqrT7306qtPP/3yqy89++aLzz3/5pvfff/lX//nq8+98dxrzz336qvPvP7Ka2++8obr/+3rX/76V3/+6188/9obz37hldf/5fVnXn/9lbdeeP2V/3n9mbe/9tbrL73+8jO/+/Irb7/00qtPvvz8v3/5jdd/+9VX/v2rr772+mvPfOWNN3/5628/9/pbTz73xjOvf/7Nd1585c2vPvPmq089+cwr//Tqa2+9+sqrn3nr1bff+NWrb73w0isvf+7VV97631/81z9//dU3nn/5tTffePbNN15+4/VXv/j6Sy+9/MpXn3j+zTdfeP3NN15/4Y03n3jtdbf+/uY3n/vCa2+9/uLrbz71/Js/+fSrT7z4wv/611deeObpt1/8wpu/+dKb33ztlVceeOGV1//trc9//TWvv/z6Ky+/8uKz33j2+ec+f/LJx//68IOf//WjDz/4v/7hA3//7w8/fuSTv/zkIx9++OGPf/TR/v2P7t9/9u4Hb939xOMffv7Zf/zTRx/v/v13//b++3/5L9/d+9+//93P/v2jj/cf/ec//+B/HHz04ce/+8lHHzz44IP/8cEH9+/+/Qc/u/+DRx55+P9e+fij/y88/tBDDz74/37wwYMffvzxR59+9LGHHn7w4YcefvzBxx//5JGP/+sjH/vYx5/5wQceeejRxz/0sY8e/v8vPPjgo3/4ww/3H9z/+P57/fijf/zhh/uPPvjgQ488/u+HHnr4oYcee/SRRx79+P1Pfv+hB+8A/N4/vv+Rx/s/2v/AwYce/egjjz7x8IM//+iDD/cfffDRh+///xef33u0/5EHHz/yqYceePT/n3zkYx//+EM//+Tjx5958MH//c+//n8+/shjHz/y0Me+/umPf/zxh5/v//hDH/jwhx558qH/fPzxhz/+yEMf/fSTP/7wYw//51/54EMPvfjig7+/9/b99/7hD/+49+D993uPPn3n4z/+/Y8fevzxP/z/3998/P+8f+D9e49/+89//qGHf/zx//77D/77Hx9//KGHf/zxRz76yEMf+/STj/zywQce/vRDH/nUww//6Ycee+xDH3/yox//yEcffvTRD3/84YcffuyxD/300wef+s9/+lM//fRTn3nkE3/+p5995BNPfvzxD3/00cf/+p/999c/+ck/fuSDDx584LFPfP7xTz/1xFN//pMPPv/YIx9/9OEffuThx//+wQceeeTRRx5/9MEHH3/4oYceePzRh//6ww8//uCj/3zw4Y/+44MPP/zQww8/8uCDjzz08Ecffezxxz/99COPv/fxxz/59NNf/9s/+/vXnn3h+TdfevXn3/j5V197/e0X3nzt9bdevPXqawDuvPbGS2+89tZzb7/+8msAvPjyay+/+eobT/7mN195+dWnn3ntrVfe/+JrL7z68qs//9pbr3/2tTc+/8Zrr732+v/81f964ek3n3z2tVeef+2tl154/dkn3nvt2aff/eIz333x9GtvPvfmm28+/crLTz3/6mvPff/Ff/ra02++ef6tVx79/FNvvfnyyy8/+crn3/n+1Vd/+8abL7/8+qtPfum1f3v9rdfefPnNpx/+4o/++K8f/f93n3r44Y8//uhDH/v4x556/sPffvyRh/7xwQdvf/Lu/3/z7v/9xw9/8Pj+Rx9/9LGHf/zQRz7yyCeefPLZh5/+88EH//g//e+f/ffP/ucf//DHPvrQp376yUeefOKph5966vGHHz3+8NN/+/mHHnnkYx995BN//sc/e/SRR//hHzz4wCNffPLZ55959NEHHn704YcfeeQRf4/F6+C433eWbQAAAABJRU5ErkJggg==';

export const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAZGF0YQQAAAAAAEA=';

export const initialEvents: AppointmentEvent[] = [
    {
        id: 1,
        title: 'Limpieza Facial - Elena Navarro',
        start: new Date(2025, 6, 2, 9, 0, 0),
        end: new Date(2025, 6, 2, 10, 30, 0),
        professional: 'Loreta Cujia',
        patient: 'Elena Navarro',
        procedure: 'Limpieza Facial Profunda',
    },
    {
        id: 2,
        title: 'Valoración Botox - Carlos Rojas',
        start: new Date(2025, 6, 2, 11, 0, 0),
        end: new Date(2025, 6, 2, 12, 0, 0),
        professional: 'Malka Gámez',
        patient: 'Carlos Rojas',
        procedure: 'Valoración - Botox',
    },
    {
        id: 3,
        title: 'Masaje Reductor - Sofía Castro',
        start: new Date(2025, 6, 3, 15, 0, 0),
        end: new Date(2025, 6, 3, 16, 0, 0),
        professional: 'Jose Ricardo',
        patient: 'Sofía Castro',
        procedure: 'Masaje Reductor',
    },
];

export const initialInterventions: Intervention[] = [
    {
        id: 1,
        patient: 'Ana Gómez',
        phone: '300 123 4567',
        reason: 'Reacción alérgica a producto facial.',
        date: '2025-07-01',
        status: 'Pendiente',
    },
    {
        id: 2,
        patient: 'Luis Parra',
        phone: '310 987 6543',
        reason: 'Dudas sobre el post-operatorio de un peeling químico.',
        date: '2025-06-30',
        status: 'En Proceso',
    },
    {
        id: 3,
        patient: 'Carolina Sanz',
        phone: '321 555 8899',
        reason: 'Solicitud de información sobre paquetes de masajes reductores.',
        date: '2025-06-28',
        status: 'Resuelto',
    },
];

export const initialPayments: Payment[] = [
    {
        id: 'TXN741852',
        patient: 'Elena Navarro',
        whatsapp: '311 222 3344',
        para: 'Limpieza Facial',
        amount: 150000,
        bank: 'Bancolombia',
        date: '2025-07-02',
    },
    {
        id: 'TXN951753',
        patient: 'Carlos Rojas',
        whatsapp: '312 333 4455',
        para: 'Abono Botox',
        amount: 300000,
        bank: 'Davivienda',
        date: '2025-07-01',
    },
    {
        id: 'TXN357159',
        patient: 'Sofía Castro',
        whatsapp: '313 444 5566',
        para: 'Masaje Reductor',
        amount: 180000,
        bank: 'Nequi',
        date: '2025-06-30',
    },
];

export const initialNotes: Note[] = [
    {
        id: 1,
        title: 'Ideas para Campaña de Verano',
        content: 'Lanzar promoción 2x1 en limpiezas faciales. Enfocarse en "prepara tu piel para el sol".\n\nContactar a la influencer "BeautyByAna" para una colaboración. Presupuesto: $500.000 COP.\n\nAgendar cita de control para Carlos Rojas la próxima semana para su seguimiento de Botox.',
        updatedAt: new Date(2025, 6, 1, 14, 30, 0).toISOString(),
    },
    {
        id: 2,
        title: 'Feedback Paciente: Sofía Castro',
        content: 'Sofía Castro llamó hoy. Muy contenta con el masaje reductor. Preguntó si podía agendar una nueva cita para su amiga, Laura Méndez, para el mismo procedimiento. Sugerí que Laura nos llame directamente.',
        updatedAt: new Date(2025, 6, 2, 10, 0, 0).toISOString(),
    },
    {
        id: 3,
        title: 'Mantenimiento de Equipo Láser',
        content: 'El equipo láser Harmony XL Pro necesita revisión técnica. La última fue hace 6 meses. Hay que llamar al proveedor para agendar mantenimiento preventivo antes de fin de mes.',
        updatedAt: new Date(2025, 5, 28, 16, 0, 0).toISOString(),
    }
];

export const getEventColor = (professional: string): string => {
    switch (professional) {
        case 'Malka Gámez':
            return 'bg-pink-500 border-pink-700';
        case 'Loreta Cujia':
            return 'bg-blue-500 border-blue-700';
        case 'Jose Ricardo':
            return 'bg-teal-500 border-teal-700';
        default:
            return 'bg-slate-500 border-slate-700';
    }
};