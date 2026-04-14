type MicroAppProps = {
  storagePrefix?: string;
  subAppName?: string;
  settings?: any;
};

type WujieWindow = Window & {
  $wujie?: {
    props?: MicroAppProps;
    bus: any;
  };
  __KNOWLEDGE_APP_STORAGE_PATCHED__?: boolean;
};

const STORAGE_TYPES = ['localStorage', 'sessionStorage'] as const;
const STORAGE_SEPARATOR = ':';

export const getWindowObject = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window as WujieWindow;
};

export const getMicroAppProps = (): MicroAppProps => {
  const currentWindow = getWindowObject();

  return currentWindow?.$wujie?.props ?? {};
};

export const getStorageNamespace = (): string => {
  const { storagePrefix, subAppName } = getMicroAppProps();
  const namespace = storagePrefix?.trim() || subAppName?.trim() || '';

  return namespace.replace(new RegExp(`${STORAGE_SEPARATOR}+$`), '');
};

const toScopedKey = (key: string, namespace: string) => {
  if (!namespace || key.startsWith(`${namespace}${STORAGE_SEPARATOR}`)) {
    return key;
  }

  return `${namespace}${STORAGE_SEPARATOR}${key}`;
};

const fromScopedKey = (key: string, namespace: string) => {
  const scopedPrefix = `${namespace}${STORAGE_SEPARATOR}`;

  if (!namespace || !key.startsWith(scopedPrefix)) {
    return key;
  }

  return key.slice(scopedPrefix.length);
};

const getScopedKeys = (storage: Storage, originalKey: typeof Storage.prototype.key, namespace: string) => {
  const scopedPrefix = `${namespace}${STORAGE_SEPARATOR}`;
  const keys: string[] = [];

  for (let index = 0; index < storage.length; index += 1) {
    const storageKey = originalKey.call(storage, index);

    if (storageKey?.startsWith(scopedPrefix)) {
      keys.push(storageKey);
    }
  }

  return keys;
};

const patchStorageType = (storage: Storage, namespace: string) => {
  const originalGetItem = storage.getItem.bind(storage);
  const originalSetItem = storage.setItem.bind(storage);
  const originalRemoveItem = storage.removeItem.bind(storage);
  const originalClear = storage.clear.bind(storage);
  const originalKey = storage.key.bind(storage);

  storage.getItem = (key: string) => originalGetItem(toScopedKey(key, namespace));
  storage.setItem = (key: string, value: string) => {
    originalSetItem(toScopedKey(key, namespace), value);
  };
  storage.removeItem = (key: string) => {
    originalRemoveItem(toScopedKey(key, namespace));
  };
  storage.clear = () => {
    if (!namespace) {
      originalClear();
      return;
    }

    getScopedKeys(storage, originalKey, namespace).forEach((key) => {
      originalRemoveItem(key);
    });
  };
  storage.key = (index: number) => {
    if (!namespace) {
      return originalKey(index);
    }

    const scopedKeys = getScopedKeys(storage, originalKey, namespace);
    const scopedKey = scopedKeys[index];

    return scopedKey ? fromScopedKey(scopedKey, namespace) : null;
  };
};

export const installScopedStorage = () => {
  const currentWindow = getWindowObject();
   
  if (!currentWindow || currentWindow.__KNOWLEDGE_APP_STORAGE_PATCHED__) {
    return;
  }
  const namespace = getStorageNamespace();

  if (!namespace) {
    return;
  }

  STORAGE_TYPES.forEach((storageType) => {
    patchStorageType(currentWindow[storageType], namespace);
  });

  currentWindow.__KNOWLEDGE_APP_STORAGE_PATCHED__ = true;
};