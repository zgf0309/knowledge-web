import { Mark, mergeAttributes } from '@tiptap/core';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';

export const CustomTextStyle = Mark.create({
  name: 'textStyle',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => {
          const hasStyle = (element as HTMLElement).hasAttribute('style');
          if (!hasStyle) return false;
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color?.replace(/['"]+/g, ''),
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ''),
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor?.replace(/['"]+/g, ''),
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
    };
  },
});

export const CustomTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      height: {
        default: null,
        parseHTML: (element) => {
          // Also check if any child cell has height if row doesn't
          if (element.style.height) return element.style.height;
          return null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            style: `height: ${attributes.height}`,
          };
        },
      },
    };
  },
});

export const CustomTable = Table.extend({
  selectable: true,
  draggable: true,

  // We must ensure the parse rules match table
  parseHTML() {
    return [{ tag: 'table' }];
  },
});

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || element.getAttribute('data-background-color'),
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => element.style.color,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});

export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || element.getAttribute('data-background-color'),
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            'data-background-color': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          };
        },
      },
      color: {
        default: null,
        parseHTML: (element) => element.style.color,
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `color: ${attributes.color}`,
          };
        },
      },
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
    };
  },
});
