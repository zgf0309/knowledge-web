export type AssistantMode = 'search' | 'qa';

export interface AssistantModeOption {
	key: AssistantMode;
	label: string;
	icon: string;
	placeholder: string;
}

export const ASSISTANT_MODES: AssistantModeOption[] = [
	{
		key: 'search',
		label: '智能搜索',
		icon: '🔎',
		placeholder: '输入你想了解的问题，智能检索全网信息',
	},
	{
		key: 'qa',
		label: '知识问答',
		icon: '💡',
		placeholder: '输入问题，智能返回高质量回答',
	},
];

export const DEFAULT_SUGGESTION_GROUPS: string[][] = [
	['得到贴心帮助', '怎样快速缓解疲劳？'],
	['掌握生活妙招', '厨房油污怎么清理？'],
	['获取专业建议', '如何制定每周健身计划？'],
	['提升工作效率', '如何高效整理会议纪要？'],
];
