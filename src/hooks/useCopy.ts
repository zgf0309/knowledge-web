import { message } from 'antd';
import copy from 'copy-to-clipboard';

interface CopyOptions {
	format?: 'text/plain' | 'text/html';
}

export const useCopy = () => {
	const onCopy = (text: string, options?: CopyOptions) => {
		copy(text, options);
		message.success('复制成功');
	};

	return {
		onCopy,
	};
};
