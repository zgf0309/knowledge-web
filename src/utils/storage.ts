/**
 * 本地存储管理工具
 * 统一管理 localStorage 的 Key 和操作
 */

export enum StorageKeys {
  // 认证 Token
  ACCESS_TOKEN = 'access_token',
  // 刷新 Token
  REFRESH_TOKEN = 'refresh_token',
  // 认证code
  CODE = 'code',
  // 登录状态
  STATE = 'state',
  // 用户信息
  CURRENT_USER = 'current_user',
  // 主题设置
  CHILD_LAYOUT_SETTINGS = 'childLayoutSettings',
  // 重定向标识
  REDIRECTING_TO_LOGIN = '__redirecting_to_login__',
}

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const setLocalStorage = <T>(key: StorageKeys | string, value: T): void => {
  if (!isBrowser) {
    return;
  }

  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Failed to set localStorage item: ${key}`, error);
  }
};

export const getLocalStorage = <T>(key: StorageKeys | string): T | string | null => {
  if (!isBrowser) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`Failed to get localStorage item: ${key}`, error);
    return null;
  }
};

export const removeLocalStorage = (key: StorageKeys | string): void => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove localStorage item: ${key}`, error);
  }
};
