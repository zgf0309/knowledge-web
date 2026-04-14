import { CopyOutlined, DeleteOutlined, PlusOutlined, TableOutlined } from '@ant-design/icons';
import { Editor } from '@tiptap/react';
import { useThrottleFn } from 'ahooks';
import { Dropdown, MenuProps } from 'antd';
import {
	AudioLines,
	Code,
	GripVertical,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	Image as ImageIcon,
	List,
	ListOrdered,
	Pilcrow,
	Quote,
	Video as VideoIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './SideToolbar.module.less';

import { selectFile, uploadFile } from './utils';

import { DOMSerializer } from 'prosemirror-model';

interface SideToolbarProps {
	editor: Editor;
}

// Global flag to track if the side toolbar menu is open
export const isSideToolbarOpen = { value: false };

export const SideToolbar = ({ editor }: SideToolbarProps) => {
	const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
	const [activeNodeInfo, setActiveNodeInfo] = useState<{ pos: number; node: any } | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Update global flag whe menu open state changes
	useEffect(() => {
		isSideToolbarOpen.value = isMenuOpen;
	}, [isMenuOpen]);

	const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
		if (!activeNodeInfo || !editor) return;

		// 1. Select the node to be moved
		editor.commands.setNodeSelection(activeNodeInfo.pos);

		// 2. Set drag effect to move
		event.dataTransfer.effectAllowed = 'move';

		// 3. Serialize the node to HTML for the drag data
		// This allows Tiptap/ProseMirror to interpret the drop as content insertion
		const serializer = DOMSerializer.fromSchema(editor.schema);
		const dom = serializer.serializeNode(activeNodeInfo.node);
		const div = document.createElement('div');
		div.appendChild(dom);
		// Clean up the wrapper if needed, or Tiptap parses it fine
		event.dataTransfer.setData('text/html', div.innerHTML);
		event.dataTransfer.setData('text/plain', activeNodeInfo.node.textContent || '');

		// 4. We listen for the drop success to delete the original content
		// BUT determining if drop was successful and handled by *this* editor is tricky via native events.
		// A common pattern is to just delete it if the intent 'move' is respected.
		// However, if we drop outside, we shouldn't delete.
		// For now, rely on Tiptap's internal drag-drop handling if we had a draggable node.
		// Since we are simulating external drag, we might need a custom hook.
		//
		// Simplification: We set a flag on the editor instance or window to track this internal drag
		(window as any).__tiptap_drag_source = {
			pos: activeNodeInfo.pos,
			size: activeNodeInfo.node.nodeSize,
			view: editor?.view,
		};
	};

	const onDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
		// Cleanup after drag ends (regardless of success)
		// We delay slightly to allow the drop handler to access the data
		setTimeout(() => {
			(window as any).__tiptap_drag_source = null;
		}, 100);
	};

	const onHandleMouseDown = () => {
		if (activeNodeInfo) {
			editor.chain().focus().setNodeSelection(activeNodeInfo.pos).run();
		}
	};

	const { run: handleMouseMove } = useThrottleFn(
		(event: MouseEvent) => {
			if (!editor || !editor?.view || !editor?.view?.dom) return;

			const view = editor?.view;
			if (!view) return;
			const editorRect = view.dom.getBoundingClientRect();

			// 鼠标位置相对于视口
			const coords = {
				left: event.clientX,
				top: event.clientY,
			};

			// 获取鼠标下的位置信息
			const pos = view.posAtCoords(coords);
			if (!pos) return;

			// 找到对应的 Node
			let node = view.state.doc.nodeAt(pos.pos);
			let resolvedPos = view.state.doc.resolve(pos.pos);

			// 特殊处理：媒体节点（图片、视频、音频）
			// 这些节点虽然配置为 inline，但在视觉上通常作为块处理
			// 且因为是 inline，不会出现在 ancestor 循环中，所以需要单独检测
			if (node && ['image', 'video', 'audio'].includes(node.type.name)) {
				const domNode = view.nodeDOM(pos.pos);
				if (domNode instanceof HTMLElement) {
					const nodeRect = domNode.getBoundingClientRect();
					// 计算相对于编辑器容器的位置
					const top = nodeRect.top - editorRect.top;
					setPosition({
						top: top + 4,
						left: 0,
					});
					setActiveNodeInfo({
						pos: pos.pos,
						node: node,
					});
					return;
				}
			}

			// 向上查找最近的 Block 节点
			const targetElement = document.elementFromPoint(event.clientX, event.clientY);
			// 判断是否悬停在表格的结构部分（空白处），而非具体内容上
			const isHoveringTableStructure =
				targetElement && ['td', 'th', 'tr', 'table', 'tbody', 'thead'].includes(targetElement.tagName.toLowerCase());

			let currentDepth = resolvedPos.depth;
			while (currentDepth > 0) {
				const currentNode = resolvedPos.node(currentDepth);
				if (currentNode.isBlock) {
					// 策略：
					// 1. 总是过滤掉 tableCell/tableHeader/tableRow 这些中间结构节点，因为我们通常操作内容或整个表格
					// 2. 如果鼠标悬停在表格空白处 (isHoveringTableStructure):
					//    - 只有当找到 'table' 节点时才停止。
					//    - 忽略内部的内容节点 (如 paragraph)，因为此时用户意图是指向表格整体。
					// 3. 如果鼠标悬停在文字上 (!isHoveringTableStructure):
					//    - 找到第一个非结构性 Block (如 paragraph) 就停止。

					const isStructureNode = ['tableCell', 'tableHeader', 'tableRow'].includes(currentNode.type.name);

					if (isStructureNode) {
						currentDepth--;
						continue;
					}

					if (isHoveringTableStructure) {
						// 在表格空白处，只有 table 节点才是目标
						// 注意：这里假设表格节点的 type name 是 'table'
						if (currentNode.type.name !== 'table') {
							currentDepth--;
							continue;
						}
					}

					// 找到当前 block 对应的 DOM 节点
					const domNode = view.nodeDOM(resolvedPos.before(currentDepth));

					if (domNode instanceof HTMLElement) {
						const nodeRect = domNode.getBoundingClientRect();

						// 更新位置：定位在 block 的左侧
						// 我们需要计算相对于 editorWrapper (父级) 的位置
						// 这里假设 SideToolbar 是 editorWrapper 的直接子元素，且 editorWrapper 是 relative
						// 但由于 boundingClientRect 是相对于 viewport 的，我们需要减去 editorWrapper 的偏移，
						// 或者直接使用 fixed 定位? 不，尽量用 absolute。
						// 简单起见，我们先计算相对于 editorRect 的偏移

						// 仅当鼠标在当前 Block 附近时才显示（可选优化，目前先实时跟随）

						// 设置位置
						const top = nodeRect.top - editorRect.top;
						setPosition({
							top: top + 4, // 微调垂直对齐
							left: 0, // 靠左
						});

						setActiveNodeInfo({
							pos: resolvedPos.before(currentDepth),
							node: currentNode,
						});
						return;
					}
				}
				currentDepth--;
			}

			// 如果没找到合适的 Block，也保持上一次的状态或者隐藏？
			// 这里选择不隐藏，只有当鼠标移出区域才隐藏
		},
		{ wait: 100 }
	);

	useEffect(() => {
		if (!editor) return;
		if (!editor.view) return;
		const dom = editor?.view?.dom;

		const onMouseLeave = () => {
			// 延迟隐藏，避免移入菜单时消失
			// 实际实现中 Dropdown 展开时会自动处理，这里只需处理基本的 hover 丢失
		};

		dom.addEventListener('mousemove', handleMouseMove);
		dom.addEventListener('mouseleave', onMouseLeave);

		return () => {
			dom.removeEventListener('mousemove', handleMouseMove);
			dom.removeEventListener('mouseleave', onMouseLeave);
		};
	}, [editor, handleMouseMove]);

	const handleDelete = () => {
		if (activeNodeInfo) {
			editor.chain().focus().setNodeSelection(activeNodeInfo.pos).deleteSelection().run();
			setPosition(null);
		}
	};

	const handleCopy = () => {
		if (activeNodeInfo) {
			const text = activeNodeInfo.node.textContent;
			navigator.clipboard.writeText(text);
			// 可以加个 message.success
		}
	};

	const handleInsertAbove = () => {
		if (activeNodeInfo) {
			// insertContentAt 在指定位置插入内容
			editor.chain().focus().insertContentAt(activeNodeInfo.pos, { type: 'paragraph' }).run();
		}
	};

	const handleInsertBelow = () => {
		if (activeNodeInfo) {
			const pos = activeNodeInfo.pos + activeNodeInfo.node.nodeSize;
			editor.chain().focus().insertContentAt(pos, { type: 'paragraph' }).run();
		}
	};

	const handleInsertImage = async () => {
		const file = await selectFile('image/*');
		if (file) {
			const url = await uploadFile(file);
			editor.chain().focus().setImage({ src: url }).run();
		}
	};

	const handleInsertVideo = async () => {
		const file = await selectFile('video/*');
		if (file) {
			const url = await uploadFile(file);
			editor.chain().focus().insertContent(`<video src="${url}" controls style="max-width:100%"></video>`).run();
		}
	};

	const handleInsertAudio = async () => {
		const file = await selectFile('audio/*');
		if (file) {
			const url = await uploadFile(file);
			editor.chain().focus().insertContent(`<audio src="${url}" controls></audio>`).run();
		}
	};

	const handleInsertTable = () => {
		editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
	};

	const getNodeIcon = (node: any) => {
		if (!node) return null;

		switch (node.type.name) {
			case 'heading':
				switch (node.attrs.level) {
					case 1:
						return <Heading1 size={14} color="#666" />;
					case 2:
						return <Heading2 size={14} color="#666" />;
					case 3:
						return <Heading3 size={14} color="#666" />;
					case 4:
						return <Heading4 size={14} color="#666" />;
					case 5:
						return <Heading5 size={14} color="#666" />;
					case 6:
						return <Heading6 size={14} color="#666" />;
					default:
						return <Heading1 size={14} color="#666" />;
				}
			case 'paragraph':
				return <Pilcrow size={14} color="#666" />;
			case 'bulletList':
				return <List size={14} color="#666" />;
			case 'orderedList':
				return <ListOrdered size={14} color="#666" />;
			case 'blockquote':
				return <Quote size={14} color="#666" />;
			case 'codeBlock':
				return <Code size={14} color="#666" />;
			case 'image':
				return <ImageIcon size={14} color="#666" />;
			case 'video':
				return <VideoIcon size={14} color="#666" />;
			case 'audio':
				return <AudioLines size={14} color="#666" />;
			case 'table':
				return <TableOutlined style={{ fontSize: 14, color: '#666' }} />;
			default:
				return <Pilcrow size={14} color="#666" />;
		}
	};

	const menuItems: MenuProps['items'] = [
		{
			key: 'copy',
			label: '复制文本',
			icon: <CopyOutlined />,
			onClick: handleCopy,
		},
		{
			key: 'insert-above',
			label: '在上方插入',
			icon: <PlusOutlined />,
			onClick: handleInsertAbove,
		},
		{
			key: 'insert-below',
			label: '在下方插入',
			icon: <PlusOutlined />, // Reusing PlusOutlined as it fits the "Add" semantic
			onClick: handleInsertBelow,
		},
		{
			type: 'divider',
		},
		{
			key: 'insert-image',
			label: '插入图片',
			icon: <ImageIcon size={14} />,
			onClick: handleInsertImage,
		},
		{
			key: 'insert-video',
			label: '插入视频',
			icon: <VideoIcon size={14} />,
			onClick: handleInsertVideo,
		},
		{
			key: 'insert-audio',
			label: '插入音频',
			icon: <AudioLines size={14} />,
			onClick: handleInsertAudio,
		},
		{
			key: 'insert-table',
			label: '插入表格',
			icon: <TableOutlined />,
			onClick: handleInsertTable,
		},
		{
			type: 'divider',
		},
		{
			key: 'delete',
			label: '删除',
			icon: <DeleteOutlined />,
			danger: true,
			onClick: handleDelete,
		},
	];

	if (!position) return null;

	return (
		<div
			className={styles.sideToolbar}
			style={{
				top: position.top,
				// left: position.left, // left 通过 css 控制或者在这里计算
			}}
			ref={menuRef}
		>
			<Dropdown
				menu={{ items: menuItems }}
				trigger={['click']}
				placement="bottomLeft"
				onOpenChange={(open) => setIsMenuOpen(open)}
			>
				<div
					className={styles.dragHandle}
					style={{ width: 'auto', padding: '0 4px', gap: 4 }}
					draggable
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}
					onMouseDown={onHandleMouseDown}
				>
					{getNodeIcon(activeNodeInfo?.node)}
					<GripVertical size={18} color="#666" />
				</div>
			</Dropdown>
		</div>
	);
};
