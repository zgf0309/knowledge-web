import { Checkbox, Flex, Form, Typography } from 'antd';
import type { ImportCheckboxCardOption } from '../types';

const { Text } = Typography;

interface FormOptionCardsProps {
	options: ImportCheckboxCardOption[];
	columns?: number;
}

const renderOptionCheckbox = (option: ImportCheckboxCardOption) => {
	if (option.fieldName) {
		return (
			<Form.Item name={option.fieldName} valuePropName="checked" noStyle>
				<Checkbox disabled={option.disabled}>{option.title}</Checkbox>
			</Form.Item>
		);
	}

	return (
		<Checkbox checked={option.checked} disabled={option.disabled}>
			{option.title}
		</Checkbox>
	);
};

const renderOptionRadio = (option: ImportCheckboxCardOption) => {
	if (option.fieldName) {
		return (
			<Form.Item name={option.fieldName} valuePropName="checked" noStyle>
				<Checkbox disabled={option.disabled}>{option.title}</Checkbox>
			</Form.Item>
		);
	}

	return (
		<Checkbox checked={option.checked} disabled={option.disabled}>
			{option.title}
		</Checkbox>
	)
}

export const FormOptionCards = ({ options, columns = 3 }: FormOptionCardsProps) => (
	<Flex gap={12} style={{
		display: 'grid',
		gridTemplateColumns: `repeat(${columns}, minmax(0px, 1fr))`
	}}>
		{options.map((option) => (
			<div
				key={option.key}
				className="knowledge-import-route__info-card"
			>
				{renderOptionCheckbox(option)}
				<Text type="secondary">{option.description}</Text>
			</div>
		))}
	</Flex>
);

export const FormRadioOptionCards = ({ options, columns = 3 }: FormOptionCardsProps) => (
	<Flex gap={12} style={{
		display: 'grid',
		gridTemplateColumns: `repeat(${columns}, minmax(0px, 1fr))`
	}}>
		{options.map((option) => (
			<div
				key={option.key}
				className="knowledge-import-route__info-card"
			>
				{renderOptionRadio(option)}
				<Text type="secondary">{option.description}</Text>
			</div>
		))}
	</Flex>
);