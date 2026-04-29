import { DownOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Empty, Input, Pagination, Popover, Select, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { queryKnowledgeGroup, queryKnowledgeList } from '@/services/knowledge/api';

interface KnowledgeItem {
	knowledge_id: string;
	knowledge_name: string;
	description?: string;
}

interface GroupItem {
	group_id?: string;
	id?: string;
	name?: string;
	group_name?: string;
	children?: GroupItem[];
}

interface KnowledgePickerProps {
	tenantId: string;
	value?: string;
	onChange: (id: string | undefined, item?: KnowledgeItem) => void;
	placeholder?: string;
}

const PAGE_SIZE = 9;

const flattenGroups = (groups: GroupItem[] = [], acc: GroupItem[] = []): GroupItem[] => {
	for (const g of groups) {
		acc.push(g);
		if (g.children?.length) flattenGroups(g.children, acc);
	}
	return acc;
};

const KnowledgePicker = ({ tenantId, value, onChange, placeholder = '选择知识库' }: KnowledgePickerProps) => {
	const [open, setOpen] = useState(false);
	const [groupId, setGroupId] = useState<string | undefined>(undefined);
	const [keyword, setKeyword] = useState('');
	const [page, setPage] = useState(1);

	const groupQuery = useQuery({
		queryKey: ['ComposerKnowledgeGroup', tenantId],
		queryFn: () => queryKnowledgeGroup({ tenant_id: tenantId }),
		enabled: !!tenantId && open,
		select: (raw: any) => {
			const list = raw?.data?.list ?? raw?.data ?? [];
			return flattenGroups(Array.isArray(list) ? list : []);
		},
	});

	const listQuery = useQuery({
		queryKey: ['ComposerKnowledgeList', tenantId, groupId, keyword, page],
		queryFn: () =>
			queryKnowledgeList({
				tenant_id: tenantId,
				group_id: groupId,
				knowledge_name: keyword || undefined,
				page_num: page,
				page_size: PAGE_SIZE,
			}),
		enabled: !!tenantId && open,
		select: (raw: any) => ({
			list: (raw?.data?.list ?? raw?.data?.records ?? raw?.data ?? []) as KnowledgeItem[],
			total: Number(raw?.data?.total ?? raw?.total ?? 0),
		}),
	});

	const groupOptions = useMemo(
		() =>
			(groupQuery.data ?? []).map((g) => ({
				label: g.name ?? g.group_name ?? '-',
				value: (g.group_id ?? g.id ?? '') as string,
			})),
		[groupQuery.data],
	);

	const selectedItem = useMemo(
		() => (listQuery.data?.list ?? []).find((i) => i.knowledge_id === value),
		[listQuery.data, value],
	);

	const handleSelect = (item: KnowledgeItem) => {
		onChange(item.knowledge_id, item);
		setOpen(false);
	};

	const panel = (
		<div className="welcome-page__kb-panel">
			<div className="welcome-page__kb-panel-header">
				<span className="welcome-page__kb-panel-title">选择知识库</span>
				<Select
					className="welcome-page__kb-panel-group"
					placeholder="群组"
					value={groupId}
					onChange={(val) => {
						setGroupId(val);
						setPage(1);
					}}
					options={groupOptions}
					loading={groupQuery.isFetching}
					allowClear
					showSearch
					optionFilterProp="label"
					popupMatchSelectWidth={false}
				/>
				<Input
					className="welcome-page__kb-panel-search"
					placeholder="请输入知识库名称"
					prefix={<SearchOutlined />}
					value={keyword}
					onChange={(e) => {
						setKeyword(e.target.value);
						setPage(1);
					}}
					allowClear
				/>
			</div>
			<Spin spinning={listQuery.isFetching}>
				<div className="welcome-page__kb-panel-grid">
					{(listQuery.data?.list ?? []).map((item) => {
						const active = item.knowledge_id === value;
						return (
							<button
								type="button"
								key={item.knowledge_id}
								className={`welcome-page__kb-card${active ? ' welcome-page__kb-card--active' : ''}`}
								onClick={() => handleSelect(item)}
							>
								<div className="welcome-page__kb-card-header">
									<span className="welcome-page__kb-card-icon">
										<FileTextOutlined />
									</span>
									<span className="welcome-page__kb-card-title">{item.knowledge_name}</span>
								</div>
								<div className="welcome-page__kb-card-desc">
									{item.description || item.knowledge_name}
								</div>
							</button>
						);
					})}
					{!listQuery.isFetching && (listQuery.data?.list ?? []).length === 0 ? (
						<div className="welcome-page__kb-panel-empty">
							<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无知识库" />
						</div>
					) : null}
				</div>
			</Spin>
			<div className="welcome-page__kb-panel-footer">
				<Pagination
					size="small"
					current={page}
					pageSize={PAGE_SIZE}
					total={listQuery.data?.total ?? 0}
					showSizeChanger={false}
					showTotal={(total) => `共 ${total} 条`}
					onChange={setPage}
				/>
			</div>
		</div>
	);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			trigger="click"
			placement="bottomLeft"
			arrow={false}
			content={panel}
			overlayClassName="welcome-page__kb-popover"
			align={{ offset: [0, 10] }}
			destroyTooltipOnHide
		>
			<button type="button" className="welcome-page__kb-trigger">
				<span className="welcome-page__kb-trigger-label">
					{selectedItem?.knowledge_name ?? (value ? '已选知识库' : placeholder)}
				</span>
				<DownOutlined className="welcome-page__kb-trigger-icon" />
			</button>
		</Popover>
	);
};

export default KnowledgePicker;
