export const requestDesktopNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
        console.warn("Este navegador no soporta notificaciones de escritorio.");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

export const sendDesktopNotification = (title: string, body: string, onClickRoute: string = "/") => {
    // 1. Mostrar toast visual (ya gestionado externamente o aquí)
    // 2. Reproducir sonido local
    try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.warn("Auto-play prevenido para el audio", e));
    } catch (e) {
        console.warn("Fallo al reproducir audio", e);
    }

    // 3. Notificación nativa emergente en SO (Windows, macOS)
    if ("Notification" in window && Notification.permission === "granted") {
        // En desktops modernos, esto lanzará el pequeño banner nativo abajo a la derecha (Windows) o arriba a la derecha (macOS)
        const notification = new Notification(title, {
            body,
            icon: '/icon-192x192.png', // Reemplaza con una ruta real de tu logo /public si hay
            requireInteraction: false, // true = se queda hasta que lo cierren (A veces estorba un poco, mejor false)
        });

        notification.onclick = (e) => {
            e.preventDefault(); // Previene que el navegador cambie de foco o ruta solo
            window.focus(); // Trae Chrome/Edge al frente minimizado!

            // Si se pasa una ruta, podríamos decirle al router que navegue. (Requiere integración extra con window.history o un event dispatcher)
            if (onClickRoute) {
                // Window.location causa refresh, mejor es lanzar un evento custom si tienes hash router
                // window.location.href = `/#${onClickRoute}` o similar, pero dejemos solo el Focus ahora para PWA single page:
            }

            notification.close();
        };
    }
};
