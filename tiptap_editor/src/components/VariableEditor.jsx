// src/components/VariableEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

import VariableList from './VariableList';
import Toolbar from './Toolbar';
import './VariableEditor.css';

// Sample variables
const VARIABLES = [
  { id: 'user_name', label: 'User Name', value: '{{user_name}}' },
  { id: 'company', label: 'Company', value: '{{company}}' },
  { id: 'email', label: 'Email Address', value: '{{email}}' },
  { id: 'date', label: 'Current Date', value: '{{date}}' },
  { id: 'subscription_plan', label: 'Subscription Plan', value: '{{subscription_plan}}' },
  { id: 'account_balance', label: 'Account Balance', value: '{{account_balance}}' },
  { id: 'support_phone', label: 'Support Phone', value: '{{support_phone}}' },
  { id: 'website_url', label: 'Website URL', value: '{{website_url}}' }
];

const VariableEditor = () => {
  const [editorContent, setEditorContent] = useState('<p>Start typing and use {{ to insert variables.</p>');
  const [rawContent, setRawContent] = useState('');
  
  // Create a custom variable suggestion plugin
  const createVariableSuggestion = () => {
    return {
      items: ({ query }) => {
        return VARIABLES.filter(item => 
          item.label.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
      },
      render: () => {
        let component;
        let popup;

        return {
          onStart: props => {
            component = new ReactRenderer(VariableList, {
              props,
              editor: props.editor,
            });

            popup = tippy('body', {
              getReferenceClientRect: props.clientRect,
              appendTo: () => document.body,
              content: component.element,
              showOnCreate: true,
              interactive: true,
              trigger: 'manual',
              placement: 'bottom-start',
            });
          },
          onUpdate(props) {
            component.updateProps(props);
            
            popup[0].setProps({
              getReferenceClientRect: props.clientRect,
            });
          },
          onKeyDown(props) {
            if (props.event.key === 'Escape') {
              popup[0].hide();
              return true;
            }
            
            return component.ref?.onKeyDown(props);
          },
          onExit() {
            popup[0].destroy();
            component.destroy();
          },
        };
      },
    };
  };

  // Initialize the editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'variable-mention',
        },
        suggestion: createVariableSuggestion(),
        renderLabel({ node }) {
          return `${node.attrs.label}`;
        },
      }),
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
      setRawContent(editor.getText());
    },
  });

  // Handle export functions
  const exportHTML = () => {
    return editorContent;
  };

  const exportRaw = () => {
    return rawContent;
  };

  return (
    <div className="editor-container">
      <Toolbar editor={editor} />
      <div className="editor-content-wrapper">
        <EditorContent editor={editor} className="editor-content" />
      </div>
      <div className="mt-4 flex justify-between">
        <button 
          onClick={() => alert(exportHTML())} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Export HTML
        </button>
        <button 
          onClick={() => alert(exportRaw())} 
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Export Raw Text
        </button>
      </div>
    </div>
  );
};

export default VariableEditor;