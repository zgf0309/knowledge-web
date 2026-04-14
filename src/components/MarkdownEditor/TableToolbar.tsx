import { FontColorsOutlined } from '@ant-design/icons';
import { ColorPicker, Select, Tooltip } from 'antd';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Maximize, Minimize, Minus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './index.module.less';

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

export const TableToolbar = ({ editor }: { editor: any }) => {
	const [_, forceUpdate] = useState(0);

	useEffect(() => {
		if (!editor) return;

		const handleUpdate = () => {
			forceUpdate((prev) => prev + 1);
		};

		editor.on('selectionUpdate', handleUpdate);
		editor.on('transaction', handleUpdate);

		return () => {
			editor.off('selectionUpdate', handleUpdate);
			editor.off('transaction', handleUpdate);
		};
	}, [editor]);

	if (!editor) return null;

	return (
		<div className={styles.toolbar}>
			<button
				onClick={() => editor.chain().focus().mergeCells().run()}
				title="合并单元格"
				disabled={!editor.can().mergeCells()}
			>
				<Minimize size={16} />
			</button>
			<button
				onClick={() => editor.chain().focus().splitCell().run()}
				title="拆分单元格"
				disabled={!editor.can().splitCell()}
			>
				<Maximize size={16} />
			</button>
			<div className={styles.divider} />
			<Tooltip title="单元格背景">
				<div style={{ padding: '0 4px' }}>
					<ColorPicker
						size="small"
						format="hex"
						allowClear
						value={
							editor.getAttributes('tableCell').backgroundColor || editor.getAttributes('tableHeader').backgroundColor
						}
						onChange={(value, hex) => {
							const color = !value || (typeof value === 'object' && value.cleared) ? null : value.toHexString();
							editor.chain().focus().setCellAttribute('backgroundColor', color).run();
						}}
						onClear={() => {
							editor.chain().focus().setCellAttribute('backgroundColor', null).run();
						}}
						presets={[
							{
								label: '预设颜色',
								colors: [
									'#f5222d',
									'#fa8c16',
									'#fadb14',
									'#52c41a',
									'#1890ff',
									'#722ed1',
									'#eb2f96',
									'#8c8c8c',
									'#000000',
									'#ffffff',
									'transparent',
								],
							},
						]}
					>
						<div
							style={{
								width: 16,
								height: 16,
								background:
									editor.getAttributes('tableCell').backgroundColor ||
									editor.getAttributes('tableHeader').backgroundColor ||
									'#e6e6e6',
								border: '1px solid #d9d9d9',
								borderRadius: 2,
							}}
						/>
					</ColorPicker>
				</div>
			</Tooltip>
			<Tooltip title="字体颜色">
				<div style={{ padding: '0 4px' }}>
					<ColorPicker
						size="small"
						format="hex"
						allowClear
						value={editor.getAttributes('tableCell').color || editor.getAttributes('tableHeader').color}
						onChange={(value, hex) => {
							const color = !value || (typeof value === 'object' && value.cleared) ? null : value.toHexString();
							editor.chain().focus().setCellAttribute('color', color).run();
						}}
						onClear={() => {
							editor.chain().focus().setCellAttribute('color', null).run();
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
								color:
									editor.getAttributes('tableCell').color || editor.getAttributes('tableHeader').color || '#595959',
								fontWeight: 'bold',
								fontSize: '15px',
							}}
						>
							<FontColorsOutlined />
						</span>
					</ColorPicker>
				</div>
			</Tooltip>
			<Tooltip title="字体大小">
				<div style={{ padding: '0 4px', width: 80, color: '#595959' }}>
					<Select
						size="small"
						variant="borderless"
						style={{ width: '100%' }}
						placeholder="字号"
						optionFilterProp="label"
						options={fontSizes}
						value={editor.getAttributes('tableCell').fontSize || editor.getAttributes('tableHeader').fontSize || '14px'}
						onChange={(value) => {
							editor.chain().focus().setCellAttribute('fontSize', value).run();
						}}
					/>
				</div>
			</Tooltip>
			<div className={styles.divider} />
			<button onClick={() => editor.chain().focus().addRowBefore().run()} title="向上插入行">
				<ArrowUp size={16} />
			</button>
			<button onClick={() => editor.chain().focus().addRowAfter().run()} title="向下插入行">
				<ArrowDown size={16} />
			</button>
			<button onClick={() => editor.chain().focus().deleteRow().run()} title="删除行">
				<Minus size={16} />
			</button>
			<div className={styles.divider} />
			<button onClick={() => editor.chain().focus().addColumnBefore().run()} title="向左插入列">
				<ArrowLeft size={16} />
			</button>
			<button onClick={() => editor.chain().focus().addColumnAfter().run()} title="向右插入列">
				<ArrowRight size={16} />
			</button>
			<button onClick={() => editor.chain().focus().deleteColumn().run()} title="删除列">
				<Minus size={16} style={{ transform: 'rotate(90deg)' }} />
			</button>
			<div className={styles.divider} />
			<button onClick={() => editor.chain().focus().deleteTable().run()} title="删除表格">
				<Trash2 size={16} />
			</button>
		</div>
	);
};
