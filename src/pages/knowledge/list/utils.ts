import type { KnowledgeBaseRecord, KnowledgeGroup } from './types';

export const buildGroupTree = (flatGroups: KnowledgeGroup[]): KnowledgeGroup[] => {
	if (!flatGroups.length) {
		return [];
	}

	const nodeMap = new Map<string, KnowledgeGroup>();
	flatGroups.forEach((group) => {
		if (!group.group_id) {
			return;
		}
		nodeMap.set(group.group_id, { ...group, children: [] });
	});

	const roots: KnowledgeGroup[] = [];
	nodeMap.forEach((node) => {
		const parentId = node.parent_id || 'all';
		if (parentId && nodeMap.has(parentId)) {
			nodeMap.get(parentId)?.children?.push(node);
			return;
		}
		if (node.parent_id !== parentId) {
			node.parent_id = parentId;
		}
		roots.push(node);
	});

	const normalizeChildren = (items: KnowledgeGroup[]): KnowledgeGroup[] =>
		items.map((item) => ({
			...item,
			children: item.children?.length ? normalizeChildren(item.children) : undefined,
		}));

	return normalizeChildren(roots);
};

export const ensureRootGroup = (groups: KnowledgeGroup[]): KnowledgeGroup[] => {
	const sumDescendantKbCount = (items: KnowledgeGroup[]): number =>
		items.reduce((total, item) => {
			const currentCount = Number(item.kb_count ?? 0);
			const childCount = item.children?.length ? sumDescendantKbCount(item.children) : 0;
			return total + currentCount + childCount;
		}, 0);

	if (!groups.length) {
		return [
			{
				group_id: 'all',
				name: '全部群组',
				description: '全部群组',
				parent_id: null,
				kb_count: 0,
			},
		];
	}

	if (groups.some((group) => group.group_id === 'all')) {
		return groups.map((group) =>
			group.group_id === 'all'
				? {
					...group,
					kb_count: sumDescendantKbCount(group.children ?? []),
				}
				: group,
		);
	}

	return [
		{
			group_id: 'all',
			name: '全部群组',
			description: '全部群组',
			parent_id: null,
			kb_count: sumDescendantKbCount(groups),
			children: groups,
		},
	];
};

export const collectGroupKeys = (groups: KnowledgeGroup[]): string[] => {
	const keys: string[] = [];

	const traverse = (items: KnowledgeGroup[]) => {
		items.forEach((item) => {
			if (item.group_id) {
				keys.push(item.group_id);
			}
			if (item.children?.length) {
				traverse(item.children);
			}
		});
	};

	traverse(groups);

	return keys;
};

export const findGroupPathTitles = (
	groups: KnowledgeGroup[],
	targetKey: string,
	parentTitles: string[] = [],
): string[] | undefined => {
	for (const group of groups) {
		const nextPath = [...parentTitles, group.name];
		if (group.group_id === targetKey) {
			return nextPath;
		}

		if (group.children?.length) {
			const matchedPath = findGroupPathTitles(group.children, targetKey, nextPath);
			if (matchedPath) {
				return matchedPath;
			}
		}
	}

	return undefined;
};

export const getGroupTitleMap = (groups: KnowledgeGroup[]) => {
	const entries: Array<[string, string]> = [];

	const traverse = (items: KnowledgeGroup[]) => {
		items.forEach((item) => {
			if (item.group_id) {
				entries.push([item.group_id, item.name]);
			}
			if (item.children?.length) {
				traverse(item.children);
			}
		});
	};

	traverse(groups);

	return new Map(entries);
};

// 分组统计
export const getGroupCounts = (groups: KnowledgeGroup[], records: KnowledgeBaseRecord[]) => {
	const countMap = new Map<string, number>();

	records.forEach((record) => {
		const groupId = String(record.group_id ?? 'all');
		countMap.set(groupId, (countMap.get(groupId) ?? 0) + 1);
	});

	const fillParentCount = (items: KnowledgeGroup[]) => {
		items.forEach((item) => {
			if (!item.children?.length) {
				return;
			}

			fillParentCount(item.children);
			const childCount = item.children.reduce(
				(total, child) => total + (countMap.get(String(child.group_id)) ?? 0),
				0,
			);
			if (item.group_id) {
				countMap.set(item.group_id, childCount);
			}
		});
	};

	fillParentCount(groups);
	countMap.set('all', records.length);

	return countMap;
};

export const filterGroupTree = (groups: KnowledgeGroup[], keyword: string): KnowledgeGroup[] => {
	const normalizedKeyword = keyword.trim().toLowerCase();
	if (!normalizedKeyword) {
		return groups;
	}

	return groups
		.map((group) => {
			const matchedChildren = group.children ? filterGroupTree(group.children, keyword) : undefined;
			const currentMatched = group.name.toLowerCase().includes(normalizedKeyword);

			if (currentMatched || matchedChildren?.length) {
				return {
					...group,
					children: matchedChildren,
				};
			}

			return null;
		})
		.filter(Boolean) as KnowledgeGroup[];
};

