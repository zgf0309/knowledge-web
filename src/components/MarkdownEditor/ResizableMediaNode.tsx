import { DeleteOutlined } from '@ant-design/icons';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { useRef, useState } from 'react';
import styles from './ResizableMediaNode.module.less';

const ResizableMediaNode = (props: NodeViewProps) => {
	const { node, updateAttributes, deleteNode, selected, extension } = props;
	const { src, width, align, height } = node.attrs;
	const [isResizing, setIsResizing] = useState(false);
	const mediaRef = useRef<HTMLElement>(null);
	const resizeStartPos = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

	const resolveAlign = () => {
		switch (align) {
			case 'left':
				return { float: 'left', marginRight: '16px', marginBottom: '16px', clear: 'none', display: 'inline-block' };
			case 'right':
				return { float: 'right', marginLeft: '16px', marginBottom: '16px', clear: 'none', display: 'inline-block' };
			case 'center':
				return { display: 'flex', justifyContent: 'center', margin: '0 auto', clear: 'both', float: 'none' };
			case 'inline':
			default:
				return { display: 'inline-block', verticalAlign: 'middle', margin: '0 4px', float: 'none', clear: 'none' };
		}
	};

	const onMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		const media = mediaRef.current;
		if (!media) return;

		setIsResizing(true);
		resizeStartPos.current = {
			x: e.clientX,
			y: e.clientY,
			width: media.offsetWidth,
			height: media.offsetHeight,
		};

		const onMouseMove = (moveEvent: MouseEvent) => {
			if (!resizeStartPos.current) return;
			const deltaX = moveEvent.clientX - resizeStartPos.current.x;
			const deltaY = moveEvent.clientY - resizeStartPos.current.y;

			const newWidth = Math.max(100, resizeStartPos.current.width + deltaX); // Min 100px
			const newHeight = Math.max(100, resizeStartPos.current.height + deltaY); // Min 100px

			updateAttributes({
				width: `${newWidth}px`,
				height: `${newHeight}px`,
			});
		};

		const onMouseUp = () => {
			setIsResizing(false);
			resizeStartPos.current = null;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	};

	const renderContent = () => {
		const style = {
			width: width || '100%',
			height: height || 'auto',
			maxWidth: '100%',
			display: 'block',
		};

		if (node.type.name === 'image') {
			return <img ref={mediaRef as any} src={src} style={style} className={styles.media} alt="" />;
		} else if (node.type.name === 'video') {
			return <video ref={mediaRef as any} src={src} controls style={style} className={styles.media} />;
		} else if (node.type.name === 'audio') {
			// Audio usually fixed height, mostly resizing width
			return (
				<audio ref={mediaRef as any} src={src} controls style={{ width: width || '100%' }} className={styles.media} />
			);
		}
		return null;
	};

	const isInline = align === 'inline' || align === 'left' || align === 'right' || !align;

	return (
		<NodeViewWrapper as={isInline ? 'span' : 'div'} className={styles.resizableNodeView} style={resolveAlign() as any}>
			<div className={`${styles.mediaContainer} ${selected ? styles.selected : ''}`}>
				{selected && (
					<div className={styles.toolbar}>
						<button
							type="button"
							className={`${styles.actionBtn} ${align === 'left' ? styles.active : ''}`}
							onClick={() => updateAttributes({ align: 'left' })}
							title="左对齐 (环绕)"
						>
							<AlignLeft size={16} />
						</button>
						<button
							type="button"
							className={`${styles.actionBtn} ${align === 'center' ? styles.active : ''}`}
							onClick={() => updateAttributes({ align: 'center' })}
							title="居中 (独占)"
						>
							<AlignCenter size={16} />
						</button>
						<button
							type="button"
							className={`${styles.actionBtn} ${align === 'right' ? styles.active : ''}`}
							onClick={() => updateAttributes({ align: 'right' })}
							title="右对齐 (环绕)"
						>
							<AlignRight size={16} />
						</button>
						<div className={styles.divider} />
						<button type="button" className={styles.deleteBtn} onClick={deleteNode} title="删除">
							<DeleteOutlined />
						</button>
					</div>
				)}

				{renderContent()}

				{selected && node.type.name !== 'audio' && <div className={styles.resizeHandle} onMouseDown={onMouseDown} />}
			</div>
		</NodeViewWrapper>
	);
};

export default ResizableMediaNode;
