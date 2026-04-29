import { Form, Input, Modal } from 'antd';
import type { InsightEditorModalProps } from '../types';

const InsightEditorModal = ({
	open,
	editingInsightId,
	form,
	initialValues,
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
		<Form form={form} layout="vertical" initialValues={initialValues}>
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
		</Form>
	</Modal>
);

export default InsightEditorModal;