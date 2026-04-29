import { Drawer } from 'antd';
import type { KnowledgeFileRecord } from '../types';
import { getStatusLabel } from '../utils';

interface KnowledgeDetailDrawerProps {
	record: KnowledgeFileRecord | null;
	onClose: () => void;
}

const detailFields: Array<{ key: keyof KnowledgeFileRecord; label: string; render?: (value: KnowledgeFileRecord) => string }> = [
	{ key: 'doc_name', label: '文件名称' },
	{ key: 'document_id', label: '文件 ID' },
	{ key: 'status', label: '状态', render: (record) => getStatusLabel(record.status as any) },
	{ key: 'token_num', label: '数据量', render: (record) => `${record.token_num ?? 0} 字符` },
	{ key: 'doc_type', label: '文件格式' },
	{ key: 'tags', label: '文件标签', render: (record) => (record.tags?.length ? record.tags.join('、') : '-') },
	{ key: 'doc_metadata', label: '上传人', render: (record) => (record.doc_metadata as any)?.uploader ?? '-' },
	{ key: 'create_time', label: '上传时间', render: (record) => record.create_time ?? '-' },
	{ key: 'parser_config', label: '解析配置', render: (record) => (record.parser_config as any)?.strategy ?? '-' },
	{ key: 'source_type', label: '来源' },
];

const KnowledgeDetailDrawer = ({ record, onClose }: KnowledgeDetailDrawerProps) => (
	<Drawer width={640} title="文档详情" open={Boolean(record)} onClose={onClose} destroyOnHidden>
		{record ? (
			<div className="knowledge-table-list__detail-block">
				{detailFields.map((field) => (
					<div key={field.label} className="knowledge-table-list__detail-item">
						<span className="knowledge-table-list__detail-label">{field.label}</span>
						<span className="knowledge-table-list__detail-value">
							{field.render ? field.render(record) : String(record[field.key])}
						</span>
					</div>
				))}
			</div>
		) : null}
	</Drawer>
);

export default KnowledgeDetailDrawer;