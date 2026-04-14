import type { KnowledgeFileRecord } from '../types';

export interface KnowledgeChunkItem {
	id: string;
	label: string;
	sourceType: '原文切片' | '自定义切片';
	charCount: number;
	content: string;
	enabled: boolean;
	statusText: string;
}

export interface KnowledgeInsightItem {
	id: string;
	chunkId: string;
	title: string;
	content: string;
	source: string;
	actionLabel: string;
}

export interface KnowledgePreviewSection {
	title: string;
	paragraphs: string[];
}

export interface KnowledgeDocumentDetail {
	previewTitle: string;
	previewSections: KnowledgePreviewSection[];
	reportContent: string;
	chunks: KnowledgeChunkItem[];
	insights: KnowledgeInsightItem[];
}

const defaultReportContent = `# PPT 编辑器详细设计文档

## 1. 文档概述
本文档用于说明 PPT 编辑器的整体设计方案，覆盖产品定位、功能分层、核心模块、数据模型、异常处理和后续扩展方向，作为开发、测试和维护过程中的统一参照。

## 1.1 文档目的
通过沉淀一份结构化原文报告，明确系统边界、模块职责和协作方式，降低多人协作中的沟通成本，并为后续的功能扩展、问题定位和交付验收提供稳定依据。

## 1.2 产品定位
本产品定位为一款轻量、高效、易用的在线演示文稿编辑工具，兼顾个人办公、课堂演示和小团队内容协作场景，支持从文档导入、内容编辑到导出分享的完整链路。

## 2. 核心能力说明
系统提供幻灯片创建、组件拖拽排版、主题样式配置、动画设置、历史记录管理、文件导出和多人协作等核心能力。
其中，编辑器画布关注交互反馈与排版效率，服务层关注文件转换、素材处理与导出性能，数据层关注文档结构、用户偏好和协作状态的可靠存储。

## 3. 架构设计
整体架构分为三层：
1. UI 交互层：负责画布、侧边栏、工具栏、属性面板以及用户操作反馈。
2. 领域服务层：负责解析、切片、素材管理、动画编排、导出适配等业务逻辑。
3. 数据存储层：负责文档元数据、组件树、历史版本、标签体系和检索索引。

## 4. 关键模块
画布引擎基于 Fabric.js 实现对象绘制、拖拽缩放和图层控制。
动画模块支持入场、强调、退出等多种动画类型，并处理时间轴排序与预览。
导出模块支持 PDF、PPTX 和图片格式输出，同时关注大文件场景下的稳定性。
协作模块负责多用户编辑时的状态同步、冲突提示和权限隔离。

## 5. 维护与扩展建议
在维护层面，建议将页面状态、领域逻辑和纯展示组件分层组织，减少单文件复杂度。
在扩展层面，可继续补充模板中心、素材市场、智能排版、知识图谱联动和检索增强能力。

## 6. 测试与验收
测试范围应覆盖基础交互、批量导入、切片生成、知识点抽取、导出性能和异常恢复。
重点关注边界条件，包括大文档解析失败、协作并发冲突、导出超时和组件渲染回退策略。`;

const defaultPreviewSections: KnowledgePreviewSection[] = [
	{
		title: '1. 文档概述',
		paragraphs: [
			'本文档用于 PPT 编辑器详细设计文档，用于明确产品的整体架构、各模块功能实现、技术选型、交互逻辑及异常处理方案，为开发、测试、运维提供标准化依据，确保开发过程有序推进，最终交付符合需求的高质量 PPT 编辑工具。',
		],
	},
	{
		title: '1.1 文档目的',
		paragraphs: [
			'本文档描述 PPT 编辑器的详细设计文档，用于明确产品的整体架构、各模块功能实现、技术选型、交互逻辑及异常处理方案，为开发、测试、运维提供标准化依据，确保开发过程有序推进，最终交付符合需求的高质量 PPT 编辑工具。',
		],
	},
	{
		title: '1.2 产品定位',
		paragraphs: [
			'本 PPT 编辑器是一款轻量、高效、易用的在线桌面演示文稿制作工具，支持幻灯片的创建、编辑、排版、动画设置、导出、分享等核心功能，兼顾个人用户日常办公、学习演示需求与小团队协作需求。',
		],
	},
	{
		title: '适用范围',
		paragraphs: [
			'本文档适用于参与本 PPT 编辑器开发的前端、后端、测试工程师、产品经理、UI/UX 设计师及运维人员，作为开发实现、测试验证、后期维护的核心参考文档。',
		],
	},
	{
		title: '术语定义',
		paragraphs: [
			'幻灯片：PPT 的核心组成单元，单页演示内容载体。',
			'组件：幻灯片中的可编辑元素，如文本框、图片、形状、表格等。',
			'图层：用于管理幻灯片中组件的显示层级，支持上下移动、隐藏/显示操作。',
			'模板：预设的幻灯片样式集合，包含固定的布局、配色、字体，支持用户复用。',
		],
	},
];

const defaultChunks: KnowledgeChunkItem[] = [
	{
		id: 'chunk-1',
		label: '#1',
		sourceType: '原文切片',
		charCount: 572,
		content:
			'PPT 编辑器详细设计文档。本文档描述 1.1 文档概述 1.1 文档目的 1.2 产品定位。本 PPT 编辑器是一款轻量、高效、易用的在线桌面演示文稿制作工具，支持幻灯片的创建、编辑、排版、动画设置、导出、分享等核心功能。',
		enabled: true,
		statusText: '已启用',
	},
	{
		id: 'chunk-2',
		label: '#2',
		sourceType: '原文切片',
		charCount: 553,
		content:
			'撤销/重做：记录用户操作历史，支持撤销最近操作及恢复已撤销操作。协作编辑：多用户可同时编辑同一 PPT，实时同步操作内容。导出格式：支持将 PPT 导出为 PDF、PPTX、图片等格式。',
		enabled: true,
		statusText: '已启用',
	},
	{
		id: 'chunk-3',
		label: '#3',
		sourceType: '原文切片',
		charCount: 582,
		content:
			'整体架构如下：UI 交互层负责画布、工具栏、属性面板；服务层负责文件解析、素材处理和导出；数据层负责存储文档结构、用户偏好与协作状态。',
		enabled: true,
		statusText: '已启用',
	},
	{
		id: 'chunk-4',
		label: '#4',
		sourceType: '原文切片',
		charCount: 551,
		content:
			'动画服务：负责动画的添加、编辑、删除、播放、预览。管理动画的时序逻辑，支持入场、强调、退出等多种动画类型。',
		enabled: true,
		statusText: '已启用',
	},
	{
		id: 'chunk-5',
		label: '#5',
		sourceType: '原文切片',
		charCount: 576,
		content:
			'绘图引擎：采用 Fabric.js 处理组件的拖拽、缩放、旋转、图层管理，支持复杂图形绘制，可与文本、图片、表格组件统一处理。',
		enabled: true,
		statusText: '已启用',
	},
	{
		id: 'chunk-6',
		label: '#6',
		sourceType: '自定义切片',
		charCount: 118,
		content:
			'性能测试：JMeter、浏览器性能面板、文件导出速率等。',
		enabled: false,
		statusText: '已停用',
	},
];

const defaultInsights: KnowledgeInsightItem[] = [
	{
		id: 'insight-1',
		chunkId: 'chunk-1',
		title: '组件',
		content:
			'幻灯片中的可编辑元素，如文本框、图片、形状、图表、表格等。图层用于管理幻灯片中组件的显示层级，支持上下移动、隐藏/显示操作。',
		source: '来源：原文切片',
		actionLabel: '原文返回',
	},
	{
		id: 'insight-2',
		chunkId: 'chunk-1',
		title: '文档描述',
		content:
			'本文档描述 PPT 编辑器详细设计文档，用于明确产品整体架构、各模块功能实现、技术选型、交互逻辑及异常处理方案。',
		source: '来源：原文切片',
		actionLabel: '原文返回',
	},
	{
		id: 'insight-3',
		chunkId: 'chunk-1',
		title: '适用范围',
		content:
			'适用于参与 PPT 编辑器开发的前端、后端、测试工程师、产品经理、UI/UX 设计师及运维人员，作为开发实现、测试验证、后期维护的核心参考文档。',
		source: '来源：原文切片',
		actionLabel: '原文返回',
	},
	{
		id: 'insight-4',
		chunkId: 'chunk-1',
		title: '模板',
		content:
			'预设的幻灯片样式集合，包含固定布局、配色、字体，支持用户复用。导出格式支持 PDF、PPTX、图片等。',
		source: '来源：原文切片',
		actionLabel: '原文返回',
	},
	{
		id: 'insight-5',
		chunkId: 'chunk-3',
		title: '整体架构',
		content: 'UI 层、服务层、数据层拆分明确，便于后续扩展协作与素材能力。',
		source: '来源：原文切片',
		actionLabel: '原文返回',
	},
];

export const getKnowledgeDocumentDetail = (record?: KnowledgeFileRecord | null): KnowledgeDocumentDetail => {
	if (!record) {
		return {
			previewTitle: '文档详情不存在',
			previewSections: defaultPreviewSections,
			reportContent: defaultReportContent,
			chunks: defaultChunks,
			insights: defaultInsights,
		};
	}

	const previewTitle = `${record.name.replace(/\.pdf|\.docx|\.xlsx|\.txt/gi, '') || record.name}`;

	return {
		previewTitle,
		previewSections: defaultPreviewSections,
		reportContent: defaultReportContent,
		chunks: defaultChunks,
		insights: defaultInsights,
	};
};