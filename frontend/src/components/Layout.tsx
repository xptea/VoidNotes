import Sidebar from '../pages/Sidebar.js';
import MainContent from '../pages/Main.js';
import Header from './Header.js';
import Settings from './Settings.js';
import { useEffect, useState } from 'react';
import { Environment } from '../../wailsjs/runtime/runtime.js';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMac, setIsMac] = useState(false);
  
  useEffect(() => {
    Environment().then((env) => {
      setIsMac(env.platform === 'darwin');
    });
  }, []);

  return (
    <div className="h-screen flex flex-col" style={{ background: 'transparent' }}>
      {!isMac && <Header title="VoidWorks" />}
      <div className="flex-1 flex overflow-hidden" style={{ background: 'transparent' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'transparent' }}>
          {children || <MainContent />}
        </div>
      </div>
      <Settings />
    </div>
  );
};

export default Layout;