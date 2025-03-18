import './App.css';
import Layout from './components/Layout.js';
import { WindowProvider } from './contexts/WindowContext.js';
import { NotesProvider } from './contexts/NotesContext.js';
import { SettingsProvider } from './contexts/SettingsContext.js';

function App() {
  return (
    <div className="app" style={{ 
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      WebkitBoxShadow: 'none'
    }}>
      <WindowProvider>
        <SettingsProvider>
          <NotesProvider>
            <Layout />
          </NotesProvider>
        </SettingsProvider>
      </WindowProvider>
    </div>
  );
}

export default App;
