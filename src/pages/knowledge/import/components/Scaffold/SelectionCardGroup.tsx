import { Flex, Typography } from 'antd';
import type { ImportSelectionOption } from '../../types';

const { Text } = Typography;

interface SelectionCardGroupProps<T extends string> {
	options: Array<ImportSelectionOption<T>>;
	value: T;
	onChange: (value: T) => void;
	columns: 2 | 3 | 4;
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
