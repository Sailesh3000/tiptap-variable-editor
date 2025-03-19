import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Node } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import tippy from 'tippy.js';
import { ReactRenderer } from '@tiptap/react';
import 'tippy.js/dist/tippy.css';

import Toolbar from './Toolbar';
import './VariableEditor.css';

// Sample variables with categories
const VARIABLES = [
  { id: 'user_name', label: 'User Name', value: '{{user_name}}', category: 'User' },
  { id: 'company', label: 'Company', value: '{{company}}', category: 'User' },
  { id: 'email', label: 'Email Address', value: '{{email}}', category: 'User' },
  { id: 'date', label: 'Current Date', value: '{{date}}', category: 'System' },
  { id: 'subscription_plan', label: 'Subscription Plan', value: '{{subscription_plan}}', category: 'Account' },
  { id: 'account_balance', label: 'Account Balance', value: '{{account_balance}}', category: 'Account' },
  { id: 'support_phone', label: 'Support Phone', value: '{{support_phone}}', category: 'Support' },
  { id: 'website_url', label: 'Website URL', value: '{{website_url}}', category: 'Company' }
];

// Variable List component with improved UI
const VariableList = ({ items, command, editor }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = items[index];
    if (item) {
      command(item);
    }
  };

  const onKeyDown = ({ event }) => {
    if (event.key === 'ArrowUp') {
      setSelectedIndex((selectedIndex + items.length - 1) % items.length);
      return true;
    }

    if (event.key === 'ArrowDown') {
      setSelectedIndex((selectedIndex + 1) % items.length);
      return true;
    }

    if (event.key === 'Enter') {
      selectItem(selectedIndex);
      return true;
    }

    return false;
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const categoryOrder = ['User', 'Account', 'Company', 'System', 'Support', 'Other'];
  const sortedCategories = Object.keys(groupedItems).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  if (items.length === 0) {
    return (
      <div className="variable-list">
        <div className="variable-list-header">Variables</div>
        <div className="variable-list-empty">No variables found</div>
      </div>
    );
  }

  return (
    <div className="variable-list">
      <div className="variable-list-header">Insert Variable</div>
      {sortedCategories.map(category => (
        <div key={category} className="mb-2">
          <div className="text-xs font-semibold text-gray-500 px-2 pb-1">{category}</div>
          {groupedItems[category].map((item, index) => {
            const isSelected = index === selectedIndex;
            const actualIndex = items.indexOf(item);
            
            return (
              <button
                key={item.id}
                className={`variable-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => selectItem(actualIndex)}
              >
                <div className="flex flex-col">
                  <span className="variable-item-label">{item.label}</span>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  insert
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Create a Variable node
const Variable = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,
  
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'variable-token',
      },
      suggestion: {
        char: '{{',
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: 'variable',
              attrs: props
            })
            .run();
        },
        items: ({ query }) => {
          return VARIABLES.filter(item => 
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.id.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10);
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
                theme: 'light-border',
                animation: 'shift-away',
              });
            },
            onUpdate(props) {
              if (component && component.updateProps) {
                component.updateProps(props);
              }
              
              if (popup && popup[0]) {
                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              }
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                if (popup && popup[0]) {
                  popup[0].hide();
                }
                return true;
              }
              
              return component && component.ref ? component.ref.onKeyDown(props) : false;
            },
            onExit() {
              if (popup && popup[0]) {
                popup[0].destroy();
                popup = null;
              }
              if (component) {
                component.destroy();
                component = null;
              }
            },
          };
        },
      }
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: null,
      },
      category: {
        default: null,
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable]',
        getAttrs: element => ({
          id: element.getAttribute('data-id'),
          label: element.getAttribute('data-label'),
          category: element.getAttribute('data-category'),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', { 
      ...HTMLAttributes, 
      'data-variable': '', 
      'data-id': HTMLAttributes.id,
      'data-label': HTMLAttributes.label,
      'data-category': HTMLAttributes.category,
      class: 'variable-mention'
    }, `{{${HTMLAttributes.label}}}`];
  },
  
  renderText({ node }) {
    return `{{${node.attrs.label}}}`;
  },
  
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

const ModernVariableEditor = () => {
  const [editorContent, setEditorContent] = useState('<p>Start typing and use {{ to insert variables.</p>');
  const [rawContent, setRawContent] = useState('Start typing and use {{ to insert variables.');
  const [showPreview, setShowPreview] = useState(false);
  const [renderedContent, setRenderedContent] = useState('');
  const [previewData, setPreviewData] = useState({
    user_name: 'John Doe',
    company: 'Acme Corp',
    email: 'john@example.com',
    date: new Date().toLocaleDateString(),
    subscription_plan: 'Professional',
    account_balance: '$1,250.00',
    support_phone: '(555) 123-4567',
    website_url: 'www.example.com'
  });
  
  // Initialize the editor with the Variable node that includes suggestion
  const editor = useEditor({
    extensions: [
      StarterKit,
      Variable,
      Underline,  // Add the Underline extension
      TextAlign.configure({  // Add the TextAlign extension with configuration
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: editorContent,
    onUpdate: ({ editor }) => {
      setEditorContent(editor.getHTML());
      // Save DOM content for preview rendering later
      setRawContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && editor.schema) {
      console.log('Editor is initialized with schema');
    }
  }, [editor]);

  // Function to render preview with filled variables while preserving styling
  useEffect(() => {
    if (showPreview) {
      renderPreview();
    }
  }, [showPreview, previewData]);

  const renderPreview = () => {
    if (!rawContent) return;
    
    try {
      // Create a DOM fragment from the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = rawContent;
      
      // Find all variable elements
      const variableElements = tempDiv.querySelectorAll('span[data-variable]');
      
      // Replace each variable with its value while preserving parent styling
      variableElements.forEach(element => {
        const variableId = element.getAttribute('data-id');
        const value = previewData[variableId] || '';
        
        // Create a text node with the value
        const textNode = document.createTextNode(value);
        
        // Replace the variable element with the text node
        element.parentNode.replaceChild(textNode, element);
      });
      
      // Set the processed HTML as rendered content
      setRenderedContent(tempDiv.innerHTML);
    } catch (error) {
      console.error('Error in preview rendering:', error);
    }
  };

  // Handle export functions
  const exportHTML = () => {
    return editorContent;
  };

  const exportRenderedHTML = () => {
    return renderedContent;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Template Editor</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition duration-200"
            >
              {showPreview ? 'Edit Template' : 'Preview'}
            </button>
            <button 
              onClick={() => alert(showPreview ? exportRenderedHTML() : exportHTML())}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-md transition duration-200"
            >
              Export
            </button>
          </div>
        </div>
        
        {!showPreview ? (
          <>
            <Toolbar editor={editor} />
            <div className="p-6 bg-white">
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <div className="editor-content-wrapper">
                  <EditorContent editor={editor} className="editor-content prose max-w-none" />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
                <div className="flex items-start">
                  <div className="mr-3 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Pro Tip:</strong> Type {"{{"} to insert variables like user name, company, date, etc.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Variables will be automatically replaced with real data when your template is used, maintaining the styling of the surrounding text.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 bg-white">
            <div className="border border-gray-300 rounded-md p-6 bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Preview</h3>
              <div 
                className="prose max-w-none preview-content" 
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(previewData).map((key) => (
                  <div key={key} className="flex items-center">
                    <span className="text-sm text-gray-500 w-40">{key}:</span>
                    <input
                      type="text"
                      value={previewData[key]}
                      onChange={(e) => {
                        setPreviewData({...previewData, [key]: e.target.value});
                      }}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-2">Available Variables</h3>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortObjectByCategory(VARIABLES).map((v) => (
              <div key={v.id} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{v.label}</span>
                    <span className="block text-xs text-gray-500">{v.value}</span>
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">
                    {v.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add CSS for variable styling */}
      <style>{`
        .variable-mention {
          background-color: rgba(0, 123, 255, 0.1);
          border-radius: 4px;
          padding: 2px 4px;
          font-family: monospace;
          white-space: nowrap;
          border: 1px dashed rgba(0, 123, 255, 0.5);
          cursor: default;
          user-select: all;
        }

        .editor-content-wrapper {
          padding: 1rem;
        }

        .preview-content {
          padding: 1rem;
        }

        .variable-list {
          max-height: 300px;
          overflow-y: auto;
          border-radius: 6px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
          background-color: white;
          border: 1px solid #e2e8f0;
        }

        .variable-list-header {
          padding: 0.5rem 1rem;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }

        .variable-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.5rem 1rem;
          text-align: left;
          border: none;
          background: none;
          cursor: pointer;
        }

        .variable-item:hover {
          background-color: #f1f5f9;
        }

        .variable-item.is-selected {
          background-color: #e0f2fe;
        }

        .variable-item-label {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

// Helper function to sort variables by category
function sortObjectByCategory(variables) {
  const categoryOrder = ['User', 'Account', 'Company', 'System', 'Support', 'Other'];
  return [...variables].sort((a, b) => {
    const catA = categoryOrder.indexOf(a.category);
    const catB = categoryOrder.indexOf(b.category);
    return catA - catB;
  });
}

export default ModernVariableEditor;