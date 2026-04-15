declare namespace API {
  	type ApiResponse<T> = {
		/** 后端业务码：0=成功，其它=失败。后端新增 415 等码时兼容 */
		code: number;
		message: string; // 统一后的 message（可能由 msg 归一化而来）
		msg?: string; // 后端有时只返回 msg
		data: T; // 兼容后端错误返回 data:"" 的情况
		/** 可选：请求追踪ID */
		req_id?: string;
		/** 可选：时间戳 */
		timestamp?: number;
    authorization_url?: string; // 兼容后端直接返回 authorization_url 的情况
    state: string;
	};
}