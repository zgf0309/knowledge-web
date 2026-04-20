import { PageContainer } from '@ant-design/pro-components';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Typography } from 'antd';
import { ImportContextProvider, useImportContext } from './context';
import { ImportFooter, ImportPageHeader } from './components/Scaffold';
import {
	ImportOverviewStep,
	ImportParserSection,
	ImportSliceSection,
	ImportSourceSection,
	validateAddOverviewStep,
} from './components/Sections';
import type { ImportFormValues } from './types';
import './index.less';

const { Title } = Typography;

const KnowledgeImportPageContent = () => {
	const {
		pageType,
		currentStep,
		setCurrentStep,
		messageContextHolder,
		form,
		initialFormValues,
		formValues,
		handleSubmit,
		goBack,
		goToKnowledgeList,
	} = useImportContext();

	return (
		<PageContainer
			className="knowledge-import-route"
			title={<Flex align="center" gap={10}>
				<Button type="text" icon={<ArrowLeftOutlined />} onClick={goBack} />
				<Title level={5} className="knowledge-import-route__title">
					{pageType === 'add' ? '创建知识库' : '导入文件'}
				</Title>
			</Flex>}
		>
			{messageContextHolder}
			<div className="knowledge-import-route__shell">
				<Flex vertical gap={20} className="knowledge-import-route__layout">
					<ImportPageHeader currentStep={currentStep} />
					<div className="knowledge-import-route__content">
						<Flex gap={20} className="knowledge-import-route__content-wrapper">
							<Form<ImportFormValues>
								form={form}
								layout="horizontal"
								className="knowledge-import-route__form"
								initialValues={initialFormValues}
								style={{ width: '100%' }}
							>
								{currentStep === 0 ? (
									<ImportOverviewStep />
								) : (
									<Flex vertical gap={24}>
										<ImportSourceSection />
										{formValues.mode === 'byType' ? (
											<>
												<ImportParserSection />
												{formValues.doc_category !== 'table' && formValues.doc_category !== 'image' ? <ImportSliceSection /> : null}
											</>
										) : null}
									</Flex>
								)}
							</Form>
						</Flex>
					</div>
					<ImportFooter
						currentStep={currentStep}
						type={pageType}
						onCancel={() => {
							if (currentStep === 1) {
								setCurrentStep(0);
								return;
							}

							goToKnowledgeList();
						}}
						onPrev={() => {
							setCurrentStep(0);
						}}
						onNext={() => {
							if (pageType === 'add') {
								void validateAddOverviewStep(form).then(() => {
									setCurrentStep(1);
								}).catch(() => undefined);
								return;
							}

							setCurrentStep(1);
						}}
						onSubmit={handleSubmit}
					/>
				</Flex>
			</div>
		</PageContainer>
	);
};

const KnowledgeImportPage = () => (
	<ImportContextProvider>
		<KnowledgeImportPageContent />
	</ImportContextProvider>
);

export default KnowledgeImportPage;
