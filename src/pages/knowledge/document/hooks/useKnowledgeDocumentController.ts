import { Form, Modal, message } from 'antd';
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import type { KnowledgeFileRecord } from '../../types';
import type { KnowledgeChunkItem, KnowledgeDocumentDetail } from '../mock';
import type { ChunkFormValues, InsightFormValues, KnowledgeDocumentState } from '../types';
import { CHUNK_PAGE_SIZE, getChunkSourceSummary, normalizeChunks } from '../utils';

interface UseKnowledgeDocumentControllerOptions {
	detail: KnowledgeDocumentDetail;
	record?: KnowledgeFileRecord;
}

const chunkCreateInitialValues: ChunkFormValues = {
	sourceType: '自定义切片',
	content: '',
};

const insightCreateInitialValues: InsightFormValues = {
	title: '',
	content: '',
	source: '来源：原文切片',
	actionLabel: '原文返回',
};

export const useKnowledgeDocumentController = ({
	detail,
}: UseKnowledgeDocumentControllerOptions): KnowledgeDocumentState => {
	const [chunkForm] = Form.useForm<ChunkFormValues>();
	const [insightForm] = Form.useForm<InsightFormValues>();
	const [messageApi, messageContextHolder] = message.useMessage();
	const [modal, modalContextHolder] = Modal.useModal();
	const [searchKeyword, setSearchKeyword] = useState('');
	const deferredKeyword = useDeferredValue(searchKeyword);
	const [sourceFilter, setSourceFilter] = useState<'全部' | '原文切片' | '自定义切片'>('全部');
	const [statusFilter, setStatusFilter] = useState<'全部状态' | '已启用' | '已停用'>('全部状态');
	const [chunkModalOpen, setChunkModalOpen] = useState(false);
	const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
	const [insightModalOpen, setInsightModalOpen] = useState(false);
	const [editingInsightId, setEditingInsightId] = useState<string | null>(null);
	const [chunkPage, setChunkPage] = useState(1);
	const [chunks, setChunks] = useState<KnowledgeChunkItem[]>(() => normalizeChunks(detail.chunks));
	const [insights, setInsights] = useState(() => detail.insights);
	const [activeChunkId, setActiveChunkId] = useState(detail.chunks[0]?.id ?? '');

	useEffect(() => {
		const nextChunks = normalizeChunks(detail.chunks);
		setChunks(nextChunks);
		setInsights(detail.insights);
		setActiveChunkId(nextChunks[0]?.id ?? '');
		setSearchKeyword('');
		setSourceFilter('全部');
		setStatusFilter('全部状态');
		setChunkPage(1);
		setChunkModalOpen(false);
		setEditingChunkId(null);
		chunkForm.resetFields();
		setInsightModalOpen(false);
		setEditingInsightId(null);
		insightForm.resetFields();
	}, [chunkForm, detail, insightForm]);

	const filteredChunks = useMemo(() => {
		const keyword = deferredKeyword.trim().toLowerCase();

		return chunks.filter((item) => {
			const matchesKeyword =
				!keyword ||
				[item.label, item.content, item.sourceType].some((value) => value.toLowerCase().includes(keyword));
			const matchesSource = sourceFilter === '全部' || item.sourceType === sourceFilter;
			const matchesStatus = statusFilter === '全部状态' || item.statusText === statusFilter;

			return matchesKeyword && matchesSource && matchesStatus;
		});
	}, [chunks, deferredKeyword, sourceFilter, statusFilter]);

	const pagedChunks = useMemo(() => {
		const startIndex = (chunkPage - 1) * CHUNK_PAGE_SIZE;
		return filteredChunks.slice(startIndex, startIndex + CHUNK_PAGE_SIZE);
	}, [chunkPage, filteredChunks]);

	useEffect(() => {
		setChunkPage(1);
	}, [deferredKeyword, sourceFilter, statusFilter]);

	useEffect(() => {
		const totalPages = Math.max(1, Math.ceil(filteredChunks.length / CHUNK_PAGE_SIZE));
		setChunkPage((current) => Math.min(current, totalPages));
	}, [filteredChunks.length]);

	const currentChunkId = useMemo(() => {
		if (filteredChunks.some((item) => item.id === activeChunkId)) {
			return activeChunkId;
		}

		return filteredChunks[0]?.id ?? '';
	}, [activeChunkId, filteredChunks]);

	const visibleInsights = useMemo(
		() => insights.filter((item) => item.chunkId === currentChunkId),
		[currentChunkId, insights],
	);

	const chunkSourceSummary = useMemo(() => getChunkSourceSummary(chunks), [chunks]);

	const handleSearchChange = (value: string) => {
		startTransition(() => {
			setSearchKeyword(value);
		});
	};

	const openCreateModal = () => {
		setEditingChunkId(null);
		chunkForm.setFieldsValue(chunkCreateInitialValues);
		setChunkModalOpen(true);
	};

	const openEditModal = (chunk: KnowledgeChunkItem) => {
		setEditingChunkId(chunk.id);
		chunkForm.setFieldsValue({
			sourceType: chunk.sourceType,
			content: chunk.content,
		});
		setChunkModalOpen(true);
	};

	const closeChunkModal = () => {
		setChunkModalOpen(false);
		setEditingChunkId(null);
		chunkForm.resetFields();
	};

	const handleSubmitChunk = async () => {
		const values = await chunkForm.validateFields();
		const content = values.content.trim();

		if (editingChunkId) {
			setChunks((current) =>
				normalizeChunks(
					current.map((item) =>
						item.id === editingChunkId
							? {
								...item,
								sourceType: values.sourceType,
								content,
							}
							: item,
					),
				),
			);
			messageApi.success('切片已更新');
		} else {
			const nextId = `chunk-${Date.now()}`;
			const nextChunk: KnowledgeChunkItem = {
				id: nextId,
				label: '',
				sourceType: values.sourceType,
				content,
				charCount: content.length,
				enabled: true,
				statusText: '已启用',
			};

			setChunks((current) => normalizeChunks([nextChunk, ...current]));
			setActiveChunkId(nextId);
			setChunkPage(1);
			messageApi.success('切片已创建');
		}

		closeChunkModal();
	};

	const handleToggleChunk = (chunkId: string, enabled: boolean) => {
		setChunks((current) =>
			normalizeChunks(
				current.map((item) =>
					item.id === chunkId
						? {
							...item,
							enabled,
						}
						: item,
				),
			),
		);
		messageApi.success(enabled ? '切片已启用' : '切片已停用');
	};

	const handleCopyChunk = (chunk: KnowledgeChunkItem) => {
		const copiedChunk: KnowledgeChunkItem = {
			...chunk,
			id: `chunk-${Date.now()}`,
			label: '',
			content: `${chunk.content}（副本）`,
		};

		setChunks((current) => {
			const targetIndex = current.findIndex((item) => item.id === chunk.id);
			const nextChunks = [...current];
			nextChunks.splice(targetIndex + 1, 0, copiedChunk);
			return normalizeChunks(nextChunks);
		});
		setActiveChunkId(copiedChunk.id);
		setChunkPage(1);
		messageApi.success('切片已复制');
	};

	const handleDeleteChunk = (chunk: KnowledgeChunkItem) => {
		modal.confirm({
			title: `确认删除 ${chunk.label} 吗？`,
			content: '删除后不可恢复，关联知识点将不再展示。',
			okText: '删除',
			cancelText: '取消',
			okButtonProps: { danger: true },
			onOk: () => {
				setChunks((current) => normalizeChunks(current.filter((item) => item.id !== chunk.id)));
				setInsights((current) => current.filter((item) => item.chunkId !== chunk.id));
				if (activeChunkId === chunk.id) {
					setActiveChunkId('');
				}
				messageApi.success('切片已删除');
			},
		});
	};

	const openCreateInsightModal = () => {
		if (!currentChunkId) {
			messageApi.warning('请先选择一个切片');
			return;
		}

		setEditingInsightId(null);
		insightForm.setFieldsValue(insightCreateInitialValues);
		setInsightModalOpen(true);
	};

	const openEditInsightModal = (insightId: string) => {
		const target = insights.find((item) => item.id === insightId);
		if (!target) {
			return;
		}

		setEditingInsightId(insightId);
		insightForm.setFieldsValue({
			title: target.title,
			content: target.content,
			source: target.source,
			actionLabel: target.actionLabel,
		});
		setInsightModalOpen(true);
	};

	const closeInsightModal = () => {
		setInsightModalOpen(false);
		setEditingInsightId(null);
		insightForm.resetFields();
	};

	const handleSubmitInsight = async () => {
		const values = await insightForm.validateFields();
		const normalizedValues = {
			title: values.title.trim(),
			content: values.content.trim(),
			source: values.source.trim(),
			actionLabel: values.actionLabel.trim(),
		};

		if (editingInsightId) {
			setInsights((current) =>
				current.map((item) =>
					item.id === editingInsightId
						? {
							...item,
							...normalizedValues,
						}
						: item,
				),
			);
			messageApi.success('知识点已更新');
		} else {
			setInsights((current) => [
				{
					id: `insight-${Date.now()}`,
					chunkId: currentChunkId,
					...normalizedValues,
				},
				...current,
			]);
			messageApi.success('知识点已创建');
		}

		closeInsightModal();
	};

	const handleDeleteInsight = (insightId: string) => {
		const target = insights.find((item) => item.id === insightId);
		if (!target) {
			return;
		}

		modal.confirm({
			title: `确认删除知识点“${target.title}”吗？`,
			content: '删除后不可恢复。',
			okText: '删除',
			cancelText: '取消',
			okButtonProps: { danger: true },
			onOk: () => {
				setInsights((current) => current.filter((item) => item.id !== insightId));
				messageApi.success('知识点已删除');
			},
		});
	};

	return {
		detail,
		chunks,
		insights,
		filteredChunks,
		pagedChunks,
		visibleInsights,
		chunkSourceSummary,
		currentChunkId,
		searchKeyword,
		sourceFilter,
		statusFilter,
		chunkPage,
		chunkModalOpen,
		editingChunkId,
		insightModalOpen,
		editingInsightId,
		chunkForm,
		insightForm,
		messageContextHolder,
		modalContextHolder,
		handleSearchChange,
		setSourceFilter,
		setStatusFilter,
		setChunkPage,
		setActiveChunkId,
		openCreateModal,
		openEditModal,
		closeChunkModal,
		handleSubmitChunk,
		handleToggleChunk,
		handleCopyChunk,
		handleDeleteChunk,
		openCreateInsightModal,
		openEditInsightModal,
		closeInsightModal,
		handleSubmitInsight,
		handleDeleteInsight,
	};
};