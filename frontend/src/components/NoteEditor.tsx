import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNotes, Note } from '../contexts/NotesContext';
import { useSettings } from '../contexts/SettingsContext';
import { useEditor, EditorContent, Editor } from '@tiptap/react';

// Group TipTap extensions import
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import { 
  BulletList, OrderedList, CodeBlock, Link, Underline, TextStyle, 
  Color, Highlight, FontFamily, Superscript, Subscript, Table, 
  TableRow, TableCell, TableHeader, TaskList, TaskItem, 
  Blockquote, Dropcursor, Image, HorizontalRule 
} from './utils/tiptapExtensions';

// Local imports
import InputModal from './modals/MainModal';
import { Toolbar, StatusBar, useDebounce } from './noteeditorcomponents';

// TipTap editor extensions configuration
const EDITOR_EXTENSIONS = [
  StarterKit.configure({ heading: false, blockquote: false }),
  Placeholder.configure({ placeholder: 'Start writing your note here...' }),
  Underline,
  Link.configure({ openOnClick: false }),
  Heading.configure({ levels: [1, 2, 3] }),
  BulletList, OrderedList, CodeBlock, TextStyle, Color,
  Highlight.configure({ multicolor: true }),
  FontFamily.configure({ types: ['textStyle'] }),
  Superscript, Subscript,
  Table.configure({ resizable: true }),
  TableRow, TableHeader, TableCell,
  TaskList, TaskItem.configure({ nested: true }),
  Blockquote, Dropcursor, Image, HorizontalRule,
];

const NoteEditor: React.FC = () => {
  const { getActiveNote, updateNote } = useNotes();
  const { getScrollbarStyle } = useSettings();
  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [modals, setModals] = useState({
    image: false,
    link: false,
  });
  
  const [textStats, setTextStats] = useState({
    wordCount: 0,
    charCount: 0,
  });

  const lastChangeTimeRef = useRef<number>(0);
  const changesCountRef = useRef<number>(0);

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

  const handleEditorUpdate = useCallback(({ editor }: { editor: Editor }) => {
    if (!note) return;
    
    const newContent = editor.getHTML();
    const text = editor.state.doc.textContent;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    setTextStats({
      wordCount: words,
      charCount: text.length
    });

    const now = Date.now();
    changesCountRef.current += 1;
    
    const significantTimePassed = (now - lastChangeTimeRef.current) > 500;
    const enoughChanges = changesCountRef.current >= 5;
    
    if (enoughChanges || significantTimePassed) {
      setIsSaving(true);
      saveNote({
        ...note,
        content: newContent
      });
      lastChangeTimeRef.current = now;
    }
  }, [note]);

  const editorConfig = useMemo(() => ({
    extensions: EDITOR_EXTENSIONS,
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none p-4 focus:outline-none overflow-y-auto ${scrollbarConfig.class}`,
        style: Object.entries(scrollbarConfig.style)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ')
      },
    },
    onUpdate: handleEditorUpdate
  }), [handleEditorUpdate, scrollbarConfig]);

  const editor = useEditor(editorConfig);

  const saveNote = useDebounce((updatedNote: Note) => {
    updateNote(updatedNote);
    setIsSaving(false);
    changesCountRef.current = 0;
  }, 1500);

  useEffect(() => {
    const activeNote = getActiveNote();
    setNote(activeNote);
    
    if (activeNote && editor && !editor.isDestroyed) {
      editor.commands.setContent(activeNote.content);
      changesCountRef.current = 0;
    }
  }, [getActiveNote, editor]);

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

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/70 p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">No Note Selected</h2>
        <p>Select a note from the sidebar or create a new one.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-2">
      <div className="editor-container flex flex-col w-full h-[calc(100vh-6rem)] rounded-lg overflow-hidden border border-white/10">
        <Toolbar 
          editor={editor} 
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
        isSaving={isSaving}
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
    </div>
  );
};

export default NoteEditor;