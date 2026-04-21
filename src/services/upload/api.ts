// @ts-ignore
/* eslint-disable */
import { request } from '@/utils/enhancedRequest';



export async function uploadFile(
  params: {
    // query
    /** file */
    file?: any;
    /** knowledge base id */
    kb_id?: string;
  },
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (params.file) {
    formData.append('file', params.file as Blob);
  }

  if (params.kb_id) {
    formData.append('kb_id', params.kb_id);
  }

  return request<any>('/knowledge-api/api/v1/ai/files/upload', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  });
}