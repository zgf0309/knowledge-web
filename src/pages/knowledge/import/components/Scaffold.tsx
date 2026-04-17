import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Flex, Steps, Tooltip, Typography } from 'antd';
import type { ReactNode } from 'react';
import type { ImportSelectionOption } from '../types';
import { useNavigate } from '@umijs/max';

const { Text } = Typography;

interface ImportPageHeaderProps {
	currentStep: number;
}

export const ImportPageHeader = ({ currentStep }: ImportPageHeaderProps) => (
	<Flex vertical gap={18} className="knowledge-import-route__header">
		<Steps current={currentStep} items={[{ title: '定义知识库' }, { title: '导入文件' }]} />
	</Flex>
);

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

interface SelectionCardGroupProps<T extends string> {
	options: Array<ImportSelectionOption<T>>;
	value: T;
	onChange: (value: T) => void;
	columns: 2 | 3;
}

export const SelectionCardGroup = <T extends string>({
	options,
	value,
	onChange,
	columns,
}: SelectionCardGroupProps<T>) => (
	<div
		className="knowledge-import-route__card-group"
		style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
	>
		{options.map((option) => {
			const selected = value === option.value;
			const cardClassName = `knowledge-import-route__selection-card${selected ? ' knowledge-import-route__selection-card--active' : ''}`;

			return (
				<button
					key={option.value}
					type="button"
					className={cardClassName}
					onClick={() => {
						onChange(option.value);
					}}
				>
					{option.icon ? (
						<span className="knowledge-import-route__selection-icon">{option.icon}</span>
					) : null}
					<Flex vertical gap={6} flex={1}>
						<Text strong className="knowledge-import-route__selection-title">
							{option.title}
						</Text>
						<Text type="secondary" className="knowledge-import-route__selection-description">
							{option.description}
						</Text>
					</Flex>
				</button>
			);
		})}
	</div>
);

interface ImportFooterProps {
	currentStep: number;
	type: 'import' | 'add';
	onCancel: () => void;
	onPrev: () => void;
	onNext: () => void;
	onSubmit: () => void;
}

export const ImportFooter = ({
	currentStep,
	type,
	onCancel,
	onPrev,
	onNext,
	onSubmit,
}: ImportFooterProps) => {
	const navigate = useNavigate();
	return <Flex justify="space-between" align="center" className="knowledge-import-route__footer">
		<Flex gap={12} className="knowledge-import-route__footer-button">
			
			{currentStep === 0 ? (
				<>
					{
						type === 'add' ? (
							<>
								<Button type="primary" onClick={onNext}>创建并导入</Button>
								<Button onClick={() => { navigate(-1); }}>仅创建</Button>
							</>
						) : (
							<Button type="primary" onClick={onNext}>
							下一步
						</Button>
						)
					}
				</>
			) : (
				<Button type="primary" onClick={onSubmit}>
					确认导入
				</Button>
			)}
      {currentStep === 1 ? <Button onClick={onPrev}>上一步</Button> : null}
		  <Button onClick={onCancel}>取消</Button>
		</Flex>
	</Flex>
};