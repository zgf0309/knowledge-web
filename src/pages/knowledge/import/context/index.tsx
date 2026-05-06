import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@umijs/max';
import type { UploadProps } from 'antd';
import { Form, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import type { MessageInstance } from 'antd/es/message/interface';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTenantId } from '@/hooks/useTenantId';
import {
  queryEmbeddingModels,
  queryKnowledgeGroup,
} from '@/services/knowledge/api';
import type { KnowledgeGroup } from '../../list/types';
import { buildGroupTree, ensureRootGroup } from '../../list/utils';
import {
  createInitialImportFormValues,
  createUploadProps,
  getUploadFileList,
} from '../formConfig';
import type { EmbeddingModelOption, ImportFormValues } from '../types';

type ImportPageType = 'import' | 'add';

interface ImportLocationState {
  type?: ImportPageType;
  knowledgeId?: string;
}

interface ImportContextValue {
  tenantId: string;
  pageType: ImportPageType;
  targetKnowledgeId: string;
  setTargetKnowledgeId: Dispatch<SetStateAction<string>>;
  form: FormInstance<ImportFormValues>;
  formValues: ImportFormValues;
  initialFormValues: ImportFormValues;
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  messageApi: MessageInstance;
  messageContextHolder: ReactNode;
  uploadProps: UploadProps;
  modelList: EmbeddingModelOption[];
  knowledgeGroup: KnowledgeGroup[];
  getUploadFileList: typeof getUploadFileList;
  goBack: () => void;
  goToKnowledgeList: () => void;
  goToTargetKnowledge: () => void;
}

const ImportContext = createContext<ImportContextValue | null>(null);

export const ImportContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const tenantId = useTenantId();
  const navigate = useNavigate();
  const location = useLocation();
  const locationType = location.state as ImportLocationState | undefined;
  const pageType = locationType?.type ?? 'import';
  const [targetKnowledgeId, setTargetKnowledgeId] = useState(
    locationType?.knowledgeId ?? '',
  );
  const [form] = Form.useForm<ImportFormValues>();
  const [currentStep, setCurrentStep] = useState(pageType === 'add' ? 0 : 1);
  const [messageApi, messageContextHolder] = message.useMessage();
  const initialFormValues = useMemo(() => createInitialImportFormValues(), []);
  const watchedValues = Form.useWatch([], form);
  const formValues = watchedValues ?? initialFormValues;
  const uploadProps = createUploadProps(
    formValues,
    messageApi,
    targetKnowledgeId,
  );
  const [modelList, setModelList] = useState<EmbeddingModelOption[]>([]);

  const { data: modelsList } = useQuery({
    queryKey: ['KnowledgeList'],
    queryFn: () => queryEmbeddingModels({}),
    select: (response: any) => response.data,
  });

  const { data: knowledgeTree } = useQuery({
    queryKey: ['KnowledgeTree', tenantId],
    queryFn: () =>
      queryKnowledgeGroup({
        tenant_id: tenantId,
      }),
    select: (response: any) => response.data,
  });

  const knowledgeGroup = useMemo<KnowledgeGroup[]>(() => {
    return ensureRootGroup(
      buildGroupTree(
        (knowledgeTree?.list as KnowledgeGroup[] | undefined) ?? [],
      ),
    );
  }, [knowledgeTree?.list]);

  useEffect(() => {
    if (Array.isArray(modelsList?.models)) {
      setModelList(modelsList.models);

      const currentEmbeddingModel = form.getFieldValue('embeddingModel');
      const hasMatchedModel = modelsList.models.some(
        (item: EmbeddingModelOption) =>
          item?.model_name === currentEmbeddingModel ||
          item?.value === currentEmbeddingModel,
      );

      if (!hasMatchedModel && modelsList.models[0]) {
        form.setFieldValue(
          'embeddingModel',
          modelsList.models[0].model_name ??
            modelsList.models[0].value ??
            currentEmbeddingModel,
        );
      }
    }
  }, [form, modelsList?.models]);

  const goBack = () => {
    navigate(-1);
  };

  const goToKnowledgeList = () => {
    navigate('/knowledge/list');
  };

  const goToTargetKnowledge = () => {
    if (!targetKnowledgeId) {
      goToKnowledgeList();
      return;
    }

    navigate('/knowledge/index', { state: { knowledgeId: targetKnowledgeId } });
  };

  const contextValue = useMemo<ImportContextValue>(
    () => ({
      tenantId,
      pageType,
      targetKnowledgeId,
      setTargetKnowledgeId,
      form,
      formValues,
      initialFormValues,
      currentStep,
      setCurrentStep,
      messageApi,
      messageContextHolder,
      uploadProps,
      modelList,
      knowledgeGroup,
      getUploadFileList,
      goBack,
      goToKnowledgeList,
      goToTargetKnowledge,
    }),
    [
      tenantId,
      pageType,
      targetKnowledgeId,
      form,
      formValues,
      initialFormValues,
      currentStep,
      messageApi,
      messageContextHolder,
      uploadProps,
      modelList,
      knowledgeGroup,
      setTargetKnowledgeId,
    ],
  );

  return (
    <ImportContext.Provider value={contextValue}>
      {children}
    </ImportContext.Provider>
  );
};

export const useImportContext = () => {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error(
      'useImportContext must be used within ImportContextProvider',
    );
  }

  return context;
};
