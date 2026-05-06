import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  queryKnowledgeGroup,
  queryKnowledgeList,
} from '@/services/knowledge/api';
import type { KnowledgeGroupItem, KnowledgeItem } from '../types';
import { flattenGroups } from '../utils';

export const KNOWLEDGE_PICKER_PAGE_SIZE = 9;

interface UseKnowledgePickerParams {
  tenantId: string;
  value?: string;
  open: boolean;
}

export const useKnowledgePicker = ({
  tenantId,
  value,
  open,
}: UseKnowledgePickerParams) => {
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
        page_size: KNOWLEDGE_PICKER_PAGE_SIZE,
      }),
    enabled: !!tenantId && open,
    select: (raw: any) => ({
      list: (raw?.data?.list ??
        raw?.data?.records ??
        raw?.data ??
        []) as KnowledgeItem[],
      total: Number(raw?.data?.total ?? raw?.total ?? 0),
    }),
  });

  const groupOptions = useMemo(
    () =>
      (groupQuery.data ?? []).map((group: KnowledgeGroupItem) => ({
        label: group.name ?? group.group_name ?? '-',
        value: (group.group_id ?? group.id ?? '') as string,
      })),
    [groupQuery.data],
  );

  const selectedItem = useMemo(
    () =>
      (listQuery.data?.list ?? []).find((item) => item.knowledge_id === value),
    [listQuery.data, value],
  );

  return {
    groupId,
    setGroupId,
    keyword,
    setKeyword,
    page,
    setPage,
    groupOptions,
    selectedItem,
    list: listQuery.data?.list ?? [],
    total: listQuery.data?.total ?? 0,
    groupLoading: groupQuery.isFetching,
    listLoading: listQuery.isFetching,
  };
};
