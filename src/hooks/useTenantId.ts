import { useMemo } from 'react';
import { getLocalStorage, StorageKeys } from '@/utils/storage';

export const getTenantIdFromStorage = () => {
  const userInfo = (getLocalStorage<{ tenant_id?: string }>(
    StorageKeys.CURRENT_USER,
  ) ?? {}) as { tenant_id?: string };

  return userInfo.tenant_id ?? '';
};

export const useTenantId = () =>
  useMemo(() => {
    return getTenantIdFromStorage();
  }, []);
