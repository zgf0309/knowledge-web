import { useEffect, useState } from 'react';

export const useTableRowResize = (editor: any) => {
  const [isRowResizing, setIsRowResizing] = useState(false);

  useEffect(() => {
    if (!editor || !editor?.view || editor?.isDestroyed) return;
    const view = editor?.view;
    if (!view) return;

    let activeTr: HTMLElement | null = null;
    let startY = 0;
    let startHeight = 0;
    let isResizing = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && activeTr) {
        e.preventDefault();
        const diff = e.clientY - startY;
        const newHeight = Math.max(30, startHeight + diff);

        // Apply to TR
        activeTr.style.height = `${newHeight}px`;

        // Apply to all cells in the row to ensure visual update
        const cells = activeTr.querySelectorAll('td, th');
        cells.forEach((cell) => {
          (cell as HTMLElement).style.height = `${newHeight}px`;
        });
        return;
      }

      // Detect hover near bottom border of cells
      const target = e.target as HTMLElement;
      const cell = target.closest('td, th');
      if (!cell) {
        if (!isResizing) view.dom.style.cursor = '';
        return;
      }

      // Only allow resizing if we are inside the editor table
      if (!view.dom.contains(cell)) return;

      const rect = cell.getBoundingClientRect();
      // Height of detection zone
      const buffer = 8;
      const isBottomEdge = Math.abs(e.clientY - rect.bottom) < buffer;
      const isTopEdge = Math.abs(e.clientY - rect.top) < buffer;

      // Check if we can resize:
      // 1. Bottom edge of current row
      // 2. Top edge of current row (updates previous row)
      const tr = cell.closest('tr');
      const hasPrevRow = tr && tr.previousElementSibling;

      if (isBottomEdge || (isTopEdge && hasPrevRow)) {
        view.dom.style.cursor = 'row-resize';
      } else {
        if (!isResizing) view.dom.style.cursor = '';
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cell = target.closest('td, th');
      if (!cell) return;

      // Only allow resizing if we are inside the editor table
      if (!view.dom.contains(cell)) return;

      const rect = cell.getBoundingClientRect();
      const buffer = 8;
      const isBottomEdge = Math.abs(e.clientY - rect.bottom) < buffer;
      const isTopEdge = Math.abs(e.clientY - rect.top) < buffer;

      if (isBottomEdge || isTopEdge) {
        const currentTr = cell.closest('tr') as HTMLElement;
        if (!currentTr) return;

        let targetTr = currentTr;
        // If clicking top edge, we are actually resizing the PREVIOUS row
        if (isTopEdge) {
          const prev = currentTr.previousElementSibling as HTMLElement;
          if (!prev) return; // Cannot resize top of first row (no previous row)
          targetTr = prev;
        }

        e.preventDefault();
        e.stopPropagation(); // Stop selection or other events

        if (targetTr) {
          activeTr = targetTr;
          startY = e.clientY;
          startHeight = targetTr.getBoundingClientRect().height;
          isResizing = true;
          setIsRowResizing(true);

          // Force cursor on body to prevent flickering during drag
          document.body.style.cursor = 'row-resize';
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isResizing && activeTr) {
        const height = activeTr.style.height;

        try {
          const posInside = view.posAtDOM(activeTr, 0);
          if (posInside !== null && posInside !== undefined) {
            const resolved = view.state.doc.resolve(posInside);
            // Find the tableRow node
            for (let d = resolved.depth; d > 0; d--) {
              const node = resolved.node(d);
              if (node.type.name === 'tableRow') {
                const pos = resolved.before(d);
                view.dispatch(
                  view.state.tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    height: height, // Ensure this matches schema attribute
                  })
                );
                break;
              }
            }
          }
        } catch (err) {
          console.error('Error setting row height', err);
        }

        // Cleanup forced styles on cells if any (optional, proseMirror re-render usually fixes it, but good to be safe)
        // Array.from(activeTr.children).forEach((child) => {
        // 	(child as HTMLElement).style.height = '';
        // });
        // Actually, we WANT to keep the height until the re-render happens.

        activeTr = null;
        isResizing = false;
        setIsRowResizing(false);
        view.dom.style.cursor = '';
        document.body.style.cursor = '';
      }
    };

    view.dom.addEventListener('mousemove', handleMouseMove);
    view.dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    // Also listen to mousemove on window when resizing to prevent losing tracking
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      view.dom.removeEventListener('mousemove', handleMouseMove);
      view.dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [editor]);

  return { isRowResizing };
};
