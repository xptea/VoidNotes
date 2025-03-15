import Sidebar from '../pages/Sidebar';
import MainContent from '../pages/Main';
import Header from './Header';
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
    <div 
      className="flex flex-col h-screen overflow-hidden"
      style={{ 
        backgroundColor: 'transparent',
        borderRadius: isMac ? '10px' : '0',
        overflow: 'hidden',
        boxShadow: isMac ? '0 0 20x rgba(0, 0, 0, 0.2)' : 'none',
        "--wails-draggable": "no-drag",
      } as React.CSSProperties}
    >
      {!isMac && <Header title="VoidWorks" />}
      
      <div className="flex flex-1 w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children || <MainContent />}
        </div>
      </div>
    </div>
  );
};

export default Layout;