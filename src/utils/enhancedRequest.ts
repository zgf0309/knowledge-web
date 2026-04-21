import {
	getLocalStorage,
	removeLocalStorage,
	setLocalStorage,
	StorageKeys,
} from '@/utils/storage';
import type { RequestOptions } from '@@/plugin-request/request';
import { request as umiRequest } from '@umijs/max';
import { message } from 'antd';

/**
 * 增强版请求配置
 * 支持自动添加认证信息、错误重试等功能
 */
const NAME_SPACE = 'knowledge-app';
const DEFAULT_TIMEOUT = 24 * 60 * 60 * 1000;
const AUTO_LOGOUT_FLAG = '__AUTO_LOGOUT_TRIGGERED__';
const CURRENT_USER: any = getLocalStorage<string>(StorageKeys.CURRENT_USER);
const TENANT_ID = CURRENT_USER?.tenant_id || '';

type RequestResult<T> = API.ApiResponse<T> | Blob;
type HeaderValue = string | number | boolean;
export type EnhancedRequestOptions = RequestOptions & {}
type AuthWindow = Window & {
	[AUTO_LOGOUT_FLAG]?: boolean;
};

const getAuthWindow = (): AuthWindow | undefined => {
	if (typeof window === 'undefined') {
		return undefined;
	}

	return window as AuthWindow;
};

const hasTriggeredAutoLogout = (): boolean => Boolean(getAuthWindow()?.[AUTO_LOGOUT_FLAG]);

const markAutoLogoutTriggered = (): void => {
	const authWindow = getAuthWindow();

	if (authWindow) {
		authWindow[AUTO_LOGOUT_FLAG] = true;
	}
};

const getStoredAccessToken = (): string => {
	try {
		const accessToken = getLocalStorage<string>(`${StorageKeys.ACCESS_TOKEN}`);
		return typeof accessToken === 'string' ? accessToken : '';
	} catch (error) {
		console.warn('Failed to get stored access token:', error);
		return '';
	}
};

const clearStoredAccessToken = (): void => {
	removeLocalStorage(`${NAME_SPACE}${StorageKeys.ACCESS_TOKEN}`);
};

const triggerAutoLogout = (warningText?: string): void => {
	if (hasTriggeredAutoLogout()) {
		return;
	}

	markAutoLogoutTriggered();
	clearStoredAccessToken();

	if (warningText) {
		message.warning(warningText);
	}
};

const normalizeResponse = <T>(response: API.ApiResponse<T>): API.ApiResponse<T> => {
	const normalizedMessage = response.message || response.msg || '';
	const normalizedResponse = {
		...response,
		message: normalizedMessage,
		data: response.data ? response.data : (null as T),
	};

	return normalizedResponse;
};

const createRequestOptions = (options: EnhancedRequestOptions): RequestOptions => {
	const isFormDataRequest = typeof FormData !== 'undefined' && options.data instanceof FormData;
	const headers: Record<string, HeaderValue> = {
		...(isFormDataRequest ? {} : { 'Content-Type': 'application/json' }),
		...(options.headers as Record<string, HeaderValue> | undefined),
	};
	const accessToken = getStoredAccessToken();

	if (accessToken) {
		headers.token = accessToken;
		headers.Authorization = `Bearer ${accessToken}`;
		headers.tenant_id = TENANT_ID;
	}

	return {
		...options,
		timeout: options.timeout ?? DEFAULT_TIMEOUT,
		headers,
	};
};

export const buildAuthHeaders = (): Record<string, HeaderValue> => {
	return createRequestOptions({}).headers as Record<string, HeaderValue>;
};

const handleBusinessError = (response: API.ApiResponse<unknown>): never => {
	if (Number(response.code) === 401) {
		triggerAutoLogout('登录已失效，请重新登录');
	}

	throw new Error(response.message || '请求失败，请稍后重试');
};

const handleRequestError = (
	error: any,
): void => {
	if ((error?.type === 'Timeout' || /timeout/i.test(error?.message || ''))) {
		message.error('请求超时，请检查网络或稍后重试');
	}

	if (error?.response?.status === 401) {
		console.warn(`Authentication failed (${error?.response?.status}), auto logout.`);
		triggerAutoLogout('登录已失效，请重新登录');
	}

	if (error?.response?.status === 500) {
		message.error('服务器异常，请稍后重试');
	}
};

/**
 * 统一的请求函数
 */
export async function request<T>(
	url: string,
	options: EnhancedRequestOptions = {}
): Promise<RequestResult<T>> {
	const requestOptions = createRequestOptions(options);

	try {
		const response = await umiRequest<RequestResult<T>>(url, requestOptions);
		console.log('Request successful:', response );
		if (response instanceof Blob) {
			return response;
		}

		const normalizedResponse = normalizeResponse(response);

		if (normalizedResponse.code === 200) {
			return normalizedResponse;
		}

		return handleBusinessError(normalizedResponse);
	} catch (error: any) {
		handleRequestError(error);
		throw error;
	}
}

/**
 * GET请求的便捷方法
 */
export function get<T = any>(
	url: string,
	params?: Record<string, unknown>,
	options?: EnhancedRequestOptions
) {
	return request<T>(url, {
		method: 'GET',
		params,
		...options,
	});
}

/**
 * POST请求的便捷方法
 */
export function post<T = any>(
	url: string,
	data?: unknown,
	options?: EnhancedRequestOptions
) {
	return request<T>(url, {
		method: 'POST',
		data,
		...options,
	});
}

/**
 * PUT请求的便捷方法
 */
export function put<T = any>(
	url: string,
	data?: unknown,
	options?: EnhancedRequestOptions
) {
	return request<T>(url, {
		method: 'PUT',
		data,
		...options,
	});
}

/**
 * DELETE请求的便捷方法
 */
export function del<T = any>(url: string, options?: EnhancedRequestOptions) {
	return request<T>(url, {
		method: 'DELETE',
		...options,
	});
}

/**
 * 更新认证Token并保存到存储
 */
export function updateAuthTokens(accessToken: string) {
	setLocalStorage(StorageKeys.ACCESS_TOKEN, accessToken);
}

/**
 * 获取当前的认证Token
 */
export function getAuthTokens() {
	return getStoredAccessToken();
}

/**
 * 清除认证Token
 */
export function clearAuthTokens() {
	clearStoredAccessToken();
}

// 默认导出request函数
export default request;
