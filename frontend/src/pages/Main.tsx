import { useWindow } from '../contexts/WindowContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import NoteEditor from '../components/NoteEditor.js';

interface MainContentProps {
    className?: string;
}

const MainContent: React.FC<MainContentProps> = ({ className }) => {
    const { isMac } = useWindow();
    const { getMainAreaStyle } = useSettings();
    
    return (
        <div
            className={`flex-1 flex flex-col ${className}`}
            style={{
                ...getMainAreaStyle(),
                borderTopRightRadius: isMac ? '10px' : '0',
                borderBottomRightRadius: '10px',
            }}
        >
            {isMac && (
                <div 
                    className="h-2"
                    style={{
                        "--wails-draggable": "drag",
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                    } as React.CSSProperties}
                />
            )}
            
            <div className="flex-1 overflow-hidden"
                style={{
                    "--wails-draggable": "no-drag",
                } as React.CSSProperties & { [key: string]: string }}>
                <NoteEditor />
            </div>
        </div>
    );
};

export default MainContent;
