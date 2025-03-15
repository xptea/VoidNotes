import React, { useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { ToolbarButton } from './ToolbarButton';
import { fontFamilyOptions } from './constants';

interface ToolbarProps {
  editor: Editor | null;
  onImageClick: () => void;
  onLinkClick: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor, onImageClick, onLinkClick }) => {
  if (!editor) return null;

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-white/5 backdrop-blur-md border-t border-l border-r border-white/10 rounded-t-lg sticky top-0 z-10">
      <div className="flex items-center gap-1">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57-1.709 0-2.687-1.08-2.687-2.57V3.136zM12.5 15h-9v-1h9v1z"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          active={editor.isActive('superscript')}
          title="Superscript"
        >
          x<sup>2</sup>
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          active={editor.isActive('subscript')}
          title="Subscript"
        >
          x<sub>2</sub>
        </ToolbarButton>
        <select 
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="bg-white/10 text-white/90 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          value={editor.getAttributes('textStyle').fontFamily}
        >
          {fontFamilyOptions.map(font => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>
      </div>
      <div className="h-5 w-px bg-white/20 mx-1" />
      <div className="flex items-center gap-1">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
      </div>
      <div className="h-5 w-px bg-white/20 mx-1" />
      <div className="flex items-center gap-1">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          •
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          1.
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          title="Task List"
        >
          ☐
        </ToolbarButton>
      </div>
      <div className="h-5 w-px bg-white/20 mx-1" />
      <div className="flex items-center gap-1">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          "
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          {'</>'}
        </ToolbarButton>
        <ToolbarButton 
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          —
        </ToolbarButton>
      </div>
      <div className="h-5 w-px bg-white/20 mx-1" />
      <div className="flex items-center gap-1">
        <ToolbarButton 
          onClick={addTable}
          active={editor.isActive('table')}
          title="Insert Table"
        >
          ⊞
        </ToolbarButton>
        <ToolbarButton 
          onClick={onImageClick}
          title="Insert Image"
        >
          🖼
        </ToolbarButton>
        <ToolbarButton 
          onClick={onLinkClick}
          active={editor.isActive('link')}
          title="Add Link"
        >
          🔗
        </ToolbarButton>
      </div>
      {editor.isActive('table') && (
        <>
          <div className="h-5 w-px bg-white/20 mx-1" />
          <div className="flex items-center gap-1">
            <ToolbarButton 
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Add Column Before"
            >
              ←|
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add Column After"
            >
              |→
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Add Row Before"
            >
              ↑_
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add Row After"
            >
              _↓
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Delete Column"
            >
              -|
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Delete Row"
            >
              -_
            </ToolbarButton>
            <ToolbarButton 
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete Table"
            >
              ⊟
            </ToolbarButton>
          </div>
        </>
      )}
    </div>
  );
};