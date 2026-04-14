import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableMediaNode from './ResizableMediaNode';

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
      align: {
        default: 'inline',
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableMediaNode);
  },
});
