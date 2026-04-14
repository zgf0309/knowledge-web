import { Form, Input, Modal, Select } from 'antd';
import type { ChunkEditorModalProps } from '../types';

const ChunkEditorModal = ({
	open,
	editingChunkId,
	form,
	onCancel,
	onSubmit,
}: ChunkEditorModalProps) => (
	<Modal
		title={editingChunkId ? '编辑切片' : '新建切片'}
		open={open}
		onCancel={onCancel}
		onOk={onSubmit}
		okText={editingChunkId ? '保存' : '创建'}
		destroyOnHidden
	>
		<Form form={form} layout="vertical">
			<Form.Item name="sourceType" label="切片类型" rules={[{ required: true, message: '请选择切片类型' }]}>
				<Select
					options={[
						{ label: '原文切片', value: '原文切片' },
						{ label: '自定义切片', value: '自定义切片' },
					]}
				/>
			</Form.Item>
			<Form.Item
				name="content"
				label="切片内容"
				rules={[
					{ required: true, message: '请输入切片内容' },
					{ min: 10, message: '切片内容至少 10 个字符' },
				]}
			>
				<Input.TextArea rows={6} placeholder="请输入切片内容" showCount maxLength={1500} />
			</Form.Item>
		</Form>
	</Modal>
);

export default ChunkEditorModal;