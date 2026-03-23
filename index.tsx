
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Importamos el registro del PWA
import { registerSW } from 'virtual:pwa-register';

// Registramos el service worker para actualizaciones automáticas
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nueva versión disponible. ¿Deseas recargar la aplicación?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App lista para uso offline');
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
