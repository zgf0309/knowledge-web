import { InfoCircleOutlined } from '@ant-design/icons';
import { Flex, Tooltip } from 'antd';
import type { ReactNode } from 'react';

interface LabeledRowProps {
	label: ReactNode;
	children: ReactNode;
	alignStart?: boolean;
	tooltip?:
		| ReactNode
		| {
				title: ReactNode;
				color?: string;
				icon?: ReactNode;
				rootClassName?: string;
		  };
}

const renderLabelTooltip = (tooltip?: LabeledRowProps['tooltip']) => {
	if (!tooltip) {
		return null;
	}

	if (typeof tooltip === 'object' && 'title' in tooltip) {
		return (
			<Tooltip
				title={tooltip.title}
				color={tooltip.color}
				classNames={tooltip.rootClassName ? { root: tooltip.rootClassName } : undefined}
			>
				<span className="knowledge-import-route__hint-icon">
					{tooltip.icon ?? <InfoCircleOutlined />}
				</span>
			</Tooltip>
		);
	}

	return (
		<Tooltip title={tooltip}>
			<span className="knowledge-import-route__hint-icon">
				<InfoCircleOutlined />
			</span>
		</Tooltip>
	);
};

export const LabeledRow = ({ label, children, alignStart = false, tooltip }: LabeledRowProps) => (
	<Flex
		gap={16}
		align={alignStart ? 'flex-start' : 'center'}
		wrap
		className="knowledge-import-route__row"
	>
		<Flex align="center" gap={6} className="knowledge-import-route__label" style={alignStart ? { marginTop: 5 } : undefined}>
			<span>{label}</span>
			{renderLabelTooltip(tooltip)}
		</Flex>
		<div className="knowledge-import-route__row-content">{children}</div>
	</Flex>
);
