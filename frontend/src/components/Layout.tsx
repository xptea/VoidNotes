import Sidebar from '../pages/Sidebar';
import MainContent from '../pages/Main';
import Header from './Header';
import Settings from './Settings';
import { useEffect, useState } from 'react';
import { Environment } from '../../wailsjs/runtime/runtime';

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