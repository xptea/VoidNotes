import React, { createContext, useContext, useState, useEffect } from 'react';

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
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  getActiveNote: () => Note | null;
}

const NotesContext = createContext<NotesContextType>({
  notes: [],
  filteredNotes: [],
  activeNoteId: null,
  searchQuery: '',
  setSearchQuery: () => {},
  setActiveNoteId: () => {},
  addNote: () => {},
  updateNote: () => {},
  deleteNote: () => {},
  getActiveNote: () => null,
});

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to VoidNotes',
    content: '# Welcome to VoidNotes\n\nThis is your first note. You can edit it or create new ones.\n\n## Features\n\n- Create and organize notes\n- Markdown support\n- Tagging system\n- Dark mode support',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['welcome', 'info']
  },
  {
    id: '2',
    title: 'Markdown Tips',
    content: '# Markdown Tips\n\n## Headers\n\n# H1\n## H2\n### H3\n\n## Lists\n\n- Item 1\n- Item 2\n  - Nested item\n\n## Code\n\n```javascript\nconst hello = "world";\nconsole.log(hello);\n```',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['markdown', 'tips']
  },
];

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('voidnotes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        return parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
      } catch (e) {
        console.error('Failed to parse saved notes', e);
        return initialNotes;
      }
    }
    return initialNotes;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (notes.length > 0 && !activeNoteId) {
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

  useEffect(() => {
    localStorage.setItem('voidnotes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '# Untitled Note\n\nStart writing...',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(notes.map(note => 
      note.id === updatedNote.id 
        ? { ...updatedNote, updatedAt: new Date() } 
        : note
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(notes.length > 1 ? notes.find(note => note.id !== id)?.id || null : null);
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
        getActiveNote
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);