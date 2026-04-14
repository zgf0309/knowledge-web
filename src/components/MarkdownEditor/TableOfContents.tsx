import { Editor } from '@tiptap/react';
import { Popover } from 'antd';
import { List } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './TableOfContents.module.less';

interface TableOfContentsProps {
	editor: Editor | null;
}

interface TocItem {
	id: string;
	text: string;
	level: number;
}

export const TableOfContents = ({ editor }: TableOfContentsProps) => {
	const [items, setItems] = useState<TocItem[]>([]);

	useEffect(() => {
		if (!editor?.view) return;

		// Extract headings from the editor content
		const updateItems = () => {
			const newItems: TocItem[] = [];
			editor.state.doc.descendants((node) => {
				if (node.type.name === 'heading') {
					if (node.attrs?.id && node.textContent.trim()) {
						newItems.push({
							id: node.attrs.id,
							text: node.textContent,
							level: node.attrs.level,
						});
					}
				}
			});
			setItems(newItems);
		};

		// Initial update
		updateItems();

		// Subscribe to editor updates
		editor.on('update', updateItems);

		return () => {
			editor.off('update', updateItems);
		};
	}, [editor?.view]);

	const scrollToHeading = (id: string) => {
		const element = document.querySelector(`[data-id="${id}"]`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	};

	const content = (
		<div className={styles.tocContent}>
			{items.length > 0 ? (
				items.map((item) => (
					<div
						key={item.id}
						className={styles.tocItem}
						style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
						onClick={() => scrollToHeading(item.id)}
						title={item.text}
					>
						{item.text}
					</div>
				))
			) : (
				<div className={styles.empty}>暂无目录</div>
			)}
		</div>
	);

	if (!editor) return null;

	return (
		<Popover content={content} title="目录大纲" placement="right" trigger="hover">
			<div className={styles.floatingButton}>
				<List size={20} />
			</div>
		</Popover>
	);
};
