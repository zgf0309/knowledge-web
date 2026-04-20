import { Flex, Form } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useImportContext } from '../context';
import type { ImportFormValues } from '../types';
import {
	fileTypeSelectionOptions,
	knowledgeConfigRows,
	knowledgeDefinitionRows,
} from '../viewConfig';
import { ImportParserSection, ImportSliceSection } from './ParserSections';
import { ImportSection, LabeledRow, SelectionCardGroup } from './Scaffold';
import { ImportWebSourceFields } from './WebImportFields';
import {
	AddOverviewDescriptionField,
	AddOverviewEmbeddingModelField,
	AddOverviewGroupField,
	AddOverviewNameField,
	FileUploaderField,
	ImportModeField,
	ImportSourceTypeField,
	OverviewValueRows,
	renderRequiredLabel,
	TagSelectionField,
	TemplateTypeField,
} from './FormComponents';
import { shouldShowWebConfig } from '../formConfig';

const addStepFieldNames: Array<keyof ImportFormValues> = ['knowledge_name', 'group_id', 'embeddingModel'];

const AddOverviewStep = () => (
	<Flex vertical gap={28} className="knowledge-import-route__overview knowledge-import-route__overview--add">
		<ImportSection title="定义知识库">
			<Flex vertical gap={20} className="knowledge-import-route__overview-body">
				<AddOverviewNameField />
				<AddOverviewDescriptionField />
				<AddOverviewGroupField />
			</Flex>
		</ImportSection>
		<ImportSection title="配置知识库">
			<Flex vertical gap={20} className="knowledge-import-route__overview-body">
				<AddOverviewEmbeddingModelField />
			</Flex>
		</ImportSection>
	</Flex>
);

export const ImportOverviewStep = () => {
	const { pageType } = useImportContext();

	return <>
		{pageType === 'import' ? (
			<Flex vertical gap={28} className="knowledge-import-route__overview">
				<ImportSection title="定义知识库">
					<OverviewValueRows rows={knowledgeDefinitionRows} />
				</ImportSection>
				<ImportSection title="配置知识库">
					<OverviewValueRows rows={knowledgeConfigRows} />
				</ImportSection>
			</Flex>
		) : (
			<AddOverviewStep />
		)}
	</>;
};

export const validateAddOverviewStep = async (form: FormInstance<ImportFormValues>) => {
	await form.validateFields(addStepFieldNames);
};

export const ImportSourceSection = () => {
	const { form, formValues } = useImportContext();

	return (
		<ImportSection title="导入文件源">
			<Flex vertical gap={16}>
				<ImportModeField />
				{formValues.mode === 'byType' ? (
					<LabeledRow label={renderRequiredLabel('选择文件类型')} alignStart>
						<Form.Item name="doc_category" hidden>
							<input />
						</Form.Item>
						<SelectionCardGroup
							options={fileTypeSelectionOptions}
							value={formValues.doc_category}
							onChange={(value) => {
								form.setFieldValue('doc_category', value);
							}}
							columns={3}
						/>
					</LabeledRow>
				) : (
					<TemplateTypeField />
				)}
				<ImportSourceTypeField />
				{shouldShowWebConfig(formValues) ? <ImportWebSourceFields /> : null}
				<FileUploaderField />
				<TagSelectionField />
			</Flex>
		</ImportSection>
	);
};

export { ImportParserSection, ImportSliceSection };
