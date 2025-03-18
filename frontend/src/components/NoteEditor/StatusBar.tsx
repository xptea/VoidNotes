import React, { useState, useEffect } from 'react';
import { Note } from '../../contexts/NotesContext';

interface StatusBarProps {
  note: Note;
  wordCount: number;
  charCount: number;
  isSaving: boolean;
  appDataDir?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ wordCount, charCount, isSaving, appDataDir }) => {
  const [showSaved, setShowSaved] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // Handle saving animation
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (!isSaving && !showSaved) {
      setShowSaved(true);
      timer = setTimeout(() => {
        setShowSaved(false);
      }, 1500);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSaving]);
  
  return (
    <div className="absolute bottom-3 right-5 flex items-center gap-3 text-xs text-white/60">
      <div 
        className={`flex items-center ${isSaving || showSaved || isHovering ? 'px-2' : 'px-1'} py-1 transition-all duration-300 ease-out
          ${isSaving ? 'bg-white/10' : showSaved ? 'bg-green-600/20' : 'bg-white/10'} 
          backdrop-blur-md rounded-full cursor-help relative`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isSaving ? (
          <>
            <svg className="animate-spin h-3 w-3 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="whitespace-nowrap">Saving...</span>
          </>
        ) : showSaved || isHovering ? (
          <>
            <svg className="h-3 w-3 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {showSaved || isHovering ? <span className="whitespace-nowrap">Saved</span> : null}
          </>
        ) : (
          <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        
        {/* Storage location tooltip - positioned outside the parent element */}
        {isHovering && appDataDir && (
          <div className="fixed bottom-12 right-5 p-3 bg-black/80 backdrop-blur-md rounded-lg text-white/80 text-xs shadow-lg z-50 w-[300px] transition-opacity duration-300 ease-out">
            <div className="font-semibold mb-1">Notes are stored at:</div>
            <div className="text-white/80 break-all">{appDataDir}/notes</div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2">
          <span title="Word count">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24">
                <text x="4" y="18" fontFamily="Arial, sans-serif" fontSize="16" fill="currentColor">W</text>
            </svg>
          </span>
          <span>{wordCount}</span>
        </div>
        
        <div className="px-2 py-1 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2">
          <span title="Character count">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24">
              <text x="4" y="18" fontFamily="Arial, sans-serif" fontSize="16" fill="currentColor">C</text>
            </svg>
          </span>
          <span>{charCount}</span>
        </div>
      </div>
    </div>
  );
};