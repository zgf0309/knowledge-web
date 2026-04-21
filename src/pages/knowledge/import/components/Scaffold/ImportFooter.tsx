import { useNavigate } from '@umijs/max';
import { Button, Flex, message } from 'antd';
import { addKnowledgeList } from '@/services/knowledge/api';
import { useImportContext } from '../../context';
import { buildCreateKnowledgePayload } from '../../payload';

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
	const { currentUser, formValues, setTargetKnowledgeId } = useImportContext();

	const createdKnowledgeList = async (submitType: 'import' | 'add') => {
		try {
			const res: any = await addKnowledgeList(buildCreateKnowledgePayload(formValues, currentUser?.tenant_id));
			const { code, data } = res;
			if (code === 200) {
				setTargetKnowledgeId(data?.knowledge_id ?? data?.id ?? '');
				if (submitType === 'import') {
					onNext();
				} else {
					message.success('创建知识库成功');
					navigate(-1);
				}
				return;
			}

			message.error('创建知识库失败');
		} catch {
			message.error('创建知识库失败');
		}
	};

	return <Flex justify="space-between" align="center" className="knowledge-import-route__footer">
		<Flex gap={12} className="knowledge-import-route__footer-button">
			{currentStep === 0 ? (
				<Flex gap={12}>
					{type === 'add' ? (
						<>
							<Button type="primary" onClick={() => { void createdKnowledgeList('import'); }}>创建并导入</Button>
							<Button onClick={() => {
								void createdKnowledgeList('add');
							}}
							>
								仅创建
							</Button>
						</>
					) : (
						<Button type="primary" onClick={onNext}>
							下一步
						</Button>
					)}
				</Flex>
			) : (
				<Button type="primary" onClick={onSubmit}>
					确认导入
				</Button>
			)}
			{currentStep === 1 ? <Button onClick={onPrev}>上一步</Button> : null}
			<Button onClick={onCancel}>取消</Button>
		</Flex>
	</Flex>;
};
