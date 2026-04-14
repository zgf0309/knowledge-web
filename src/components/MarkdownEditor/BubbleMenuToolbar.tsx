import { ColorPicker, Popover, Select, Tooltip } from 'antd';
import {
	AudioLines,
	Bold,
	Code,
	Image as ImageIcon,
	Italic,
	List,
	ListOrdered,
	Quote,
	Redo,
	Type,
	Undo,
	Video as VideoIcon,
} from 'lucide-react';
import styles from './index.module.less';
import { selectFile, uploadFile } from './utils';

const fontSizes = [
	{ value: '12px', label: '12px' },
	{ value: '13px', label: '13px' },
	{ value: '14px', label: '14px' },
	{ value: '15px', label: '15px' },
	{ value: '16px', label: '16px' },
	{ value: '18px', label: '18px' },
	{ value: '20px', label: '20px' },
	{ value: '24px', label: '24px' },
];

export const BubbleMenuToolbar = ({ editor }: { editor: any }) => {
	if (!editor) {
		return null;
	}

	const getCurrentHeading = () => {
		if (editor.isActive('heading', { level: 1 })) return 1;
		if (editor.isActive('heading', { level: 2 })) return 2;
		if (editor.isActive('heading', { level: 3 })) return 3;
		if (editor.isActive('heading', { level: 4 })) return 4;
		if (editor.isActive('heading', { level: 5 })) return 5;
		if (editor.isActive('heading', { level: 6 })) return 6;
		return 0;
	};

	const getCurrentList = () => {
		if (editor.isActive('bulletList')) return 'bullet';
		if (editor.isActive('orderedList')) return 'ordered';
		return 'none';
	};

	const addImage = async () => {
		const file = await selectFile('image/*');
		if (file) {
			const url = await uploadFile(file);
			editor.chain().focus().setImage({ src: url }).run();
		}
	};

	const addVideo = async () => {
		const file = await selectFile('video/*');
		if (file) {
			const url = await uploadFile(file);
			editor.chain().focus().insertContent(`<video src="${url}" controls style="max-width:100%"></video>`).run();
		}
	};

	const addAudio = async () => {
		const file = await selectFile('audio/*');
		if (file) {
			const url = await uploadFile(file);
			editor.chain().focus().insertContent(`<audio src="${url}" controls></audio>`).run();
		}
	};

	return (
		<div className={styles.toolbar}>
			<button
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={editor.isActive('bold') ? styles.isActive : ''}
				title="粗体"
			>
				<Bold size={16} />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={editor.isActive('italic') ? styles.isActive : ''}
				title="斜体"
			>
				<Italic size={16} />
			</button>
			<button
				onClick={() => editor.chain().focus().toggleCode().run()}
				className={editor.isActive('code') ? styles.isActive : ''}
				title="行内代码"
			>
				<Code size={16} />
			</button>

			<div className={styles.divider} />

			<Tooltip title="字体颜色">
				<div style={{ padding: '0 4px', display: 'flex', alignItems: 'center' }}>
					<ColorPicker
						size="small"
						format="hex"
						allowClear
						value={editor.getAttributes('textStyle').color}
						onChange={(value, hex) => {
							const color = !value || (typeof value === 'object' && value.cleared) ? null : value.toHexString();
							if (color) {
								editor.chain().focus().setMark('textStyle', { color }).run();
							} else {
								editor.chain().focus().unsetMark('textStyle', { extendEmptyMarkRange: true }).run();
							}
						}}
						onClear={() => {
							editor.chain().focus().unsetMark('textStyle').run();
						}}
						presets={[
							{
								label: '预设颜色',
								colors: ['#000000', '#262626', '#595959', '#8c8c8c', '#bfbfbf', '#f5222d', '#1890ff', '#52c41a'],
							},
						]}
					>
						<span
							style={{
								color: editor.getAttributes('textStyle').color || '#000',
								fontWeight: 'bold',
								fontSize: 14,
								cursor: 'pointer',
							}}
						>
							A
						</span>
					</ColorPicker>
				</div>
			</Tooltip>

			<Tooltip title="字体大小">
				<div style={{ padding: '0 4px', width: 80 }}>
					<Select
						size="small"
						variant="borderless"
						style={{ width: '100%' }}
						placeholder="字号"
						optionFilterProp="label"
						options={fontSizes}
						value={editor.getAttributes('textStyle').fontSize || '14px'}
						onChange={(value) => {
							editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
						}}
						onSelect={(value: any) => {
							editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
						}}
					/>
				</div>
			</Tooltip>

			<div className={styles.divider} />

			<Popover
				trigger="hover"
				placement="bottom"
				overlayInnerStyle={{ padding: '8px 12px' }}
				content={
					<div style={{ display: 'flex', flexDirection: 'column', width: 240, gap: 12 }}>
						<div>
							<div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>文本样式</div>
							<div
								style={{
									display: 'grid',
									gridTemplateColumns: 'repeat(4, 1fr)',
									gap: 4,
								}}
							>
								<button
									style={{
										border: 'none',
										borderRadius: 4,
										background: editor.isActive('paragraph') ? 'rgba(0,0,0,0.06)' : 'transparent',
										color: editor.isActive('paragraph') ? '#1890ff' : 'inherit',
										padding: '4px',
										cursor: 'pointer',
										fontSize: '13px',
									}}
									onClick={() => editor.chain().focus().setParagraph().run()}
								>
									正文
								</button>
								{[1, 2, 3, 4, 5, 6].map((level) => (
									<button
										key={level}
										style={{
											border: 'none',
											borderRadius: 4,
											background: editor.isActive('heading', { level }) ? 'rgba(0,0,0,0.06)' : 'transparent',
											color: editor.isActive('heading', { level }) ? '#1890ff' : 'inherit',
											padding: '4px',
											cursor: 'pointer',
											fontSize: '13px',
											fontWeight: 'bold',
										}}
										onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
									>
										H{level}
									</button>
								))}
							</div>
						</div>

						<div style={{ height: 1, background: '#eee' }} />

						<div>
							<div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>列表与引用</div>
							<div style={{ display: 'flex', gap: 8 }}>
								<Tooltip title="无序列表">
									<button
										style={{
											border: '1px solid #eee',
											borderRadius: 4,
											background: editor.isActive('bulletList') ? '#e6f7ff' : '#fff',
											color: editor.isActive('bulletList') ? '#1890ff' : '#666',
											padding: '6px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flex: 1,
										}}
										onClick={() => editor.chain().focus().toggleBulletList().run()}
									>
										<List size={16} />
									</button>
								</Tooltip>
								<Tooltip title="有序列表">
									<button
										style={{
											border: '1px solid #eee',
											borderRadius: 4,
											background: editor.isActive('orderedList') ? '#e6f7ff' : '#fff',
											color: editor.isActive('orderedList') ? '#1890ff' : '#666',
											padding: '6px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flex: 1,
										}}
										onClick={() => editor.chain().focus().toggleOrderedList().run()}
									>
										<ListOrdered size={16} />
									</button>
								</Tooltip>
								<Tooltip title="引用">
									<button
										style={{
											border: '1px solid #eee',
											borderRadius: 4,
											background: editor.isActive('blockquote') ? '#e6f7ff' : '#fff',
											color: editor.isActive('blockquote') ? '#1890ff' : '#666',
											padding: '6px',
											cursor: 'pointer',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flex: 1,
										}}
										onClick={() => editor.chain().focus().toggleBlockquote().run()}
									>
										<Quote size={16} />
									</button>
								</Tooltip>
							</div>
						</div>
					</div>
				}
			>
				<button title="排版格式">
					<Type size={16} />
				</button>
			</Popover>

			<div className={styles.divider} />

			<button onClick={addImage} title="插入图片">
				<ImageIcon size={16} />
			</button>
			<button onClick={addVideo} title="插入视频">
				<VideoIcon size={16} />
			</button>
			<button onClick={addAudio} title="插入音频">
				<AudioLines size={16} />
			</button>

			<div className={styles.divider} />

			<button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="撤销">
				<Undo size={16} />
			</button>
			<button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="重做">
				<Redo size={16} />
			</button>
		</div>
	);
};
