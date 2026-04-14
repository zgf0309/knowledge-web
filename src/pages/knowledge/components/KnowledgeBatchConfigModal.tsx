import { Form, Modal, Select, Typography } from 'antd';
import type { FormInstance } from 'antd';
import type { BatchConfigValues } from '../types';

const { Text } = Typography;

interface KnowledgeBatchConfigModalProps {
	open: boolean;
	targetCount: number;
	form: FormInstance<BatchConfigValues>;
	parserOptions: string[];
	onCancel: () => void;
	onSubmit: () => void;
}

const KnowledgeBatchConfigModal = ({
	open,
	targetCount,
	form,
	parserOptions,
	onCancel,
	onSubmit,
}: KnowledgeBatchConfigModalProps) => (
	<Modal
		title="批量修改解析配置"
		open={open}
		onCancel={onCancel}
		onOk={onSubmit}
		destroyOnHidden
	>
		<Form layout="vertical" form={form}>
			<Form.Item label="生效文件数">
				<Text>{targetCount} 个文件</Text>
			</Form.Item>
			<Form.Item
				name="parserConfig"
				label="解析策略"
				rules={[{ required: true, message: '请选择解析策略' }]}
			>
				<Select options={parserOptions.map((value) => ({ label: value, value }))} />
			</Form.Item>
		</Form>
	</Modal>
);

export default KnowledgeBatchConfigModal;