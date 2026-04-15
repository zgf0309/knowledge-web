
import { ssoLogin } from '@/services/user/api';
import {StorageKeys, getLocalStorage, setLocalStorage, removeLocalStorage} from '@/utils/storage';
const getRedirectUrl = async () => {
  try {
    const url = `${window.location.origin}${window.location.pathname}`;
    const res: any = await ssoLogin({ url });
    console.log('res===>', res);
    const {code, data } = res;
    if (code === 200) {
      return data?.authorization_url || '';
    } else {
      return '';
    }
  } catch (error) {
    console.warn('获取重定向 URL 失败，使用默认登录地址', error);
    return '';
  }
};

export const redirectToLogin = async () => {
  // 检查是否已经在跳转中
  if (getLocalStorage(StorageKeys?.REDIRECTING_TO_LOGIN) === 'true') {
    return;
  }
  // 设置跳转锁
  setLocalStorage(StorageKeys?.REDIRECTING_TO_LOGIN, 'true');
  try {
    const loginUrl = await getRedirectUrl();
    console.log('loginUrl', loginUrl);
    if (!loginUrl) {
      clearRedirectFlag();
      return;
    }
    window.location.href = loginUrl;
  } catch (_error) {
    clearRedirectFlag();
  }
};

// 登录成功回调后清除锁
export const clearRedirectFlag = () => {
  removeLocalStorage(StorageKeys?.REDIRECTING_TO_LOGIN);
};