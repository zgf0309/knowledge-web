// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/enhancedRequest';
export async function ssoLogin(
  params: {
    // query
    /** url */
    url?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/auth/sso/login', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function ssoCallback(
  params: {
    // query
    /** code */
    code?: string;
    /** state */
    state?: string;
  },
  options?: { [key: string]: any },
) {
  return request<any>('/knowledge-api/api/v1/auth/sso/callback', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function outLogin(options?: { [key: string]: any }) {
  return request<any>('/knowledge-api/api/v1/auth/sso/logout', {
    method: 'GET',
    ...(options || {}),
  });
}
