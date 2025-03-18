import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.js'
import './index.css'
import { NotesProvider } from './contexts/NotesContext.js'
import { SettingsProvider } from './contexts/SettingsContext.js'
import { WindowProvider } from './contexts/WindowContext.js'
import { useAutoUpdate } from './components/update/AutoUpdate.js'

const initAutoUpdate = () => {
  const { checkForUpdates } = useAutoUpdate();
  checkForUpdates();
  setInterval(checkForUpdates, 12 * 60 * 60 * 1000); 
};

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <WindowProvider>
      <SettingsProvider>
        <NotesProvider>
          <App />
        </NotesProvider>
      </SettingsProvider>
    </WindowProvider>
  </React.StrictMode>
);

initAutoUpdate();
