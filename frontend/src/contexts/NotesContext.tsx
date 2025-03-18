import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LoadNotes, SaveNote, DeleteNote } from '../../wailsjs/go/main/App.js';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

interface NotesContextType {
  notes: Note[];
  filteredNotes: Note[];
  activeNoteId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveNoteId: (id: string | null) => void;
  addNote: () => void;
  updateNote: (note: Note) => Promise<boolean>;
  deleteNote: (id: string) => void;
  getActiveNote: () => Note | null;
  isLoading: boolean;
  saveStatus: {
    isSaving: boolean;
    lastSavedId: string | null;
    error: string | null;
  };
}

const NotesContext = createContext<NotesContextType>({
  notes: [],
  filteredNotes: [],
  activeNoteId: null,
  searchQuery: '',
  setSearchQuery: () => {},
  setActiveNoteId: () => {},
  addNote: () => {},
  updateNote: async () => false,
  deleteNote: () => {},
  getActiveNote: () => null,
  isLoading: false,
  saveStatus: {
    isSaving: false,
    lastSavedId: null,
    error: null
  }
});

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to VoidNotes',
    content: '<p>Welcome to VoidNotes! Get started by creating your first note.</p>',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['welcome', 'info']
  }
];

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState({
    isSaving: false,
    lastSavedId: null as string | null,
    error: null as string | null
  });

  const saveQueue = useRef<Map<string, Note>>(new Map());
  const isSaving = useRef(false);
  const saveRetryTimerRef = useRef<number | null>(null);

  const processSaveQueue = async () => {
    if (isSaving.current || saveQueue.current.size === 0) return;
    
    isSaving.current = true;
    
    try {
      const [id, noteToSave] = Array.from(saveQueue.current.entries())[0];
      
      setSaveStatus({
        isSaving: true,
        lastSavedId: id,
        error: null
      });
      
      console.log(`Processing save for note ${id} - Title: ${noteToSave.title}, Content length: ${noteToSave.content.length}`);
      
      const preparedNote = {
        ...noteToSave,
        createdAt: noteToSave.createdAt.toISOString(),
        updatedAt: noteToSave.updatedAt.toISOString()
      };
      
      const contentPreview = noteToSave.content.length > 100 
        ? `${noteToSave.content.substring(0, 100)}...` 
        : noteToSave.content;
      console.log(`Note ${id} content preview: ${contentPreview}`);
      
      await SaveNote(JSON.stringify(preparedNote));
      
      try {
        const notesData = await LoadNotes();
        const parsedNotes = JSON.parse(notesData);
        const savedNote = parsedNotes.find((note: any) => note.id === id);
        
        if (!savedNote) {
          console.error(`Verification failed: Note ${id} not found after save`);
          throw new Error('Note was not found after saving');
        }
        
        if (savedNote.content.length !== noteToSave.content.length) {
          console.error(`Verification failed: Content length mismatch, expected ${noteToSave.content.length}, got ${savedNote.content.length}`);
          throw new Error('Note content length mismatch after saving');
        }
        
        console.log(`Verified note ${id} was saved correctly`);
      } catch (verifyErr) {
        console.error('Verification error:', verifyErr);
      }
      
      saveQueue.current.delete(id);
      
      console.log(`Note ${id} saved successfully!`);
      
      setSaveStatus({
        isSaving: false,
        lastSavedId: id,
        error: null
      });
    } catch (error) {
      console.error('Failed to save note:', error);
      
      const failedEntry = Array.from(saveQueue.current.entries())[0];
      if (failedEntry) {
        const [id] = failedEntry;
        
        setSaveStatus({
          isSaving: false,
          lastSavedId: null,
          error: `Failed to save note ${id}: ${String(error)}`
        });
        
        console.log(`Will retry saving note ${id} in 2 seconds...`);
        
        if (saveRetryTimerRef.current) {
          window.clearTimeout(saveRetryTimerRef.current);
        }
        
        saveRetryTimerRef.current = window.setTimeout(() => {
          isSaving.current = false;
          processSaveQueue();
        }, 2000);
      }
    } finally {
      if (!saveRetryTimerRef.current) {
        isSaving.current = false;
      }
      
      if (saveQueue.current.size > 0 && !saveRetryTimerRef.current) {
        setTimeout(processSaveQueue, 100);
      }
    }
  };

  const queueSave = (note: Note): void => {
    console.log(`Queuing save for note ${note.id} - Title: ${note.title}`);
    saveQueue.current.set(note.id, note);
    processSaveQueue();
  };

  useEffect(() => {
    const loadNotesFromFilesystem = async () => {
      try {
        setIsLoading(true);
        console.log("Loading notes from filesystem...");
        
        const notesData = await LoadNotes();
        console.log(`Loaded notes data, length: ${notesData?.length || 0}`);
        
        if (notesData) {
          try {
            const parsedNotes = JSON.parse(notesData);
            if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
              console.log(`Parsed ${parsedNotes.length} notes`);
              
              const formattedNotes = parsedNotes.map((note: any) => ({
                ...note,
                createdAt: new Date(note.createdAt),
                updatedAt: new Date(note.updatedAt)
              }));
              
              for (const note of formattedNotes) {
                console.log(`Loaded note: ${note.id} - ${note.title}, Content length: ${note.content.length}`);
              }
              
              setNotes(formattedNotes);
              
              if (formattedNotes.length > 0 && !activeNoteId) {
                setActiveNoteId(formattedNotes[0].id);
              }
              
              setIsLoading(false);
              return;
            } else {
              console.log("No notes found or empty array returned");
            }
          } catch (parseError) {
            console.error('Failed to parse notes:', parseError);
          }
        } else {
          console.log("No notes data returned");
        }
        
        console.log("Creating initial welcome note");
        setNotes(initialNotes);
        
        const welcomeNote = {
          ...initialNotes[0],
          createdAt: initialNotes[0].createdAt.toISOString(),
          updatedAt: initialNotes[0].updatedAt.toISOString()
        };
        
        await SaveNote(JSON.stringify(welcomeNote));
        console.log("Welcome note saved");
        
        setActiveNoteId(initialNotes[0].id);
      } catch (error) {
        console.error('Failed to load notes from filesystem', error);
        setNotes(initialNotes);
        setActiveNoteId(initialNotes[0].id);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadNotesFromFilesystem();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (saveQueue.current.size > 0) {
        console.log(`${saveQueue.current.size} notes pending save on unload, saving synchronously...`);
        e.preventDefault();
        e.returnValue = '';
        
        for (const [id, note] of saveQueue.current.entries()) {
          try {
            const preparedNote = {
              ...note,
              createdAt: note.createdAt.toISOString(),
              updatedAt: note.updatedAt.toISOString()
            };
            
            await SaveNote(JSON.stringify(preparedNote));
            console.log(`Note ${id} saved during unload!`);
          } catch (error) {
            console.error(`Failed to save note ${id} during unload:`, error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      console.log(`No active note, selecting first note: ${notes[0].id}`);
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  const filteredNotes = notes.filter(note => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(query);
    const contentMatch = note.content.toLowerCase().includes(query);
    const tagsMatch = note.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
    
    return titleMatch || contentMatch || tagsMatch;
  });

  const addNote = async () => {
    try {
      const newNote: Note = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log(`Creating new note: ${newNote.id}`);
      
      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote.id);
      
      queueSave(newNote);
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  const updateNote = async (updatedNote: Note): Promise<boolean> => {
    try {
      console.log(`Updating note: ${updatedNote.id} - ${updatedNote.title}`);
      
      const originalNote = notes.find(note => note.id === updatedNote.id);
      if (!originalNote) {
        console.error(`Cannot update note ${updatedNote.id}: Note not found`);
        return false;
      }

      const noteToUpdate = {
        ...originalNote,
        ...updatedNote,
        updatedAt: new Date(),
        createdAt: originalNote.createdAt
      };
      
      setNotes(notes.map(note => 
        note.id === noteToUpdate.id ? noteToUpdate : note
      ));
      
      queueSave(noteToUpdate);
      return true;
    } catch (error) {
      console.error('Failed to update note', error);
      return false;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      console.log(`Deleting note: ${id}`);
      
      await DeleteNote(id);
      console.log(`Note ${id} deleted from filesystem`);
      
      setNotes(notes.filter(note => note.id !== id));
      
      if (saveQueue.current.has(id)) {
        console.log(`Removing note ${id} from save queue`);
        saveQueue.current.delete(id);
      }
      
      if (activeNoteId === id) {
        const nextNote = notes.length > 1 ? notes.find(note => note.id !== id)?.id || null : null;
        console.log(`Deleted active note, selecting next note: ${nextNote}`);
        setActiveNoteId(nextNote);
      }
    } catch (error) {
      console.error(`Failed to delete note ${id}:`, error);
    }
  };

  const getActiveNote = () => {
    return notes.find(note => note.id === activeNoteId) || null;
  };

  return (
    <NotesContext.Provider 
      value={{ 
        notes, 
        filteredNotes,
        activeNoteId, 
        searchQuery,
        setSearchQuery,
        setActiveNoteId, 
        addNote, 
        updateNote, 
        deleteNote,
        getActiveNote,
        isLoading,
        saveStatus
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
