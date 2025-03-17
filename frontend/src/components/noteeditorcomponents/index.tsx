import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useNotes, Note } from '../../contexts/NotesContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Toolbar } from './ToolbarButtons';
import { StatusBar } from './StatusBar';
import { useDebounce } from './hooks/useDebounce';
import InputModal from '../modals/MainModal';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Blockquote from '@tiptap/extension-blockquote';
import Dropcursor from '@tiptap/extension-dropcursor';
import Image from '@tiptap/extension-image';
import HorizontalRule from '@tiptap/extension-horizontal-rule';

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

const useScrollbarStyle = () => {
  const { getScrollbarStyle } = useSettings();
  const scrollbarStyle = getScrollbarStyle();
  
  return useMemo(() => {
    const darkerScrollbarColor = scrollbarStyle['--scrollbar-thumb-color']?.replace(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
      (_, r, g, b, a) => `rgba(${Math.max(0, Number(r) - 20)}, ${Math.max(0, Number(g) - 20)}, ${Math.max(0, Number(b) - 20)}, ${a || 1})`
    );
    const darkerBackground = 'rgba(255, 255, 255, 0.03)';
    
    return {
      customScrollbarClass: "scrollbar-custom",
      style: {
        "--scrollbar-thumb-color": darkerScrollbarColor,
        "--scrollbar-track-color": darkerBackground
      }
    };
  }, [scrollbarStyle]);
};

const NoteEditor: React.FC = () => {
  const { getActiveNote, updateNote } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<{image: boolean, link: boolean}>({ image: false, link: false });
  const [textStats, setTextStats] = useState({ wordCount: 0, charCount: 0 });
  const lastChangeTimeRef = useRef<number>(0);
  const changesCountRef = useRef<number>(0);
  const { customScrollbarClass, style: scrollbarStyle } = useScrollbarStyle();

  const editorProps = useMemo(() => ({
    attributes: {
      class: `prose prose-invert max-w-none p-4 focus:outline-none overflow-y-auto ${customScrollbarClass}`,
      style: Object.entries(scrollbarStyle)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ')
    }
  }), [customScrollbarClass, scrollbarStyle]);

  const handleEditorUpdate = useCallback(({ editor }) => {
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
    
    if (changesCountRef.current >= 5 || (now - lastChangeTimeRef.current) > 500) {
      setIsSaving(true);
      saveNote({ ...note, content: newContent });
      lastChangeTimeRef.current = now;
    }
  }, [note]);

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    editorProps,
    onUpdate: handleEditorUpdate
  });

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
      setIsModalOpen(prev => ({ ...prev, image: false }));
    } else {
      editor.chain().focus().setLink({ href: url }).run();
      setIsModalOpen(prev => ({ ...prev, link: false }));
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
          onImageClick={() => setIsModalOpen(prev => ({ ...prev, image: true }))} 
          onLinkClick={() => setIsModalOpen(prev => ({ ...prev, link: true }))} 
        />
        <div className={`flex-1 bg-white/5 backdrop-blur-md border-b border-l border-r border-white/10 rounded-b-lg overflow-y-auto ${customScrollbarClass}`}
             style={scrollbarStyle as React.CSSProperties}>
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
      <StatusBar note={note} isSaving={isSaving} wordCount={textStats.wordCount} charCount={textStats.charCount} />
      <InputModal
        isOpen={isModalOpen.image}
        onClose={() => setIsModalOpen(prev => ({ ...prev, image: false }))}
        onConfirm={url => handleMedia(url, 'image')}
        title="Add Image"
        placeholder="Enter image URL"
        confirmText="Add Image"
        inputType="url"
      />
      <InputModal
        isOpen={isModalOpen.link}
        onClose={() => setIsModalOpen(prev => ({ ...prev, link: false }))}
        onConfirm={url => handleMedia(url, 'link')}
        title="Add Link"
        placeholder="Enter URL"
        confirmText="Add Link"
        inputType="url"
      />
    </div>
  );
};

export default NoteEditor;