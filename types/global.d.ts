import * as React from 'react';

declare global {
  const toast: {
    (message: string | React.ReactNode, data?: any): void;
    success(message: string | React.ReactNode, data?: any): void;
    error(message: string | React.ReactNode, data?: any): void;
    info(message: string | React.ReactNode, data?: any): void;
    warning(message: string | React.ReactNode, data?: any): void;
  };

  const Toaster: React.ComponentType<any>;

  interface Window {
    gapi: any;
    google: any;
    onGapiLoad: () => void;
  }
}

export {};
