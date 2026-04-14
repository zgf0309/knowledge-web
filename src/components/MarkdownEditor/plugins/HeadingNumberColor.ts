import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const HeadingNumberColor = Extension.create({
  name: 'headingNumberColor',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('headingNumberColor'),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            const { doc } = state;

            doc.descendants((node, pos) => {
              if (node.type.name === 'heading') {
                const textContent = node.textContent;

                // Match number at the start of heading, e.g. "1.", "1.1", "1.1.", "1. Introduction"
                // Regex matches:
                // ^\s*       : Start of string, optional whitespace
                // (\d+       : Starts with at least one digit
                // (\.\d+)*   : Followed by zero or more .digit groups (e.g. .1)
                // \.?        : Optional trailing dot (e.g. 1. or 1.1)
                // )
                const match = textContent.match(/^(\d+(\.\d+)*\.?)/);

                if (match && match[0]) {
                  // We only color the number part
                  const from = pos + 1; // +1 to enter the node
                  const to = from + match[0].length;

                  // Ensure we don't go out of bounds (though descendants check should be safe)
                  if (to <= pos + node.nodeSize) {
                    decorations.push(
                      Decoration.inline(from, to, {
                        style: 'color: #1677ff; font-weight: 500;',
                        class: 'heading-number',
                      })
                    );
                  }
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
