import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import type { Editor } from '@tiptap/core';
import UniqueID from '@tiptap/extension-unique-id';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { Markdown } from 'tiptap-markdown';
import { BubbleMenuToolbar } from './BubbleMenuToolbar';
import { CustomTable, CustomTableCell, CustomTableHeader, CustomTableRow, CustomTextStyle } from './extensions';
import styles from './index.module.less';
import { Audio, Video } from './mediaExtensions';
import { HeadingNumberColor } from './plugins/HeadingNumberColor';
import { ResizableImage } from './ResizableImage';
import { SideToolbar, isSideToolbarOpen } from './SideToolbar';
import { TableOfContents } from './TableOfContents';
import { TableToolbar } from './TableToolbar';
import { useTableRowResize } from './useTableRowResize';

interface MarkdownEditorProps {
	value?: string;
	onChange?: (value: string) => void;
	editable?: boolean;
	isShowMenu?: boolean;
}

const MarkdownEditor = ({ value = '', onChange, editable = true, isShowMenu = true }: MarkdownEditorProps) => {
	const isHoveredRef = useRef<boolean>(false);
	const outInfoRef = useRef<any>(null);
	const editor = useEditor({
		editable,
		extensions: [
			// StarterKit.configure({
			// 	heading: false,
			// }),
			StarterKit,
			UniqueID.configure({
				types: ['heading'], // 仅给 heading 生成唯一 ID
			}),
			Markdown,
			ResizableImage,
			Video,
			Audio,
			BubbleMenuExtension,
			CustomTable.configure({
				resizable: true,
			}),
			CustomTableRow,
			CustomTableHeader,
			CustomTableCell,
			CustomTextStyle,
			HeadingNumberColor,
		],
		content: value,
		onUpdate: ({ editor }) => {
			const markdown = (editor.storage as any).markdown.getMarkdown();
			onChange?.(markdown);
		},
		editorProps: {
			handleDrop: (view: any, event: any, slice: any) => {
				const dragInfo = (window as any).__tiptap_drag_source;
				// If this drop comes from our own SideToolbar drag handle
				if (dragInfo && dragInfo.view === view) {
					const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;

					if (typeof dropPos === 'number') {
						// Allow the default insertion to happen first
						setTimeout(() => {
							let targetPos = dragInfo.pos;
							// If we inserted BEFORE the source, the source index is pushed forward by the size of the insertion
							if (dropPos <= dragInfo.pos) {
								targetPos += slice.size;
							}
							// Delete the original node
							view.dispatch(view.state.tr.delete(targetPos, targetPos + dragInfo.size));
						}, 0);
					}
				}
				// Return false to let the default drop behavior (insertion) proceed
				return false;
			},
		},
	});

	const { isRowResizing } = useTableRowResize(editor);

	// 当外部 value 改变时，同步到编辑器
	useEffect(() => {
		if (!editor || editor.isDestroyed) {
			return;
		}

		const currentMarkdown = (editor.storage as any).markdown.getMarkdown();
		if (value !== currentMarkdown) {
			editor.commands.setContent(value, { emitUpdate: false });
			goFooter();
		}
	}, [value, editor]);

	useEffect(() => {
		if (editor) {
			editor.setEditable(editable);
		}
	}, [editable, editor]);

	const goFooter = () => {
		if (isHoveredRef.current === false && outInfoRef.current) {
			outInfoRef.current.scrollTop = outInfoRef.current.scrollHeight;
		}
	};
	return (
		<div
			ref={outInfoRef}
			className={styles.editorWrapper}
			onMouseEnter={() => {
				isHoveredRef.current = true;
			}}
			onMouseLeave={() => {
				isHoveredRef.current = false;
			}}
			style={{ paddingLeft: editable ? '70px' : '0px' }}
		>
			{editor?.view && isShowMenu && <TableOfContents editor={editor} />}
			{editor?.view && editable && (
				<>
					{/* Text Selection Menu */}
					<BubbleMenu
						editor={editor}
						style={{ zIndex: 99 }}
						shouldShow={({ editor }: { editor: Editor }) => {
							// Don't show if side toolbar menu is open
							if (isSideToolbarOpen.value) return false;

							// Don't show if dragging table row
							if (isRowResizing) return false;

							// Don't show if content is empty selection
							if (editor.state.selection.empty) return false;

							// Don't show if inside a table (we have a separate menu for that)
							if (editor.isActive('table')) return false;

							// Don't show if Image/Video/Audio is selected (they have their own NodeView toolbar)
							if (editor.isActive('image') || editor.isActive('video') || editor.isActive('audio')) return false;

							return true;
						}}
					>
						<BubbleMenuToolbar editor={editor} />
					</BubbleMenu>

					{/* Table Selection Menu */}
					<BubbleMenu
						editor={editor}
						style={{ zIndex: 99 }}
						shouldShow={({ editor }: { editor: Editor }) =>
							!isSideToolbarOpen.value && !isRowResizing && editor.isActive('table')
						}
					>
						<TableToolbar editor={editor} />
					</BubbleMenu>
				</>
			)}
			{editor?.view && (
				<div className={styles.editorContent} style={{ width: isShowMenu ? '70%' : '100%' }}>
					<EditorContent editor={editor} className={styles.editorSurface} />
					{editable && <SideToolbar editor={editor} />}
				</div>
			)}
		</div>
	);
};

export default MarkdownEditor;
