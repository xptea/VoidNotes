import './App.css';
import Layout from './components/Layout';
import Settings from './components/Settings';
import { WindowProvider } from './contexts/WindowContext';
import { NotesProvider } from './contexts/NotesContext';
import { SettingsProvider } from './contexts/SettingsContext';

function App() {
  return (
    <WindowProvider>
      <SettingsProvider>
        <NotesProvider>
          <div className="min-h-screen select-none bg-transparent">
            <Layout />
            <Settings />
          </div>
        </NotesProvider>
      </SettingsProvider>
    </WindowProvider>
  );
}

export default App;
