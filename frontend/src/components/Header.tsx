import { WindowMinimise, WindowToggleMaximise, Quit, EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';
import { useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

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
      className="h-10 flex items-center justify-between px-4 text-white"
      style={{ 
        "--wails-draggable": "drag",
        ...getHeaderStyle()
      } as React.CSSProperties}
    >
      <div className="font-semibold">{title}</div>
      <div className="flex space-x-4" style={{ "--wails-draggable": "no-drag" } as React.CSSProperties}>
        <button 
          onClick={handleMinimize}
          className="hover:bg-[rgba(125,50,95,0.6)] rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        
        <button 
          onClick={handleMaximize}
          className="hover:bg-[rgba(125,50,95,0.6)] rounded-full w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          {isMaximized ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h8v8H4V8z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4h8v8h-8V4z" />
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
