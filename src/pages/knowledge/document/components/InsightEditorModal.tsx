import { Form, Input, Modal } from 'antd';
import type { InsightEditorModalProps } from '../types';

const InsightEditorModal = ({
	open,
	editingInsightId,
	form,
	onCancel,
	onSubmit,
}: InsightEditorModalProps) => (
	<Modal
		title={editingInsightId ? '编辑知识点' : '新建知识点'}
		open={open}
		onCancel={onCancel}
		onOk={onSubmit}
		okText={editingInsightId ? '保存' : '创建'}
		destroyOnHidden
	>
		<Form form={form} layout="vertical">
			<Form.Item
				name="title"
				label="知识点标题"
				rules={[
					{ required: true, message: '请输入知识点标题' },
					{ min: 2, message: '知识点标题至少 2 个字符' },
				]}
			>
				<Input placeholder="请输入知识点标题" maxLength={100} />
			</Form.Item>
			<Form.Item
				name="content"
				label="知识点内容"
				rules={[
					{ required: true, message: '请输入知识点内容' },
					{ min: 10, message: '知识点内容至少 10 个字符' },
				]}
			>
				<Input.TextArea rows={5} placeholder="请输入知识点内容" showCount maxLength={1000} />
			</Form.Item>
			<Form.Item name="source" label="来源说明" rules={[{ required: true, message: '请输入来源说明' }]}>
				<Input placeholder="例如：来源：原文切片" maxLength={100} />
			</Form.Item>
			<Form.Item name="actionLabel" label="动作文案" rules={[{ required: true, message: '请输入动作文案' }]}>
				<Input placeholder="例如：原文返回" maxLength={50} />
			</Form.Item>
		</Form>
	</Modal>
);

export default InsightEditorModal;