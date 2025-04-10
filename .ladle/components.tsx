import React from 'react';
import type { GlobalProvider } from '@ladle/react';
import '../src/app/globals.css';

export const Provider: GlobalProvider = ({ children, globalState }) => {
  return (
    <div className={globalState.theme === 'dark' ? 'dark' : ''}>
      <div className="bg-background text-foreground min-h-screen p-4">
        {children}
      </div>
    </div>
  );
};
