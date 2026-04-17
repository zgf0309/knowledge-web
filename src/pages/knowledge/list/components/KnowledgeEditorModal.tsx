import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import type {
	KnowledgeBaseRecord,
	KnowledgeFormValues,
} from '../types';

interface KnowledgeEditorModalProps {
	editorOpen: boolean;
	record?: KnowledgeBaseRecord;
	onCancel: () => void;
	onSubmit: (values: KnowledgeFormValues) => Promise<void> | void;
}

const KnowledgeEditorModal = ({
	editorOpen,
	record,
	onCancel,
	onSubmit,
}: KnowledgeEditorModalProps) => {
	const [form] = Form.useForm<KnowledgeFormValues>();

	useEffect(() => {
		if (!editorOpen) {
			return;
		}
		form.setFieldsValue(record ?? {});
	}, [editorOpen, form, record]);

	return (
		<Modal
			open={editorOpen}
			title="编辑知识库"
			onCancel={onCancel}
			onOk={async () => {
				const values = await form.validateFields();
				await onSubmit(values);
			}}
			okText="确定"
			cancelText="取消"
			destroyOnHidden
			afterOpenChange={(open) => {
				if (!open) {
					form.resetFields();
				}
			}}
		>
			<Form<KnowledgeFormValues> initialValues={record} form={form} layout="vertical">
				<Form.Item hidden label="知识库ID" name="knowledge_id">
					<Input maxLength={50} placeholder="请输入知识库ID" />
				</Form.Item>
				<Form.Item label="知识库名称" name="knowledge_name" rules={[{ required: true, message: '请输入知识库名称' }]}>
					<Input maxLength={50} placeholder="请输入知识库名称" />
				</Form.Item>
				<Form.Item label="知识库描述" name="knowledge_desc">
					<Input.TextArea rows={3} maxLength={200} placeholder="请输入知识库描述" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default KnowledgeEditorModal;
