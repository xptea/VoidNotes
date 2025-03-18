import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
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
import { Extension } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';

import { common, createLowlight } from 'lowlight';
const lowlight = createLowlight(common);
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import cpp from 'highlight.js/lib/languages/cpp';
import java from 'highlight.js/lib/languages/java';
import csharp from 'highlight.js/lib/languages/csharp';

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('css', css);
lowlight.register('html', xml); 
lowlight.register('json', json);
lowlight.register('bash', bash);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('cpp', cpp);
lowlight.register('java', java);
lowlight.register('csharp', csharp);

const DisableSpellcheckInCode = Extension.create({
  name: 'disableSpellcheckInCode',
  addGlobalAttributes() {
    return [
      {
        types: ['codeBlock', 'code'],
        attributes: {
          spellcheck: {
            default: 'false',
            parseHTML: element => element.getAttribute('spellcheck') || 'false',
            renderHTML: () => {
              return {
                spellcheck: 'false',
              }
            },
          },
        },
      },
    ]
  },
});

const CodeBlock = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: 'javascript', 
  HTMLAttributes: {
    class: 'hljs',
    spellcheck: 'false',
  }
}).extend({
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('pre');
      
      dom.setAttribute('spellcheck', 'false');
      
      dom.classList.add('hljs');
      
      const content = document.createElement('code');
      content.setAttribute('spellcheck', 'false');
      
      if (node.attrs.language) {
        content.classList.add(`language-${node.attrs.language}`);
      }
      
      dom.append(content);
      
      return {
        dom,
        contentDOM: content,
      };
    };
  }
});

export {
  BulletList,
  OrderedList,
  CodeBlock,
  DisableSpellcheckInCode,
  Link,
  Underline,
  TextStyle,
  Color,
  Highlight,
  FontFamily,
  Superscript,
  Subscript,
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TaskList,
  TaskItem,
  Blockquote,
  Dropcursor,
  Image,
  HorizontalRule,
};
