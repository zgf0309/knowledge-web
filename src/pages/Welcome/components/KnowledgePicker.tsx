import {
  DownOutlined,
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Empty, Input, Pagination, Popover, Select, Spin } from 'antd';
import { useState } from 'react';
import {
  KNOWLEDGE_PICKER_PAGE_SIZE,
  useKnowledgePicker,
} from '../hooks/useKnowledgePicker';
import type { KnowledgeItem } from '../types';

interface KnowledgePickerProps {
  value?: string;
  onChange: (id: string | undefined, item?: KnowledgeItem) => void;
  placeholder?: string;
}

interface KnowledgeCardProps {
  item: KnowledgeItem;
  active: boolean;
  onSelect: (item: KnowledgeItem) => void;
}

const KnowledgeCard = ({ item, active, onSelect }: KnowledgeCardProps) => (
  <button
    type="button"
    key={item.knowledge_id}
    className={`welcome-page__kb-card${active ? ' welcome-page__kb-card--active' : ''}`}
    onClick={() => onSelect(item)}
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

const KnowledgePicker = ({
  value,
  onChange,
  placeholder = '选择知识库',
}: KnowledgePickerProps) => {
  const [open, setOpen] = useState(false);
  const picker = useKnowledgePicker({ value, open });

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
          value={picker.groupId}
          onChange={(nextGroupId) => {
            picker.setGroupId(nextGroupId);
            picker.setPage(1);
          }}
          options={picker.groupOptions}
          loading={picker.groupLoading}
          allowClear
          showSearch
          optionFilterProp="label"
          popupMatchSelectWidth={false}
        />
        <Input
          className="welcome-page__kb-panel-search"
          placeholder="请输入知识库名称"
          prefix={<SearchOutlined />}
          value={picker.keyword}
          onChange={(event) => {
            picker.setKeyword(event.target.value);
            picker.setPage(1);
          }}
          allowClear
        />
      </div>
      <Spin spinning={picker.listLoading}>
        <div className="welcome-page__kb-panel-grid">
          {picker.list.map((item) => (
            <KnowledgeCard
              key={item.knowledge_id}
              item={item}
              active={item.knowledge_id === value}
              onSelect={handleSelect}
            />
          ))}
          {!picker.listLoading && picker.list.length === 0 ? (
            <div className="welcome-page__kb-panel-empty">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无知识库"
              />
            </div>
          ) : null}
        </div>
      </Spin>
      <div className="welcome-page__kb-panel-footer">
        <Pagination
          size="small"
          current={picker.page}
          pageSize={KNOWLEDGE_PICKER_PAGE_SIZE}
          total={picker.total}
          showSizeChanger={false}
          showTotal={(total) => `共 ${total} 条`}
          onChange={picker.setPage}
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
      destroyOnHidden
    >
      <button type="button" className="welcome-page__kb-trigger">
        <span className="welcome-page__kb-trigger-label">
          {picker.selectedItem?.knowledge_name ??
            (value ? '已选知识库' : placeholder)}
        </span>
        <DownOutlined className="welcome-page__kb-trigger-icon" />
      </button>
    </Popover>
  );
};

export default KnowledgePicker;
