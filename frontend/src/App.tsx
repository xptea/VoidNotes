import './App.css';
import Layout from './components/Layout';
import { WindowProvider } from './contexts/WindowContext';
import { NotesProvider } from './contexts/NotesContext';
import { SettingsProvider } from './contexts/SettingsContext';

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
