import { Form, Input, Modal } from 'antd';

interface GroupFormValues {
	name: string;
	description?: string;
	parent_id: string;
}

interface KnowledgeGroupFormModalProps {
	open: boolean;
	title: string;
	confirmLoading: boolean;
	form: any;
	onCancel: () => void;
	onOk: () => void;
}

const KnowledgeGroupFormModal = ({
	open,
	title,
	confirmLoading,
	form,
	onCancel,
	onOk,
}: KnowledgeGroupFormModalProps) => {
	return (
		<Modal
			open={open}
			title={title}
			okText="确定"
			cancelText="取消"
			confirmLoading={confirmLoading}
			onCancel={onCancel}
			onOk={onOk}
		>
			<Form<GroupFormValues> form={form} layout="vertical">
				<Form.Item label="parent_id" name="parent_id">
					<Input disabled />
				</Form.Item>
				<Form.Item label="name" name="name" rules={[{ required: true, message: '请输入 name' }]}>
					<Input maxLength={50} placeholder="请输入 name" />
				</Form.Item>
				<Form.Item label="description" name="description">
					<Input.TextArea rows={3} maxLength={200} placeholder="请输入 description" />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export type { GroupFormValues };
export default KnowledgeGroupFormModal;