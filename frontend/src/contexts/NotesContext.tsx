import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LoadNotes, SaveNote, DeleteNote } from '../../wailsjs/go/main/App';

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
  
  // Queue for saving notes to prevent race conditions
  const saveQueue = useRef<Map<string, Note>>(new Map());
  const isSaving = useRef(false);
  const saveRetryTimerRef = useRef<number | null>(null);

  // Process the save queue
  const processSaveQueue = async () => {
    if (isSaving.current || saveQueue.current.size === 0) return;
    
    isSaving.current = true;
    
    try {
      // Get the first note in the queue
      const [id, noteToSave] = Array.from(saveQueue.current.entries())[0];
      
      setSaveStatus({
        isSaving: true,
        lastSavedId: id,
        error: null
      });
      
      console.log(`Processing save for note ${id} - Title: ${noteToSave.title}, Content length: ${noteToSave.content.length}`);
      
      // Prepare note for saving (convert dates to ISO strings)
      const preparedNote = {
        ...noteToSave,
        createdAt: noteToSave.createdAt.toISOString(),
        updatedAt: noteToSave.updatedAt.toISOString()
      };
      
      // For debugging, log the first 100 chars of content
      const contentPreview = noteToSave.content.length > 100 
        ? `${noteToSave.content.substring(0, 100)}...` 
        : noteToSave.content;
      console.log(`Note ${id} content preview: ${contentPreview}`);
      
      // Save note to filesystem
      await SaveNote(JSON.stringify(preparedNote));
      
      // Double-check that saving worked by loading notes back
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
        // If verification fails but no error was thrown from SaveNote, we still remove from queue
        // as not to get stuck in an endless loop
      }
      
      // Remove from queue after successful save
      saveQueue.current.delete(id);
      
      console.log(`Note ${id} saved successfully!`);
      
      setSaveStatus({
        isSaving: false,
        lastSavedId: id,
        error: null
      });
    } catch (error) {
      console.error('Failed to save note:', error);
      
      // Get the failed note
      const failedEntry = Array.from(saveQueue.current.entries())[0];
      if (failedEntry) {
        const [id] = failedEntry;
        
        setSaveStatus({
          isSaving: false,
          lastSavedId: null,
          error: `Failed to save note ${id}: ${String(error)}`
        });
        
        // Keep the note in the queue for retry
        console.log(`Will retry saving note ${id} in 2 seconds...`);
        
        // Set a timer to retry
        if (saveRetryTimerRef.current) {
          window.clearTimeout(saveRetryTimerRef.current);
        }
        
        saveRetryTimerRef.current = window.setTimeout(() => {
          isSaving.current = false;
          processSaveQueue();
        }, 2000);
      }
    } finally {
      // Only clear the saving flag if we're not going to retry
      if (!saveRetryTimerRef.current) {
        isSaving.current = false;
      }
      
      // If there are more notes to save, continue processing
      if (saveQueue.current.size > 0 && !saveRetryTimerRef.current) {
        setTimeout(processSaveQueue, 100);
      }
    }
  };

  // Add a note to the save queue
  const queueSave = (note: Note): void => {
    console.log(`Queuing save for note ${note.id} - Title: ${note.title}`);
    saveQueue.current.set(note.id, note);
    processSaveQueue();
  };

  // Load notes from the filesystem when the component mounts
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
        
        // If we get here, either no notes were found or parsing failed
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

  // Save pending notes before window unload
  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (saveQueue.current.size > 0) {
        console.log(`${saveQueue.current.size} notes pending save on unload, saving synchronously...`);
        e.preventDefault();
        e.returnValue = '';
        
        // Force synchronous saves for all pending notes
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

  // Set active note ID if none is selected and notes are available
  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
      console.log(`No active note, selecting first note: ${notes[0].id}`);
      setActiveNoteId(notes[0].id);
    }
  }, [notes, activeNoteId]);

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(query);
    const contentMatch = note.content.toLowerCase().includes(query);
    const tagsMatch = note.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
    
    return titleMatch || contentMatch || tagsMatch;
  });

  // Add a new note
  const addNote = async () => {
    try {
      const newNote: Note = {
        id: Date.now().toString(),
        title: 'Untitled Note',
        content: '<p>Start writing your note here...</p>',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log(`Creating new note: ${newNote.id}`);
      
      // Update state immediately
      setNotes([newNote, ...notes]);
      setActiveNoteId(newNote.id);
      
      // Queue save operation
      queueSave(newNote);
    } catch (error) {
      console.error('Failed to add note', error);
    }
  };

  // Update an existing note
  const updateNote = async (updatedNote: Note): Promise<boolean> => {
    try {
      console.log(`Updating note: ${updatedNote.id} - ${updatedNote.title}`);
      
      // Find original note
      const originalNote = notes.find(note => note.id === updatedNote.id);
      if (!originalNote) {
        console.error(`Cannot update note ${updatedNote.id}: Note not found`);
        return false;
      }

      const noteToUpdate = {
        ...originalNote,
        ...updatedNote,
        updatedAt: new Date(),
        // Preserve original creation date
        createdAt: originalNote.createdAt
      };
      
      // Update state immediately for responsive UI
      setNotes(notes.map(note => 
        note.id === noteToUpdate.id ? noteToUpdate : note
      ));
      
      // Queue save operation
      queueSave(noteToUpdate);
      return true;
    } catch (error) {
      console.error('Failed to update note', error);
      return false;
    }
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    try {
      console.log(`Deleting note: ${id}`);
      
      // Delete note from filesystem
      await DeleteNote(id);
      console.log(`Note ${id} deleted from filesystem`);
      
      // Remove from state
      setNotes(notes.filter(note => note.id !== id));
      
      // Remove from save queue if present
      if (saveQueue.current.has(id)) {
        console.log(`Removing note ${id} from save queue`);
        saveQueue.current.delete(id);
      }
      
      // Update active note if necessary
      if (activeNoteId === id) {
        const nextNote = notes.length > 1 ? notes.find(note => note.id !== id)?.id || null : null;
        console.log(`Deleted active note, selecting next note: ${nextNote}`);
        setActiveNoteId(nextNote);
      }
    } catch (error) {
      console.error(`Failed to delete note ${id}:`, error);
    }
  };

  // Get the currently active note
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