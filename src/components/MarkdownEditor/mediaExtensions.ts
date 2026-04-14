import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableMediaNode from './ResizableMediaNode';

export const Video = Node.create({
  name: 'video',
  group: 'inline', // Changed from block to inline
  inline: true,    // Added inline property
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
      align: {
        default: 'inline', // Changed default to inline
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableMediaNode);
  },
});

export const Audio = Node.create({
  name: 'audio',
  group: 'inline', // Changed from block to inline
  inline: true,    // Added inline property
  selectable: true,
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
      align: {
        default: 'inline', // Changed default to inline
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableMediaNode);
  },
});
