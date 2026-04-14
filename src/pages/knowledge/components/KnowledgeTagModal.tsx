import { Form, Modal, Select, Typography } from 'antd';
import type { FormInstance } from 'antd';
import type { TagFormValues } from '../types';

const { Text } = Typography;

interface KnowledgeTagModalProps {
	open: boolean;
	targetCount: number;
	form: FormInstance<TagFormValues>;
	tagOptions: string[];
	onCancel: () => void;
	onSubmit: () => void;
}

const KnowledgeTagModal = ({
	open,
	targetCount,
	form,
	tagOptions,
	onCancel,
	onSubmit,
}: KnowledgeTagModalProps) => (
	<Modal title="标签管理" open={open} onCancel={onCancel} onOk={onSubmit} destroyOnHidden>
		<Form layout="vertical" form={form}>
			<Form.Item label="生效文件数">
				<Text>{targetCount} 个文件</Text>
			</Form.Item>
			<Form.Item name="tags" label="标签">
				<Select
					mode="tags"
					placeholder="请输入或选择标签"
					options={tagOptions.map((value) => ({ label: value, value }))}
				/>
			</Form.Item>
		</Form>
	</Modal>
);

export default KnowledgeTagModal;