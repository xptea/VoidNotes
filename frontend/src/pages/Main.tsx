import { useWindow } from '../contexts/WindowContext';
import { useSettings } from '../contexts/SettingsContext';
import NoteEditor from '../components/NoteEditor';

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
                borderBottomRightRadius: isMac ? '10px' : '0',
                "--wails-draggable": "no-drag",
            } as React.CSSProperties}
        >
            <div 
                className="h-2"
                style={{
                    "--wails-draggable": "drag",
                } as React.CSSProperties}
            >
            </div>
            
            <div className="flex-1 overflow-hidden"
                style={{
                    "--wails-draggable": "no-drag",
                } as React.CSSProperties}>
                <NoteEditor />
            </div>
        </div>
    );
};

export default MainContent;
