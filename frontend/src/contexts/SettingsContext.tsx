import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomCSSProperties } from '../types/styles';

interface AppSettings {
  sidebarColor: string;
  sidebarOpacity: number;
  mainAreaColor: string;
  mainAreaOpacity: number;
  headerColor: string;
  headerOpacity: number;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  getSidebarStyle: () => React.CSSProperties;
  getMainAreaStyle: () => React.CSSProperties;
  getHeaderStyle: () => React.CSSProperties;
  getScrollbarStyle: () => CustomCSSProperties;
}

const defaultSettings: AppSettings = {
  sidebarColor: "125, 50, 95",
  sidebarOpacity: 0.85,
  mainAreaColor: "125, 50, 95",
  mainAreaOpacity: 0.85,
  headerColor: "125, 50, 95",
  headerOpacity: 0.85,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isSettingsOpen: false,
  toggleSettings: () => {},
  getSidebarStyle: () => ({}),
  getMainAreaStyle: () => ({}),
  getHeaderStyle: () => ({}),
  getScrollbarStyle: () => ({} as CustomCSSProperties),
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem('voidnotes-settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('voidnotes-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleSettings = () => {
    setIsSettingsOpen(prev => !prev);
  };

  const getSidebarStyle = (): React.CSSProperties => {
    return {
      backgroundColor: `rgba(${settings.sidebarColor}, ${settings.sidebarOpacity})`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    };
  };

  const getMainAreaStyle = (): React.CSSProperties => {
    return {
      backgroundColor: `rgba(${settings.mainAreaColor}, ${settings.mainAreaOpacity})`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    };
  };

  const getHeaderStyle = (): React.CSSProperties => {
    return {
      backgroundColor: `rgba(${settings.headerColor}, ${settings.headerOpacity})`,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
    };
  };

  const darkenColor = (rgb: string, factor: number = 0.7): string => {
    const [r, g, b] = rgb.split(',').map(val => Math.floor(Number(val) * factor));
    return `${r}, ${g}, ${b}`;
  };

  const getScrollbarStyle = (): CustomCSSProperties => {
    const darkerColor = darkenColor(settings.sidebarColor, 0.6);
    
    return {
      '--scrollbar-thumb-color': `rgba(${darkerColor}, 0.8)`,
      '--scrollbar-track-color': 'transparent'
    };
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateSettings, 
        isSettingsOpen, 
        toggleSettings,
        getSidebarStyle,
        getMainAreaStyle,
        getHeaderStyle,
        getScrollbarStyle 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);