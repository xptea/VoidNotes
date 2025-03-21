import { WindowMinimise, WindowToggleMaximise, Quit, EventsOn, EventsOff } from '../../wailsjs/runtime/runtime.js';
import { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext.js';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "VoidWorks" }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const { getHeaderStyle } = useSettings();
  
  useEffect(() => {
    const unsubscribeMaximize = EventsOn('wails:window-maximised', () => {
      setIsMaximized(true);
    });
    
    const unsubscribeRestore = EventsOn('wails:window-normal', () => {
      setIsMaximized(false);
    });

    return () => {
      unsubscribeMaximize();
      unsubscribeRestore();
      EventsOff('wails:window-maximised');
      EventsOff('wails:window-normal');
    };
  }, []);

  const handleMinimize = () => {
    WindowMinimise();
  };

  const handleMaximize = () => {
    WindowToggleMaximise();
  };

  const handleClose = () => {
    Quit();
  };

  return (
    <div 
      onDoubleClick={handleMaximize}
      className="h-8 flex items-center justify-between px-4 text-white bg-[rgba(0,0,0,0.2)]"
      style={{ 
        "--wails-draggable": "drag",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        ...getHeaderStyle()
      } as React.CSSProperties}
    >
      <div className="font-semibold">{title}</div>
      <div className="flex space-x-4" style={{ "--wails-draggable": "no-drag" } as React.CSSProperties}>
        <button 
          onClick={handleMinimize}
          className="hover:bg-[rgba(125,50,95,0.6)] rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        
        <button 
          onClick={handleMaximize}
          className="hover:bg-[rgba(125,50,95,0.6)] rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          {isMaximized ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-0.1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
            </svg>
          )}
        </button>
        
        <button 
          onClick={handleClose}
          className="hover:bg-red-500 rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;