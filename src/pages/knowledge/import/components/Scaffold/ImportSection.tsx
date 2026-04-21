import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

interface ImportSectionProps {
	title: string;
	children: ReactNode;
}

export const ImportSection = ({ title, children }: ImportSectionProps) => (
	<Flex vertical gap={18}>
		<Flex align="center" gap={8}>
			<span className="knowledge-import-route__marker" />
			<Text strong>{title}</Text>
		</Flex>
		{children}
	</Flex>
);
