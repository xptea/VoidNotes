import React from 'react';
import { Note } from '../../contexts/NotesContext';

interface StatusBarProps {
  note: Note;
  wordCount: number;
  charCount: number;
  isSaving: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ note, wordCount, charCount, isSaving }) => {
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'Unknown';
    if (!(date instanceof Date)) date = new Date(date);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="absolute bottom-3 right-5 flex items-center gap-3 text-xs text-white/60">
      {isSaving && (
        <div className="flex items-center px-2 py-1 bg-white/10 backdrop-blur-md rounded-full">
          <svg className="animate-spin h-3 w-3 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
            <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </div>
      )}
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
      {/* <div className="group relative overflow-visible">
        <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full group-hover:rounded-lg group-hover:w-[250px] group-hover:h-auto overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right bg-white/10 backdrop-blur-md border border-white/10">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity delay-150 duration-200 p-3 pt-10">
            <div className="flex flex-col">
              <div className="flex justify-between items-center w-full">
                <span className="font-medium">Created:</span> 
                <span>{formatDate(note.createdAt)}</span>
              </div>
              <div className="h-px bg-white/10 my-2"></div>
              <div className="flex justify-between items-center w-full">
                <span className="font-medium">Modified:</span> 
                <span>{formatDate(note.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};