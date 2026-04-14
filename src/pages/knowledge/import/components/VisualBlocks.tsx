import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';
import { IMPORT_TEMPLATE_OPTIONS } from '../../constants';
import type { ImportFormValues } from '../types';

const { Text } = Typography;

type TemplateDescription = (typeof IMPORT_TEMPLATE_OPTIONS)[number];

export const templateDescriptions = IMPORT_TEMPLATE_OPTIONS.reduce<
	Record<ImportFormValues['templateType'], TemplateDescription>
>((map, item) => {
	map[item.value] = item;
	return map;
}, {} as Record<ImportFormValues['templateType'], TemplateDescription>);

const lawDocumentTemplatePreview = (
	<div className="knowledge-import-route__template-preview knowledge-import-route__template-preview--law">
		<Flex vertical gap={12} className="knowledge-import-route__law-preview-doc">
			<Text className="knowledge-import-route__law-preview-title">中华人民共和国海商法</Text>
			<div className="knowledge-import-route__law-preview-block knowledge-import-route__law-preview-block--toc">
				<div className="knowledge-import-route__law-preview-heading">目录</div>
				<div className="knowledge-import-route__law-preview-line knowledge-import-route__law-preview-line--medium" />
				<div className="knowledge-import-route__law-preview-line knowledge-import-route__law-preview-line--short" />
			</div>
			<div className="knowledge-import-route__law-preview-block">
				<div className="knowledge-import-route__law-preview-article">第一章</div>
				<div className="knowledge-import-route__law-preview-line knowledge-import-route__law-preview-line--short" />
				<div className="knowledge-import-route__law-preview-article">第二条</div>
				<div className="knowledge-import-route__law-preview-line knowledge-import-route__law-preview-line--long" />
				<div className="knowledge-import-route__law-preview-article">第三条</div>
				<div className="knowledge-import-route__law-preview-line knowledge-import-route__law-preview-line--medium" />
			</div>
		</Flex>
		<div className="knowledge-import-route__template-preview-arrow" />
		<Flex vertical gap={12} className="knowledge-import-route__template-preview-result knowledge-import-route__template-preview-result--law">
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--law">
				<div className="knowledge-import-route__template-result-tag">切片1</div>
				<div className="knowledge-import-route__law-result-title">第一章</div>
				<div className="knowledge-import-route__law-result-line knowledge-import-route__law-result-line--strong" />
				<div className="knowledge-import-route__law-result-line" />
			</div>
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--law">
				<div className="knowledge-import-route__template-result-tag">切片2</div>
				<div className="knowledge-import-route__law-result-title">第一章</div>
				<div className="knowledge-import-route__law-result-line knowledge-import-route__law-result-line--strong" />
				<div className="knowledge-import-route__law-result-line knowledge-import-route__law-result-line--medium" />
			</div>
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--law">
				<div className="knowledge-import-route__template-result-tag">切片3</div>
				<div className="knowledge-import-route__law-result-title">第一章</div>
				<div className="knowledge-import-route__law-result-line knowledge-import-route__law-result-line--strong" />
				<div className="knowledge-import-route__law-result-line knowledge-import-route__law-result-line--short" />
			</div>
		</Flex>
	</div>
);

const contractTemplatePreview = (
	<div className="knowledge-import-route__template-preview knowledge-import-route__template-preview--contract">
		<Flex vertical gap={10} className="knowledge-import-route__contract-preview-doc">
			<Text className="knowledge-import-route__contract-preview-company">XXX（北京）有限公司</Text>
			<Text className="knowledge-import-route__contract-preview-title">咨询服务合同</Text>
			<div className="knowledge-import-route__contract-preview-sheet">
				<div className="knowledge-import-route__contract-preview-row">
					<span>甲方：</span>
					<div className="knowledge-import-route__contract-preview-fill knowledge-import-route__contract-preview-fill--long" />
				</div>
				<div className="knowledge-import-route__contract-preview-row">
					<span>乙方：</span>
					<div className="knowledge-import-route__contract-preview-fill knowledge-import-route__contract-preview-fill--medium" />
				</div>
				<div className="knowledge-import-route__contract-preview-row">
					<span>签订日期：</span>
					<div className="knowledge-import-route__contract-preview-fill knowledge-import-route__contract-preview-fill--short" />
					<div className="knowledge-import-route__contract-preview-date-gap" />
					<div className="knowledge-import-route__contract-preview-fill knowledge-import-route__contract-preview-fill--tiny" />
					<div className="knowledge-import-route__contract-preview-date-gap" />
					<div className="knowledge-import-route__contract-preview-fill knowledge-import-route__contract-preview-fill--tiny" />
				</div>
				<div className="knowledge-import-route__contract-preview-row">
					<span>签订地点：</span>
					<div className="knowledge-import-route__contract-preview-fill knowledge-import-route__contract-preview-fill--long" />
				</div>
			</div>
		</Flex>
		<div className="knowledge-import-route__template-preview-arrow" />
		<Flex vertical gap={10} className="knowledge-import-route__template-preview-result knowledge-import-route__template-preview-result--contract">
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--contract">
				<div className="knowledge-import-route__template-result-tag">切片1</div>
				<div className="knowledge-import-route__contract-result-title">1.服务期限：自合同签订之日起</div>
				<div className="knowledge-import-route__contract-result-line knowledge-import-route__contract-result-line--long" />
			</div>
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--contract">
				<div className="knowledge-import-route__template-result-tag">切片2</div>
				<div className="knowledge-import-route__contract-result-title">2.违约责任应具备的条件：</div>
				<div className="knowledge-import-route__contract-result-line knowledge-import-route__contract-result-line--medium" />
			</div>
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--contract">
				<div className="knowledge-import-route__template-result-tag">切片3</div>
				<div className="knowledge-import-route__contract-result-title">3.支付节点要求的条件下：</div>
				<div className="knowledge-import-route__contract-result-line knowledge-import-route__contract-result-line--medium" />
			</div>
		</Flex>
	</div>
);

const resumeTemplatePreview = (
	<div className="knowledge-import-route__template-preview knowledge-import-route__template-preview--resume">
		<Flex vertical gap={10} className="knowledge-import-route__resume-preview-doc">
			<Flex justify="space-between" align="center" className="knowledge-import-route__resume-preview-head">
				<div className="knowledge-import-route__resume-preview-contact">
					<div className="knowledge-import-route__resume-preview-name" />
					<div className="knowledge-import-route__resume-preview-mail" />
				</div>
				<div className="knowledge-import-route__resume-preview-avatar" />
			</Flex>
			<div className="knowledge-import-route__resume-preview-section">
				<div className="knowledge-import-route__resume-preview-section-title">教育经历</div>
				<div className="knowledge-import-route__resume-preview-line knowledge-import-route__resume-preview-line--medium" />
			</div>
			<div className="knowledge-import-route__resume-preview-section">
				<div className="knowledge-import-route__resume-preview-section-title">工作经历</div>
				<div className="knowledge-import-route__resume-preview-line knowledge-import-route__resume-preview-line--short" />
				<div className="knowledge-import-route__resume-preview-line knowledge-import-route__resume-preview-line--long" />
				<div className="knowledge-import-route__resume-preview-line knowledge-import-route__resume-preview-line--medium" />
				<div className="knowledge-import-route__resume-preview-line knowledge-import-route__resume-preview-line--short" />
			</div>
			<div className="knowledge-import-route__resume-preview-section">
				<div className="knowledge-import-route__resume-preview-section-title">其他</div>
				<div className="knowledge-import-route__resume-preview-line knowledge-import-route__resume-preview-line--medium" />
				<div className="knowledge-import-route__resume-preview-line knowledge-import-route__resume-preview-line--long" />
			</div>
		</Flex>
		<div className="knowledge-import-route__template-preview-arrow" />
		<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--resume">
			<div className="knowledge-import-route__template-result-tag">切片1</div>
			<div className="knowledge-import-route__resume-result-group">
				<div className="knowledge-import-route__resume-result-heading">基本信息</div>
				<div className="knowledge-import-route__resume-result-row"><span>姓名:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--short" /></div>
				<div className="knowledge-import-route__resume-result-row"><span>手机号:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--medium" /></div>
				<div className="knowledge-import-route__resume-result-row"><span>邮箱:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--medium" /></div>
			</div>
			<div className="knowledge-import-route__resume-result-group">
				<div className="knowledge-import-route__resume-result-heading">教育背景</div>
				<div className="knowledge-import-route__resume-result-row"><span>学校名称:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--medium" /></div>
				<div className="knowledge-import-route__resume-result-row"><span>学历:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--short" /></div>
				<div className="knowledge-import-route__resume-result-row"><span>专业:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--long" /></div>
			</div>
			<div className="knowledge-import-route__resume-result-group">
				<div className="knowledge-import-route__resume-result-heading">工作经历</div>
				<div className="knowledge-import-route__resume-result-row"><span>单位名称:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--medium" /></div>
				<div className="knowledge-import-route__resume-result-row"><span>职位名称:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--short" /></div>
				<div className="knowledge-import-route__resume-result-row"><span>工作时间:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--medium" /></div>
				<div className="knowledge-import-route__resume-result-row"><span>工作内容:</span><div className="knowledge-import-route__resume-result-fill knowledge-import-route__resume-result-fill--short" /></div>
			</div>
		</div>
	</div>
);

const pptTemplatePreview = (
	<div className="knowledge-import-route__template-preview knowledge-import-route__template-preview--ppt">
		<Flex vertical gap={10} className="knowledge-import-route__ppt-preview-stack">
			<div className="knowledge-import-route__ppt-slide-card">
				<Flex justify="space-between" align="center" className="knowledge-import-route__ppt-slide-header">
					<div className="knowledge-import-route__ppt-slide-title">一、物联的度（II）</div>
					<span className="knowledge-import-route__ppt-slide-index">01</span>
				</Flex>
				<div className="knowledge-import-route__ppt-slide-top">
					<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--short" />
					<div className="knowledge-import-route__ppt-chart knowledge-import-route__ppt-chart--ring" />
				</div>
				<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--tiny" />
				<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--small" />
				<div className="knowledge-import-route__ppt-slide-metrics">
					<div className="knowledge-import-route__ppt-metric-block">
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--tiny" />
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--micro" />
					</div>
					<div className="knowledge-import-route__ppt-metric-block">
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--tiny" />
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--micro" />
					</div>
					<div className="knowledge-import-route__ppt-metric-block">
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--tiny" />
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--micro" />
					</div>
				</div>
			</div>
			<div className="knowledge-import-route__ppt-slide-card">
				<Flex justify="space-between" align="center" className="knowledge-import-route__ppt-slide-header">
					<div className="knowledge-import-route__ppt-slide-title">二、网伏输送罗赛览（NA）</div>
					<span className="knowledge-import-route__ppt-slide-index">02</span>
				</Flex>
				<div className="knowledge-import-route__ppt-slide-body">
					<div className="knowledge-import-route__ppt-slide-column">
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--medium" />
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--small" />
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--tiny" />
					</div>
					<div className="knowledge-import-route__ppt-slide-column">
						<div className="knowledge-import-route__ppt-line knowledge-import-route__ppt-line--small" />
						<div className="knowledge-import-route__ppt-bars">
							<span />
							<span />
							<span />
							<span />
						</div>
					</div>
				</div>
			</div>
		</Flex>
		<div className="knowledge-import-route__template-preview-arrow" />
		<Flex vertical gap={10} className="knowledge-import-route__template-preview-result knowledge-import-route__template-preview-result--ppt">
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--ppt">
				<div className="knowledge-import-route__template-result-tag">切片1</div>
				<div className="knowledge-import-route__ppt-result-title">一、物联的度（II）</div>
				<div className="knowledge-import-route__ppt-result-row"><span>定义：</span><div className="knowledge-import-route__ppt-result-fill knowledge-import-route__ppt-result-fill--long" /></div>
				<div className="knowledge-import-route__ppt-result-row"><span>特征：</span><div className="knowledge-import-route__ppt-result-fill knowledge-import-route__ppt-result-fill--medium" /></div>
				<div className="knowledge-import-route__ppt-result-row"><span>数据分层：</span><div className="knowledge-import-route__ppt-result-fill knowledge-import-route__ppt-result-fill--long" /></div>
			</div>
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--ppt">
				<div className="knowledge-import-route__template-result-tag">切片2</div>
				<div className="knowledge-import-route__ppt-result-title">二、网伏输送罗赛览（NA）</div>
				<div className="knowledge-import-route__ppt-result-row"><span>定义定义：</span><div className="knowledge-import-route__ppt-result-fill knowledge-import-route__ppt-result-fill--short" /></div>
				<div className="knowledge-import-route__ppt-result-row"><span>具体描述：</span><div className="knowledge-import-route__ppt-result-fill knowledge-import-route__ppt-result-fill--medium" /></div>
				<div className="knowledge-import-route__ppt-result-row"><span>图表对照性：</span><div className="knowledge-import-route__ppt-result-fill knowledge-import-route__ppt-result-fill--long" /></div>
				<div className="knowledge-import-route__ppt-result-row"><span>计算关系：</span><div className="knowledge-import-route__ppt-result-fill knowledge-import-route__ppt-result-fill--medium" /></div>
			</div>
		</Flex>
	</div>
);

const paperTemplatePreview = (
	<div className="knowledge-import-route__template-preview knowledge-import-route__template-preview--paper">
		<Flex vertical gap={10} className="knowledge-import-route__paper-preview-doc">
			<div className="knowledge-import-route__paper-preview-cover">
				<div className="knowledge-import-route__paper-preview-cover-title">生成式人工智能的教育应用与展望</div>
				<div className="knowledge-import-route__paper-preview-cover-subtitle">以xx为例</div>
				<div className="knowledge-import-route__paper-preview-cover-meta">
					<div className="knowledge-import-route__paper-preview-pill knowledge-import-route__paper-preview-pill--short" />
					<div className="knowledge-import-route__paper-preview-pill knowledge-import-route__paper-preview-pill--tiny" />
					<div className="knowledge-import-route__paper-preview-pill knowledge-import-route__paper-preview-pill--short" />
				</div>
			</div>
			<div className="knowledge-import-route__paper-preview-section">
				<div className="knowledge-import-route__paper-preview-label">摘要</div>
				<div className="knowledge-import-route__paper-preview-body">
					<div className="knowledge-import-route__paper-preview-line knowledge-import-route__paper-preview-line--long" />
					<div className="knowledge-import-route__paper-preview-line knowledge-import-route__paper-preview-line--medium" />
				</div>
			</div>
			<div className="knowledge-import-route__paper-preview-section">
				<div className="knowledge-import-route__paper-preview-label">引言</div>
				<div className="knowledge-import-route__paper-preview-body">
					<div className="knowledge-import-route__paper-preview-line knowledge-import-route__paper-preview-line--short" />
					<div className="knowledge-import-route__paper-preview-line knowledge-import-route__paper-preview-line--long" />
					<div className="knowledge-import-route__paper-preview-line knowledge-import-route__paper-preview-line--medium" />
					<div className="knowledge-import-route__paper-preview-line knowledge-import-route__paper-preview-line--short" />
				</div>
			</div>
			<div className="knowledge-import-route__paper-preview-footer">
				<div className="knowledge-import-route__paper-preview-line knowledge-import-route__paper-preview-line--medium" />
				<div className="knowledge-import-route__paper-preview-line knowledge-import-route__paper-preview-line--short" />
			</div>
		</Flex>
		<div className="knowledge-import-route__template-preview-arrow knowledge-import-route__template-preview-arrow--paper" />
		<Flex vertical gap={10} className="knowledge-import-route__template-preview-result knowledge-import-route__template-preview-result--paper">
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--paper">
				<div className="knowledge-import-route__template-result-tag">切片1</div>
				<div className="knowledge-import-route__paper-result-label">标题：</div>
				<div className="knowledge-import-route__paper-result-title">生成式人工智能的教育应用与展望</div>
				<div className="knowledge-import-route__paper-result-line knowledge-import-route__paper-result-line--medium" />
			</div>
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--paper">
				<div className="knowledge-import-route__template-result-tag">切片2</div>
				<div className="knowledge-import-route__paper-result-row">
					<span className="knowledge-import-route__paper-result-key">作者：</span>
					<span>纱纱</span>
					<span>张仪</span>
					<span>李XX</span>
				</div>
				<div className="knowledge-import-route__paper-result-row knowledge-import-route__paper-result-row--muted">
					<span className="knowledge-import-route__paper-result-key">摘要：</span>
					<div className="knowledge-import-route__paper-result-line knowledge-import-route__paper-result-line--long" />
				</div>
			</div>
			<div className="knowledge-import-route__template-result-card knowledge-import-route__template-result-card--paper">
				<div className="knowledge-import-route__template-result-tag">切片3</div>
				<div className="knowledge-import-route__paper-result-heading">摘要：</div>
				<div className="knowledge-import-route__paper-result-paragraph">
					生成式人工智能（Generative AI）当前在利用人工智能技术自动生成文本、图像、视频、音频等多模态数据
				</div>
				<div className="knowledge-import-route__paper-result-line knowledge-import-route__paper-result-line--long" />
				<div className="knowledge-import-route__paper-result-line knowledge-import-route__paper-result-line--short" />
			</div>
		</Flex>
	</div>
);

const structuredQaTemplatePreview = (
	<div className="knowledge-import-route__template-preview">
		<Flex vertical gap={8} className="knowledge-import-route__template-preview-doc">
			<div className="knowledge-import-route__template-browser-bar" />
			<div className="knowledge-import-route__template-chat-block">
				<div className="knowledge-import-route__template-chat-label" />
				<div className="knowledge-import-route__template-chat-bubble knowledge-import-route__template-chat-bubble--question" />
				<div className="knowledge-import-route__template-chat-bubble knowledge-import-route__template-chat-bubble--answer" />
			</div>
			<div className="knowledge-import-route__template-chat-block">
				<div className="knowledge-import-route__template-chat-label" />
				<div className="knowledge-import-route__template-chat-bubble knowledge-import-route__template-chat-bubble--question" />
				<div className="knowledge-import-route__template-chat-bubble knowledge-import-route__template-chat-bubble--answer" />
			</div>
		</Flex>
		<div className="knowledge-import-route__template-preview-arrow" />
		<Flex vertical gap={10} className="knowledge-import-route__template-preview-result">
			<div className="knowledge-import-route__template-result-card">
				<div className="knowledge-import-route__template-result-tag">切片1</div>
				<div className="knowledge-import-route__template-result-line knowledge-import-route__template-result-line--title" />
				<div className="knowledge-import-route__template-result-line" />
				<div className="knowledge-import-route__template-result-line knowledge-import-route__template-result-line--short" />
			</div>
			<div className="knowledge-import-route__template-result-card">
				<div className="knowledge-import-route__template-result-tag">切片2</div>
				<div className="knowledge-import-route__template-result-line knowledge-import-route__template-result-line--title" />
				<div className="knowledge-import-route__template-result-line" />
				<div className="knowledge-import-route__template-result-line knowledge-import-route__template-result-line--short" />
			</div>
		</Flex>
	</div>
);

const genericTemplatePreview = (
	<div className="knowledge-import-route__template-preview knowledge-import-route__template-preview--generic">
		<div className="knowledge-import-route__template-generic-block knowledge-import-route__template-generic-block--left" />
		<div className="knowledge-import-route__template-preview-arrow" />
		<div className="knowledge-import-route__template-generic-block knowledge-import-route__template-generic-block--right" />
	</div>
);

const templatePreviews: Partial<Record<ImportFormValues['templateType'], ReactNode>> = {
	lawDocument: lawDocumentTemplatePreview,
	contractTemplate: contractTemplatePreview,
	resume: resumeTemplatePreview,
	ppt: pptTemplatePreview,
	paper: paperTemplatePreview,
	structuredQa: structuredQaTemplatePreview,
};

export const TemplatePreview = ({ templateType }: { templateType: ImportFormValues['templateType'] }) =>
	templatePreviews[templateType] ?? genericTemplatePreview;

export const knowledgeGraphTooltipContent = (
	<div className="knowledge-import-route__graph-tooltip">
		<Flex vertical gap={8} className="knowledge-import-route__graph-tooltip-copy">
			<Text className="knowledge-import-route__graph-tooltip-line">
				<Text strong>功能说明：</Text>
				开启后，在当前知识库上传文件时将对内容构建知识图谱。检索时可以通过图谱检索方式召回参考来源
			</Text>
			<Text className="knowledge-import-route__graph-tooltip-line">
				<Text strong>适用场景：</Text>
				对总结性问题，可通过图关系更准确的检索跨文件或跨切片的参考信息，提供完整参考信息让模型总结答复
			</Text>
			<Text className="knowledge-import-route__graph-tooltip-line">
				<Text strong>注意事项：</Text>
				开启后，处理数据时会依赖模型构建知识图谱，消耗模型tokens，并增加处理时长。检索召回时会使用图谱检索，增加检索时长。如果处理过程中模型tokens不足将停止构建知识图谱。表格型知识数据不适用于构建图谱
			</Text>
		</Flex>
		<div className="knowledge-import-route__graph-tooltip-demo">
			<div className="knowledge-import-route__graph-tooltip-stage knowledge-import-route__graph-tooltip-stage--files">
				<div className="knowledge-import-route__graph-tooltip-file knowledge-import-route__graph-tooltip-file--pdf">
					<span className="knowledge-import-route__graph-tooltip-file-icon" />
					<div>
						<div>PDF文件.pdf</div>
						<span>126KB</span>
					</div>
				</div>
				<div className="knowledge-import-route__graph-tooltip-file knowledge-import-route__graph-tooltip-file--doc">
					<span className="knowledge-import-route__graph-tooltip-file-icon" />
					<div>
						<div>DOC文件.doc</div>
						<span>105KB</span>
					</div>
				</div>
				<div className="knowledge-import-route__graph-tooltip-file knowledge-import-route__graph-tooltip-file--txt">
					<span className="knowledge-import-route__graph-tooltip-file-icon" />
					<div>
						<div>TXT文件.txt</div>
						<span>89KB</span>
					</div>
				</div>
				<div className="knowledge-import-route__graph-tooltip-file knowledge-import-route__graph-tooltip-file--ppt">
					<span className="knowledge-import-route__graph-tooltip-file-icon" />
					<div>
						<div>PPT文件.pptx</div>
						<span>99KB</span>
					</div>
				</div>
			</div>
			<div className="knowledge-import-route__graph-tooltip-stage knowledge-import-route__graph-tooltip-stage--graph">
				<div className="knowledge-import-route__graph-network">
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--center" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--a" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--b" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--c" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--d" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--e" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--f" />
				</div>
				<div className="knowledge-import-route__graph-tooltip-caption">图谱构建</div>
			</div>
			<div className="knowledge-import-route__graph-tooltip-query">user query</div>
			<div className="knowledge-import-route__graph-tooltip-stage knowledge-import-route__graph-tooltip-stage--result">
				<div className="knowledge-import-route__graph-network knowledge-import-route__graph-network--result">
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--center" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--a" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--b" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--c" />
					<span className="knowledge-import-route__graph-node knowledge-import-route__graph-node--d" />
				</div>
				<div className="knowledge-import-route__graph-tooltip-card">
					<div>实体</div>
					<div>关系</div>
					<div>来源切片</div>
				</div>
				<div className="knowledge-import-route__graph-tooltip-caption">图谱检索</div>
			</div>
		</div>
	</div>
);