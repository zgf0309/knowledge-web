import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import {
	EMBEDDING_MODEL_PRESETS,
	EMBEDDING_MODEL_OPTIONS,
	INITIAL_EDITOR_STATE,
	SOURCE_OPTIONS,
} from '../constants';
import type {
	KnowledgeBaseRecord,
	KnowledgeEditorState,
	KnowledgeFormValues,
} from '../types';

interface KnowledgeEditorModalProps {
	editorState: KnowledgeEditorState;
	record?: KnowledgeBaseRecord;
	groupOptions: Array<{ label: string; value: string }>;
	defaultGroupKey?: string;
	onCancel: () => void;
	onSubmit: (values: KnowledgeFormValues) => Promise<void> | void;
}

const KnowledgeEditorModal = ({
	editorState,
	record,
	groupOptions,
	defaultGroupKey,
	onCancel,
	onSubmit,
}: KnowledgeEditorModalProps) => {
	const [form] = Form.useForm<KnowledgeFormValues>();

	useEffect(() => {
		if (!editorState.open) {
			return;
		}

		if (editorState.mode === INITIAL_EDITOR_STATE.mode) {
			form.setFieldsValue({
				groupKey: defaultGroupKey,
				sourceType: SOURCE_OPTIONS[0],
				embeddingModel: EMBEDDING_MODEL_OPTIONS[0],
			});
			return;
		}

		if (record) {
			form.setFieldsValue({
				name: record.name,
				description: record.description,
				groupKey: record.groupKey,
				sourceType: record.sourceType,
				embeddingModel: record.embeddingModel,
				clusterName: record.clusterName === '-' ? undefined : record.clusterName,
			});
		}
	}, [defaultGroupKey, editorState, form, record]);

	return (
		<Modal
			open={editorState.open}
			title={editorState.mode === 'create' ? '创建知识库' : '编辑知识库'}
			onCancel={onCancel}
			onOk={async () => {
				const values = await form.validateFields();
				await onSubmit(values);
			}}
			okText={editorState.mode === 'create' ? '创建' : '保存'}
			cancelText="取消"
			destroyOnHidden
			afterOpenChange={(open) => {
				if (!open) {
					form.resetFields();
				}
			}}
		>
			<Form<KnowledgeFormValues> form={form} layout="vertical">
				<Form.Item label="知识库名称" name="name" rules={[{ required: true, message: '请输入知识库名称' }]}>
					<Input maxLength={50} placeholder="请输入知识库名称" />
				</Form.Item>
				<Form.Item label="描述" name="description">
					<Input.TextArea rows={3} maxLength={200} placeholder="请输入知识库描述" />
				</Form.Item>
				<Form.Item label="所属群组" name="groupKey" rules={[{ required: true, message: '请选择所属群组' }]}>
					<Select options={groupOptions} placeholder="请选择所属群组" />
				</Form.Item>
				<Form.Item label="托管资源" name="sourceType" rules={[{ required: true, message: '请选择托管资源' }]}>
					<Select options={SOURCE_OPTIONS.map((item) => ({ label: item, value: item }))} />
				</Form.Item>
				<Form.Item label="向量模型" name="embeddingModel" rules={[{ required: true, message: '请选择向量模型' }]}>
					<Select
						options={EMBEDDING_MODEL_PRESETS.map((item) => ({ label: item.title, value: item.value }))}
					/>
				</Form.Item>
				<Form.Item label="集群实例名称" name="clusterName">
					<Input placeholder="不填则显示为 -" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default KnowledgeEditorModal;
