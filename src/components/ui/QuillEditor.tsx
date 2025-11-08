"use client";

import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
// Note: Include Quill snow theme CSS globally via layout or page head

interface QuillEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// Lightweight wrapper around Quill v2 for rich text editing
export default function QuillEditor({ value, onChange, placeholder, className }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (quillRef.current) return; // init once

    // Clean up any orphaned Quill toolbars before creating new instance
    const orphanedToolbars = document.querySelectorAll('.ql-toolbar');
    orphanedToolbars.forEach(toolbar => {
      // Check if toolbar is orphaned (no corresponding editor)
      const nextSibling = toolbar.nextElementSibling;
      if (!nextSibling || !nextSibling.classList.contains('ql-container')) {
        console.log('Removing orphaned Quill toolbar');
        toolbar.remove();
      }
    });

    quillRef.current = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['blockquote', 'code-block'],
          ['link'],
          [{ color: [] }, { background: [] }],
          ['clean'],
        ],
      },
    });

    // Set initial content
    if (value) {
      const delta = quillRef.current.clipboard.convert({ html: value });
      quillRef.current.setContents(delta as any);
    }

    const handleTextChange = () => {
      if (!onChange || !containerRef.current) return;
      const html = containerRef.current.querySelector('.ql-editor')?.innerHTML || '';
      onChange(html);
    };

    quillRef.current.on('text-change', handleTextChange);

    return () => {
      if (quillRef.current && containerRef.current) {
        quillRef.current.off('text-change', handleTextChange);
        
        // Store reference to the toolbar before destroying Quill
        const toolbar = containerRef.current.querySelector('.ql-toolbar');
        
        // Use Quill's built-in cleanup method
        if (typeof quillRef.current.disable === 'function') {
          quillRef.current.disable();
        }
        
        // Destroy the Quill instance properly
        quillRef.current = null;
        
        // Clean the container completely
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.className = className || '';
        }
        
        // Remove the specific toolbar if it still exists somewhere in DOM
        if (toolbar && document.body.contains(toolbar)) {
          toolbar.remove();
        }
        
        // Final cleanup: remove any orphaned toolbars
        const orphanedToolbars = document.querySelectorAll('.ql-toolbar');
        orphanedToolbars.forEach(tb => {
          // Check if toolbar has no corresponding container or editor
          const parent = tb.parentElement;
          if (!parent || !parent.querySelector('.ql-container')) {
            console.log('Cleaning up orphaned toolbar');
            tb.remove();
          }
        });
      }
    };
  }, []);

  // If value changes externally, update editor
  useEffect(() => {
    if (!quillRef.current || !containerRef.current) return;
    const currentHtml = containerRef.current.querySelector('.ql-editor')?.innerHTML || '';
    if (value && value !== currentHtml) {
      const delta = quillRef.current.clipboard.convert({ html: value });
      quillRef.current.setContents(delta as any);
    }
  }, [value]);

  return <div ref={containerRef} className={className} />;
}
