import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNotes, Note } from '../contexts/NotesContext.js';
import { useSettings } from '../contexts/SettingsContext.js';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { EditorView } from 'prosemirror-view';

import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import { 
  BulletList, OrderedList, CodeBlock, Link, Underline, TextStyle, 
  Color, Highlight, FontFamily, Superscript, Subscript, Table, 
  TableRow, TableCell, TableHeader, TaskList, TaskItem, 
  Blockquote, Dropcursor, Image, HorizontalRule, DisableSpellcheckInCode 
} from './utils/tiptapExtensions.js';

import InputModal from './modals/MainModal.js';
import { StatusBar }from './NoteEditor/StatusBar.js';
import {useDebounce} from './NoteEditor/hooks/useDebounce.js';
import { Toolbar } from './NoteEditor/Toolbar.js';
import { GetAppDataDir } from '../../wailsjs/go/main/App.js';

const EDITOR_EXTENSIONS = [
  StarterKit.configure({ 
    heading: false, 
    blockquote: false,
    codeBlock: false,
  }),
  Placeholder.configure({ placeholder: 'Start writing your note here...' }),
  Underline,
  Link.configure({ openOnClick: false }),
  Heading.configure({ levels: [1, 2, 3] }),
  BulletList, 
  OrderedList, 
  CodeBlock.configure({ 
    HTMLAttributes: {
      class: 'hljs',
      spellcheck: 'false', 
    },
  }), 
  DisableSpellcheckInCode,
  TextStyle, 
  Color,
  Highlight.configure({ multicolor: true }),
  FontFamily.configure({ types: ['textStyle'] }),
  Superscript, 
  Subscript,
  Table.configure({ resizable: true }),
  TableRow, 
  TableHeader, 
  TableCell,
  TaskList, 
  TaskItem.configure({ nested: true }),
  Blockquote, 
  Dropcursor, 
  Image, 
  HorizontalRule,
];

const NoteEditor: React.FC = () => {
  const { getActiveNote, updateNote, isLoading, saveStatus, activeNoteId, setActiveNoteId } = useNotes();
  const { getScrollbarStyle } = useSettings();
  const [note, setNote] = useState<Note | null>(null);
  const [appDataDir, setAppDataDir] = useState<string>("");
  const previousNoteIdRef = useRef<string | null>(null);
  const editorContentRef = useRef<string>("");
  const lastSavedContentRef = useRef<string>("");
  const pendingSaveRef = useRef<boolean>(false);
  const isTypingRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [modals, setModals] = useState({
    image: false,
    link: false,
    unsavedChanges: false,
  });
  
  const [nextNoteId, setNextNoteId] = useState<string | null>(null);
  const [textStats, setTextStats] = useState({
    wordCount: 0,
    charCount: 0,
  });

  const scrollbarConfig = useMemo(() => {
    const style = getScrollbarStyle();
    const darkerScrollbarColor = style['--scrollbar-thumb-color']?.replace(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
      (_, r, g, b, a) => `rgba(${Math.max(0, Number(r) - 20)}, ${Math.max(0, Number(g) - 20)}, ${Math.max(0, Number(b) - 20)}, ${a || 1})`
    );
    const darkerBackground = 'rgba(255, 255, 255, 0.03)';
    
    return {
      class: "scrollbar-custom",
      style: {
        "--scrollbar-thumb-color": darkerScrollbarColor,
        "--scrollbar-track-color": darkerBackground,
      } as React.CSSProperties
    };
  }, [getScrollbarStyle]);

  const editorConfig = useMemo(() => ({
    extensions: EDITOR_EXTENSIONS,
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none p-4 focus:outline-none overflow-y-auto ${scrollbarConfig.class}`,
        style: Object.entries(scrollbarConfig.style)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')
      },
      handlePaste: (view: EditorView, event: ClipboardEvent) => {
        return false;
      }
    }
  }), [scrollbarConfig]);

  const editor = useEditor(editorConfig);

  const markAsTyping = useCallback(() => {
    isTypingRef.current = true;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 500);
  }, []);

  const saveNoteContentImmediately = useCallback((content: string) => {
    if (!note) return;
    
    console.log(`IMMEDIATE SAVE for note: ${note.id}, content length: ${content.length}`);
    pendingSaveRef.current = true;
    
    try {
      updateNote({
        ...note,
        content,
        updatedAt: new Date()
      });
      lastSavedContentRef.current = content;
      console.log(`Immediate save completed for note ${note.id}`);
    } catch (err) {
      console.error("Failed to save note immediately:", err);
    } finally {
      pendingSaveRef.current = false;
    }
  }, [note, updateNote]);

  const debouncedSave = useDebounce((updatedContent: string) => {
    if (!note || pendingSaveRef.current) return;
    
    console.log(`Debounced save for note ${note.id}, content length: ${updatedContent.length}`);
    pendingSaveRef.current = true;
    
    try {
      updateNote({
        ...note,
        content: updatedContent,
        updatedAt: new Date()
      });
      lastSavedContentRef.current = updatedContent;
      console.log(`Debounced save completed for note ${note.id}`);
    } catch (err) {
      console.error("Failed in debounced save:", err);
    } finally {
      pendingSaveRef.current = false;
    }
  }, 1000);

  const handleEditorUpdate = useCallback(({ editor }: { editor: Editor }) => {
    if (!note || !editor) return;
    
    markAsTyping();
    
    const newContent = editor.getHTML();
    editorContentRef.current = newContent;
    
    const text = editor.state.doc.textContent;
    setTextStats({
      wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
      charCount: text.length
    });
    
    debouncedSave(newContent);
  }, [note, debouncedSave, markAsTyping]);

  const forceSaveContent = useCallback(() => {
    if (!editor || !note || isTypingRef.current) return false;
    
    const currentContent = editor.getHTML();
    
    if (currentContent !== lastSavedContentRef.current) {
      console.log(`Force saving note ${note.id} before switching`);
      saveNoteContentImmediately(currentContent);
      return true;
    }
    
    return false;
  }, [editor, note, saveNoteContentImmediately]);

  const switchToNote = useCallback((newNoteId: string | null) => {
    if (!editor || !note) {
      setActiveNoteId(newNoteId);
      return;
    }
    
    if (isTypingRef.current) {
      console.log("User is currently typing, delaying note switch");
      setNextNoteId(newNoteId);
      setModals(prev => ({ ...prev, unsavedChanges: true }));
      return;
    }
    
    const currentContent = editor.getHTML();
    
    if (currentContent !== lastSavedContentRef.current) {
      console.log("Unsaved changes detected, saving before switch");
      saveNoteContentImmediately(currentContent);
    }
    
    setActiveNoteId(newNoteId);
  }, [editor, note, setActiveNoteId, saveNoteContentImmediately]);

  useEffect(() => {
    const loadNewNote = async () => {
      const currentNoteId = previousNoteIdRef.current;
      const newActiveNote = getActiveNote();
      
      if (isTypingRef.current && currentNoteId && currentNoteId !== activeNoteId) {
        console.log(`User is typing, delaying switch from ${currentNoteId} to ${activeNoteId}`);
        setNextNoteId(activeNoteId);
        setModals(prev => ({ ...prev, unsavedChanges: true }));
        return;
      }
      
      console.log(`Note switching from ${currentNoteId} to ${activeNoteId}`);
      
      if (currentNoteId && editor && note) {
        const currentContent = editor.getHTML();
        if (currentContent !== lastSavedContentRef.current) {
          console.log(`Saving note ${currentNoteId} before switching to ${activeNoteId}`);
          saveNoteContentImmediately(currentContent);
        }
      }
      
      previousNoteIdRef.current = activeNoteId;
      
      if (!newActiveNote) {
        setNote(null);
        return;
      }
      
      setNote(newActiveNote);
      
      if (editor && !editor.isDestroyed) {
        const contentToSet = newActiveNote.content || '';
        
        if (editorContentRef.current !== contentToSet) {
          editor.commands.setContent(contentToSet, false);
          editorContentRef.current = contentToSet;
          lastSavedContentRef.current = contentToSet;
        }
        
        const text = editor.state.doc.textContent;
        setTextStats({
          wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
          charCount: text.length
        });
        
        console.log(`Loaded note ${newActiveNote.id}, content length: ${contentToSet.length}`);
      }
    };
    
    loadNewNote();
  }, [activeNoteId, editor, getActiveNote, saveNoteContentImmediately, note]);

  useEffect(() => {
    if (!editor) return;
    
    const handleKeyDown = () => {
      markAsTyping();
    };
    
    editor.on('update', handleEditorUpdate);
    
    const editorDOM = editor.view.dom;
    editorDOM.addEventListener('keydown', handleKeyDown);
    
    return () => {
      editor.off('update', handleEditorUpdate);
      editorDOM.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, handleEditorUpdate, markAsTyping]);

  useEffect(() => {
    GetAppDataDir().then(dir => {
      setAppDataDir(dir);
    }).catch(err => {
      console.error("Failed to get app data directory:", err);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (!isTypingRef.current) {
        forceSaveContent();
      }
    };
  }, [forceSaveContent]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (note && editor && !pendingSaveRef.current && !isTypingRef.current) {
        const currentContent = editor.getHTML();
        if (currentContent !== lastSavedContentRef.current) {
          console.log(`Periodic save check - saving note ${note.id}`);
          saveNoteContentImmediately(currentContent);
        }
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [note, editor, saveNoteContentImmediately]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (note && editor) {
        const currentContent = editor.getHTML();
        if (currentContent !== lastSavedContentRef.current) {
          saveNoteContentImmediately(currentContent);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [note, editor, saveNoteContentImmediately]);

  const handleMedia = useCallback((url: string, type: 'image' | 'link') => {
    if (!editor) return;
    
    if (type === 'image') {
      editor.chain().focus().setImage({ src: url }).run();
      setModals(prev => ({ ...prev, image: false }));
    } else {
      editor.chain().focus().setLink({ href: url }).run();
      setModals(prev => ({ ...prev, link: false }));
    }
  }, [editor]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/70 p-8 text-center">
        <svg className="animate-spin h-16 w-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-bold mb-2">Loading Notes</h2>
        <p>Fetching notes from {appDataDir || "application directory"}...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/70 p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">No Note Selected</h2>
        <p>Select a note from the sidebar or create a new one.</p>
        <p className="mt-4 text-sm">Notes are saved to: {appDataDir || "application directory"}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-2">
      <div className="editor-container flex flex-col w-full h-[calc(100vh-6rem)] rounded-lg overflow-hidden border border-white/10">
        <Toolbar 
          editor={editor || null} 
          onImageClick={() => setModals(prev => ({ ...prev, image: true }))}
          onLinkClick={() => setModals(prev => ({ ...prev, link: true }))}
        />
        
        <div className={`flex-1 bg-white/5 backdrop-blur-md border-b border-l border-r border-white/10 rounded-b-lg overflow-y-auto ${scrollbarConfig.class}`}
             style={scrollbarConfig.style}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
      
      <StatusBar
        note={note}
        wordCount={textStats.wordCount}
        charCount={textStats.charCount}
        isSaving={pendingSaveRef.current || saveStatus.isSaving}
        appDataDir={appDataDir}
      />

      <InputModal
        isOpen={modals.image}
        onClose={() => setModals(prev => ({ ...prev, image: false }))}
        onConfirm={(url) => handleMedia(url, 'image')}
        title="Add Image"
        placeholder="Enter image URL"
        confirmText="Add Image"
        inputType="url"
      />
      <InputModal
        isOpen={modals.link}
        onClose={() => setModals(prev => ({ ...prev, link: false }))}
        onConfirm={(url) => handleMedia(url, 'link')}
        title="Add Link"
        placeholder="Enter URL"
        confirmText="Add Link"
        inputType="url"
      />
      <InputModal
        isOpen={modals.unsavedChanges}
        onClose={() => {
          setModals(prev => ({ ...prev, unsavedChanges: false }));
          setNextNoteId(null);
        }}
        onConfirm={() => {
          setModals(prev => ({ ...prev, unsavedChanges: false }));
          if (nextNoteId !== null) {
            forceSaveContent();
            setActiveNoteId(nextNoteId);
            setNextNoteId(null);
          }
        }}
        title="Unsaved Changes"
        message="You have unsaved changes in this note. Save before switching?"
        confirmText="Save & Switch"
        showInput={false}
        cancelText="Discard Changes"
      />
    </div>
  );
};

export default NoteEditor;