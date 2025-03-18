import React from 'react';
import { useSettings } from '../contexts/SettingsContext.js';

interface ColorOption {
  name: string;
  value: string;
}

const Settings: React.FC = () => {
  const { settings, updateSettings, isSettingsOpen, toggleSettings } = useSettings();

  const colorOptions: ColorOption[] = [
    { name: 'Purple', value: '125, 50, 95' },
    { name: 'Blue', value: '50, 80, 125' },
    { name: 'Green', value: '50, 125, 80' },
    { name: 'Dark', value: '20, 20, 30' },
    { name: 'Neutral', value: '60, 60, 75' }
  ];

  if (!isSettingsOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-md rounded-lg w-full max-w-md p-6 text-white shadow-lg border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button 
            onClick={toggleSettings}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Header Color (Windows only)</label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings({ headerColor: color.value })}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${
                    settings.headerColor === color.value 
                      ? 'border-white' 
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: `rgba(${color.value}, 1)` }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Header Opacity: {Math.round(settings.headerOpacity * 100)}%
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.headerOpacity * 100}
              onChange={(e) => updateSettings({ headerOpacity: parseInt(e.target.value) / 100 })}
              className="w-full bg-white/20 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sidebar Color</label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings({ sidebarColor: color.value })}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${
                    settings.sidebarColor === color.value 
                      ? 'border-white' 
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: `rgba(${color.value}, 1)` }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Sidebar Opacity: {Math.round(settings.sidebarOpacity * 100)}%
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.sidebarOpacity * 100}
              onChange={(e) => updateSettings({ sidebarOpacity: parseInt(e.target.value) / 100 })}
              className="w-full bg-white/20 rounded-lg appearance-none h-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Main Area Color</label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings({ mainAreaColor: color.value })}
                  className={`w-full h-10 rounded-lg border-2 transition-all ${
                    settings.mainAreaColor === color.value 
                      ? 'border-white' 
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: `rgba(${color.value}, 1)` }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Main Area Opacity: {Math.round(settings.mainAreaOpacity * 100)}%
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.mainAreaOpacity * 100}
              onChange={(e) => updateSettings({ mainAreaOpacity: parseInt(e.target.value) / 100 })}
              className="w-full bg-white/20 rounded-lg appearance-none h-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;