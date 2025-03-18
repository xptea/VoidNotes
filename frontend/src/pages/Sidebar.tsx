import { useState, useEffect, CSSProperties} from 'react';
import { useWindow } from '../contexts/WindowContext.js';
import { useNotes } from '../contexts/NotesContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import sidebarLeftIcon from '../assets/sidebar-left.svg';
import sidebarRightIcon from '../assets/sidebar-right.svg';
import InputModal from '../components/modals/MainModal.js';
import UpdateNotification from '../components/update/UpdateNotification.js';

export interface CustomCSSProperties extends CSSProperties {
  '--scrollbar-thumb-color'?: string;
  '--scrollbar-track-color'?: string;
}

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTags, setEditingTags] = useState('');
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [deleteNoteTitle, setDeleteNoteTitle] = useState<string>('');
  const { isMac } = useWindow();
  const { toggleSettings } = useSettings();
  const { 
    filteredNotes, 
    activeNoteId, 
    searchQuery, 
    setSearchQuery, 
    setActiveNoteId, 
    addNote, 
    deleteNote,
    updateNote,
    getActiveNote
  } = useNotes();
  const { getSidebarStyle, getScrollbarStyle } = useSettings();

  const formatDate = (date: Date): string => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const activeNote = getActiveNote();

  const startEditing = () => {
    if (!activeNote) return;
    setIsEditing(true);
    setEditingTitle(activeNote.title);
    setEditingTags(activeNote.tags?.join(', ') || '');
  };

  const saveEditing = () => {
    if (!activeNote) return;

    const tagsArray = editingTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const updatedNote = {
      ...activeNote,
      title: editingTitle,
      tags: tagsArray,
      updatedAt: new Date()
    };

    updateNote(updatedNote);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleDelete = (noteId: string, noteTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteNoteId(noteId);
    setDeleteNoteTitle(noteTitle);
  };

  const handleDeleteConfirm = (value: string) => {
    if (deleteNoteId && value.toLowerCase() === 'delete') {
      deleteNote(deleteNoteId);
      setDeleteNoteId(null);
      setDeleteNoteTitle('');
    }
  };

  useEffect(() => {
    setIsEditing(false);
  }, [activeNoteId]);

  const scrollbarStyle = getScrollbarStyle();
  const customScrollbarClass = "scrollbar-custom";

  return (
    <>
      <div
        className={`${
          collapsed ? 'w-16' : 'w-72'
        } transition-all duration-300 ease-in-out h-full flex flex-col text-white transform ${className}`}
        style={{ 
          "--wails-draggable": "no-drag", 
          borderTopLeftRadius: isMac ? '10px' : '0',
          borderBottomLeftRadius: '10px',
          paddingTop: isMac ? '28px' : '0',
          ...getSidebarStyle(),
        } as React.CSSProperties}
      >
        {isMac && (
          <div 
            className="absolute top-0 left-0 right-0 h-7" 
            style={{ "--wails-draggable": "drag" } as React.CSSProperties}
          />
        )}

        {!collapsed ? (
          <div className="p-2 border-b border-white/15">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-lg pl-2">
                {searchQuery ? `Search Results` : 'Notes'}
                {searchQuery && <span className="ml-2 text-sm font-normal opacity-70">({filteredNotes.length})</span>}
              </h2>
              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleSettings}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all duration-200"
                  title="Settings"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => setCollapsed(true)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all duration-200"
                  title="Collapse Sidebar"
                >
                  <img 
                    src={sidebarLeftIcon}
                    alt="Collapse Sidebar"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
                placeholder="Search notes..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-white/70 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-2 border-b border-white/15">
            <button
              onClick={toggleSettings}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-all duration-200"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => setCollapsed(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-all duration-200"
              title="Expand Sidebar"
            >
              <img 
                src={sidebarRightIcon}
                alt="Expand Sidebar"
                className="w-5 h-5"
              />
            </button>
          </div>
        )}

        {collapsed ? (
          <div 
            className={`flex-1 overflow-y-auto overflow-x-hidden py-2 ${customScrollbarClass}`}
            style={{ 
              "--scrollbar-thumb-color": scrollbarStyle["--scrollbar-thumb-color"],
              "--scrollbar-track-color": scrollbarStyle["--scrollbar-track-color"]
            } as CustomCSSProperties}
          >
            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                className={`px-4 py-2 cursor-pointer ${activeNoteId === note.id ? 'bg-white/20' : 'hover:bg-white/10'}`}
                onClick={() => setActiveNoteId(note.id)}
                title={note.title}
              >
                <div className="w-8 h-8 mx-auto bg-white/20 rounded-md flex items-center justify-center">
                  {note.title.charAt(0).toUpperCase()}
                </div>
              </div>
            ))}

            <div className="px-4 py-2 cursor-pointer hover:bg-white/10">
              <div 
                className="w-8 h-8 mx-auto bg-white/10 rounded-md flex items-center justify-center hover:bg-white/20"
                onClick={addNote}
                title="New Note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className={`flex-1 overflow-y-auto overflow-x-hidden p-2 ${customScrollbarClass}`}
            style={{ 
              "--scrollbar-thumb-color": scrollbarStyle["--scrollbar-thumb-color"],
              "--scrollbar-track-color": scrollbarStyle["--scrollbar-track-color"]
            } as CustomCSSProperties}
          >
            {isEditing && activeNote ? (
              <div className="mb-6 bg-white/10 rounded-lg p-3">
                <div className="mb-3">
                  <label className="block text-xs mb-1 text-white/70">Title</label>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full bg-white/15 border border-white/20 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/50"
                    placeholder="Note title"
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs mb-1 text-white/70">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editingTags}
                    onChange={(e) => setEditingTags(e.target.value)}
                    className="w-full bg-white/15 border border-white/20 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/50"
                    placeholder="tag1, tag2, tag3"
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={saveEditing}
                    className="flex-1 bg-white/20 hover:bg-white/30 rounded-md py-1 text-sm transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex-1 bg-white/10 hover:bg-white/20 rounded-md py-1 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
            
            {filteredNotes
              .filter(note => !isEditing || note.id !== activeNoteId)
              .map(note => (
              <div 
                key={note.id} 
                className={`mb-1 rounded-lg cursor-pointer border-l-4 group ${
                  activeNoteId === note.id 
                    ? 'bg-white/20 border-white' 
                    : 'hover:bg-white/10 border-transparent'
                }`}
              >
                <div 
                  className="p-2 flex justify-between items-start"
                  onClick={() => setActiveNoteId(note.id)}
                >
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-medium text-white truncate">{note.title}</h3>
                    <p className="text-xs text-white/60 mt-1">
                      {formatDate(note.updatedAt)}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 bg-white/10 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`flex space-x-1 ${activeNoteId === note.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                    {activeNoteId === note.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNoteId(note.id);
                          startEditing();
                        }}
                        className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white"
                        title="Edit Note"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(note.id, note.title, e)}
                      className="p-1 rounded-md hover:bg-white/20 text-white/80 hover:text-white"
                      title="Delete Note"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredNotes.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-white/60 px-4 text-center">
                {searchQuery ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No notes match your search.</p>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No notes yet.</p>
                    <button 
                      onClick={addNote}
                      className="mt-4 px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      Create your first note
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {!collapsed ? (
          <div className="border-t border-white/10 flex flex-col items-center justify-center">
            <div className="w-full px-4 pt-4 pb-2">
              <button
                onClick={addNote}
                className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Note</span>
              </button>
              

            </div>
            
            <div className="p-4 text-center w-full">
              <h3 className="text-xl font-bold tracking-wider">VoidWorks</h3>
              <UpdateNotification className="border-t border-white/10 " />
            </div>
          </div>
        ) : (
          <div className="py-4 border-t border-white/10 flex flex-col items-center justify-center">
            
            <div className="vertical-text text-sm font-bold tracking-wider text-white/80 mb-2">
              VoidWorks
            </div>
          </div>
        )}
      </div>
      
      <InputModal
        isOpen={deleteNoteId !== null}
        onClose={() => {
          setDeleteNoteId(null);
          setDeleteNoteTitle('');
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteNoteTitle}"`}
        placeholder="Type 'delete' to confirm"
        confirmText="Delete Note"
      />
    </>
  );
};

export default Sidebar;
