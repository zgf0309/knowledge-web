import { Flex, Steps } from 'antd';

interface ImportPageHeaderProps {
	currentStep: number;
}

export const ImportPageHeader = ({ currentStep }: ImportPageHeaderProps) => (
	<Flex vertical gap={18} className="knowledge-import-route__header">
		<Steps current={currentStep} items={[{ title: '定义知识库' }, { title: '导入文件' }]} />
	</Flex>
);
