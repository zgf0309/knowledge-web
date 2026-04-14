import { Drawer } from 'antd';
import type { KnowledgeFileRecord } from '../types';
import { getStatusLabel } from '../utils';

interface KnowledgeDetailDrawerProps {
	record: KnowledgeFileRecord | null;
	onClose: () => void;
}

const detailFields: Array<{ key: keyof KnowledgeFileRecord; label: string; render?: (value: KnowledgeFileRecord) => string }> = [
	{ key: 'name', label: '文件名称' },
	{ key: 'id', label: '文件 ID' },
	{ key: 'status', label: '状态', render: (record) => getStatusLabel(record.status) },
	{ key: 'dataSize', label: '数据量', render: (record) => `${record.dataSize} 字符` },
	{ key: 'format', label: '文件格式' },
	{ key: 'tags', label: '文件标签', render: (record) => (record.tags.length ? record.tags.join('、') : '-') },
	{ key: 'uploader', label: '上传人' },
	{ key: 'uploadedAt', label: '上传时间' },
	{ key: 'parserConfig', label: '解析配置' },
	{ key: 'sourceType', label: '来源' },
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