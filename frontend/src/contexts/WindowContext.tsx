import React, { createContext, useContext, useEffect, useState } from 'react';
import { Environment } from '../../wailsjs/runtime/runtime';

interface WindowContextType {
  isMac: boolean;
  isWindows: boolean;
}

const WindowContext = createContext<WindowContextType>({
  isMac: false,
  isWindows: true,
});

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMac, setIsMac] = useState(false);
  const [isWindows, setIsWindows] = useState(true);

  useEffect(() => {
    Environment().then((env) => {
      const mac = env.platform === 'darwin';
      const windows = env.platform === 'windows';
      setIsMac(mac);
      setIsWindows(windows);
    }).catch(err => {
      console.error('Failed to detect environment:', err);
    });
  }, []);

  return (
    <WindowContext.Provider value={{ isMac, isWindows }}>
      {isMac && (
        <div 
          className="h-7 w-full absolute top-0 left-0 z-50" 
          style={{ "--wails-draggable": "drag" } as React.CSSProperties}
        />
      )}
      {children}
    </WindowContext.Provider>
  );
};

export const useWindow = () => useContext(WindowContext);