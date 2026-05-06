import { PageContainer } from '@ant-design/pro-components';
import { useLocation, useNavigate } from '@umijs/max';
import { Divider, Flex, Form, Modal, message } from 'antd';
import dayjs from 'dayjs';
import type { Key } from 'react';
import { startTransition, useMemo, useState } from 'react';
import KnowledgeHeader from './components/KnowledgeHeader';
import KnowledgeTable from './components/KnowledgeTable';
import KnowledgeTagModal from './components/KnowledgeTagModal';
import KnowledgeToolbar from './components/KnowledgeToolbar';
import { TAG_OPTIONS } from './constants';
import type {
  KnowledgeBaseInfo,
  KnowledgeFileRecord,
  TagFormValues,
} from './types';
import { getUniqueTags } from './utils';
import './index.less';
import { useQuery } from '@tanstack/react-query';
import { useTenantId } from '@/hooks/useTenantId';
import {
  delKnowledgeDoc,
  queryKnowledgeDocList,
} from '@/services/knowledge/api';

const KnowledgePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | { knowledgeId?: string; knowledgeName?: string }
    | undefined;
  const knowledgeId = locationState?.knowledgeId;
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [tagTargetKeys, setTagTargetKeys] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [tagForm] = Form.useForm<TagFormValues>();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const tenantId = useTenantId();
  const {
    data: knowledgeDocList,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'KnowledgeDocList',
      pagination,
      searchKeyword,
      knowledgeId,
      tenantId,
    ],
    queryFn: () =>
      queryKnowledgeDocList({
        tenant_id: tenantId,
        knowledge_id: knowledgeId || '',
        document_name: searchKeyword,
        status: undefined,
        page_num: pagination.current,
        page_size: pagination.pageSize,
      }),
    select: (s: any) => s.data,
  });

  const records = useMemo<KnowledgeFileRecord[]>(
    () => (knowledgeDocList?.list as KnowledgeFileRecord[] | undefined) ?? [],
    [knowledgeDocList?.list],
  );
  const knowledgeUpdatedAt = useMemo(() => {
    if (!records.length) {
      return '-';
    }

    const latestUpdateTime = Math.max(
      ...records.map((item) => Number(item.update_time || 0)),
    );
    if (!latestUpdateTime) {
      return '-';
    }

    return dayjs(latestUpdateTime).format('YYYY-MM-DD HH:mm:ss');
  }, [records]);

  const knowledgeBase = useMemo<KnowledgeBaseInfo>(
    () => ({
      id: knowledgeId || '',
      name: locationState?.knowledgeName || '知识库文档列表',
      sourceType: '共享资源',
      updatedAt: knowledgeUpdatedAt,
      description: `文档数量：${knowledgeDocList?.total || 0}`,
    }),
    [
      knowledgeDocList?.total,
      knowledgeId,
      knowledgeUpdatedAt,
      locationState?.knowledgeName,
    ],
  );

  const closeTagModal = () => {
    setTagModalOpen(false);
    setTagTargetKeys([]);
    tagForm.resetFields();
  };

  const openTagModal = (keys: string[], tags?: string[]) => {
    if (!keys.length) {
      messageApi.warning('请先选择要管理标签的文件');
      return;
    }

    const mergedTags = tags ?? getUniqueTags(records, keys);

    setTagTargetKeys(keys);
    tagForm.setFieldsValue({ tags: mergedTags });
    setTagModalOpen(true);
  };

  const handleSearchChange = (value: string) => {
    startTransition(() => {
      setSearchKeyword(value);
      setPagination((current) => ({
        ...current,
        current: 1,
      }));
    });
  };

  const handleRefresh = () => {
    void refetch();
  };

  const handleCopyKnowledgeId = async () => {
    try {
      await navigator.clipboard.writeText(knowledgeBase.id);
      messageApi.success('知识库 ID 已复制');
    } catch {
      messageApi.error('复制失败，请手动复制');
    }
  };

  const handleDelete = (keys: string[]) => {
    if (!keys.length) {
      messageApi.warning('请先选择要删除的文件');
      return;
    }

    modal.confirm({
      title: `确认删除 ${keys.length} 个文件吗？`,
      content: '删除后列表会立即更新，该操作不可撤销。',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        const params: any = {
          doc_ids: keys || [],
          tenant_id: tenantId,
        };
        const res: any = await delKnowledgeDoc(params);
        if (res?.code === 200) {
          setSelectedRowKeys([]);
          refetch();
          messageApi.success('删除成功');
        } else {
          messageApi.error(res?.msg || '删除失败，请稍后重试');
        }

        messageApi.warning('删除接口暂未接入');
      },
    });
  };

  const handleSubmitTags = async () => {
    const values = await tagForm.validateFields();
    console.log('tagForm===>', values);
    messageApi.warning('标签更新接口暂未接入');
  };

  const handleOpenDocument = (record: KnowledgeFileRecord) => {
    navigate(`/knowledge/document`, { state: { record } });
  };

  return (
    <PageContainer className="knowledge-table-list-page" title={false}>
      {messageContextHolder}
      {modalContextHolder}
      <Flex vertical gap={20}>
        <KnowledgeHeader
          knowledgeBase={knowledgeBase}
          knowledgeUpdatedAt={knowledgeUpdatedAt}
          onCopyKnowledgeId={handleCopyKnowledgeId}
        />
        <Divider className="knowledge-table-list__divider" />
        <Flex vertical gap={20} className="knowledge-table-list__content">
          <KnowledgeToolbar
            knowledgeId={knowledgeId || ''}
            searchKeyword={searchKeyword}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
          />
          <KnowledgeTable
            isLoading={isLoading}
            records={records}
            selectedRowKeys={selectedRowKeys}
            currentPage={pagination.current}
            pageSize={pagination.pageSize}
            total={knowledgeDocList?.total || 0}
            onSelectionChange={setSelectedRowKeys}
            onPageChange={(page, pageSize) => {
              setPagination({ current: page, pageSize });
            }}
            onOpenDocument={handleOpenDocument}
            onOpenTagModal={openTagModal}
            onDelete={handleDelete}
          />
        </Flex>
      </Flex>
      <KnowledgeTagModal
        open={tagModalOpen}
        targetCount={tagTargetKeys.length}
        form={tagForm}
        tagOptions={TAG_OPTIONS}
        onCancel={closeTagModal}
        onSubmit={handleSubmitTags}
      />
    </PageContainer>
  );
};

export default KnowledgePage;
