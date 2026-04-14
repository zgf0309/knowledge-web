import type { KnowledgeBaseRecord, KnowledgeFormValues, KnowledgeGroup } from './types';

export const collectGroupKeys = (groups: KnowledgeGroup[]): string[] => {
	const keys: string[] = [];

	const traverse = (items: KnowledgeGroup[]) => {
		items.forEach((item) => {
			keys.push(item.key);
			if (item.children?.length) {
				traverse(item.children);
			}
		});
	};

	traverse(groups);

	return keys;
};

export const appendChildGroup = (
	groups: KnowledgeGroup[],
	parentKey: string,
	child: KnowledgeGroup,
): KnowledgeGroup[] =>
	groups.map((group) => {
		if (group.key === parentKey) {
			return {
				...group,
				children: [...(group.children ?? []), child],
			};
		}

		if (!group.children?.length) {
			return group;
		}

		return {
			...group,
			children: appendChildGroup(group.children, parentKey, child),
		};
	});

export const updateGroupTitle = (
	groups: KnowledgeGroup[],
	targetKey: string,
	nextTitle: string,
): KnowledgeGroup[] =>
	groups.map((group) => {
		if (group.key === targetKey) {
			return {
				...group,
				title: nextTitle,
			};
		}

		if (!group.children?.length) {
			return group;
		}

		return {
			...group,
			children: updateGroupTitle(group.children, targetKey, nextTitle),
		};
	});

export const findGroupPathTitles = (
	groups: KnowledgeGroup[],
	targetKey: string,
	parentTitles: string[] = [],
): string[] | undefined => {
	for (const group of groups) {
		const nextPath = [...parentTitles, group.title];
		if (group.key === targetKey) {
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

export const collectBranchKeys = (groups: KnowledgeGroup[], targetKey: string): string[] => {
	for (const group of groups) {
		if (group.key === targetKey) {
			const branchKeys: string[] = [];
			const traverse = (items: KnowledgeGroup[]) => {
				items.forEach((item) => {
					branchKeys.push(item.key);
					if (item.children?.length) {
						traverse(item.children);
					}
				});
			};

			traverse([group]);
			return branchKeys;
		}

		if (group.children?.length) {
			const childBranchKeys = collectBranchKeys(group.children, targetKey);
			if (childBranchKeys.length) {
				return childBranchKeys;
			}
		}
	}

	return [];
};

export const removeGroupByKey = (
	groups: KnowledgeGroup[],
	targetKey: string,
): KnowledgeGroup[] =>
	groups
		.filter((group) => group.key !== targetKey)
		.map((group) => ({
			...group,
			children: group.children ? removeGroupByKey(group.children, targetKey) : undefined,
		}));

export const getGroupTitleMap = (groups: KnowledgeGroup[]) => {
	const entries: Array<[string, string]> = [];

	const traverse = (items: KnowledgeGroup[]) => {
		items.forEach((item) => {
			entries.push([item.key, item.title]);
			if (item.children?.length) {
				traverse(item.children);
			}
		});
	};

	traverse(groups);

	return new Map(entries);
};

export const getGroupCounts = (groups: KnowledgeGroup[], records: KnowledgeBaseRecord[]) => {
	const countMap = new Map<string, number>();

	records.forEach((record) => {
		countMap.set(record.groupKey, (countMap.get(record.groupKey) ?? 0) + 1);
	});

	const fillParentCount = (items: KnowledgeGroup[]) => {
		items.forEach((item) => {
			if (!item.children?.length) {
				return;
			}

			fillParentCount(item.children);
			const childCount = item.children.reduce(
				(total, child) => total + (countMap.get(child.key) ?? 0),
				0,
			);
			countMap.set(item.key, childCount);
		});
	};

	fillParentCount(groups);
	countMap.set('all', records.length);

	return countMap;
};

export const filterGroups = (groups: KnowledgeGroup[], keyword: string): KnowledgeGroup[] => {
	const normalizedKeyword = keyword.trim().toLowerCase();
	if (!normalizedKeyword) {
		return groups;
	}

	return groups
		.map((group) => {
			const matchedChildren = group.children?.filter((child) =>
				child.title.toLowerCase().includes(normalizedKeyword),
			);

			if (group.title.toLowerCase().includes(normalizedKeyword) || matchedChildren?.length) {
				return {
					...group,
					children: matchedChildren,
				};
			}

			return null;
		})
		.filter(Boolean) as KnowledgeGroup[];
};

export const filterGroupTree = (groups: KnowledgeGroup[], keyword: string): KnowledgeGroup[] => {
	const normalizedKeyword = keyword.trim().toLowerCase();
	if (!normalizedKeyword) {
		return groups;
	}

	return groups
		.map((group) => {
			const matchedChildren = group.children ? filterGroupTree(group.children, keyword) : undefined;
			const currentMatched = group.title.toLowerCase().includes(normalizedKeyword);

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

export const filterRecords = (
	records: KnowledgeBaseRecord[],
	selectedGroupKey: string,
	keyword: string,
) => {
	const normalizedKeyword = keyword.trim().toLowerCase();

	return records.filter((record) => {
		const groupMatched = selectedGroupKey === 'all' || record.groupKey === selectedGroupKey;
		if (!groupMatched) {
			return false;
		}

		if (!normalizedKeyword) {
			return true;
		}

		return [record.name, record.id, record.description].some((value) =>
			value.toLowerCase().includes(normalizedKeyword),
		);
	});
};

export const paginateRecords = (
	records: KnowledgeBaseRecord[],
	current: number,
	pageSize: number,
) => {
	const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
	const safeCurrent = Math.min(current, totalPages);

	return {
		totalPages,
		currentPage: safeCurrent,
		pagedRecords: records.slice((safeCurrent - 1) * pageSize, safeCurrent * pageSize),
	};
};

export const buildGroupOptions = (groups: KnowledgeGroup[]) => {
	const options: Array<{ label: string; value: string }> = [];

	const traverse = (items: KnowledgeGroup[], parentTitles: string[] = []) => {
		items.forEach((item) => {
			const pathTitles = [...parentTitles, item.title];
			if (item.key !== 'all') {
				options.push({
					label: pathTitles.join(' / '),
					value: item.key,
				});
			}
			if (item.children?.length) {
				traverse(item.children, pathTitles);
			}
		});
	};

	traverse(groups);

	return options;
};

export const createKnowledgeRecord = (
	values: KnowledgeFormValues,
	now: string,
): KnowledgeBaseRecord => ({
	key: `kb-${Date.now()}`,
	name: values.name,
	id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
	description: values.description?.trim() || '-',
	documentCount: 0,
	advancedUsage: null,
	sourceType: values.sourceType,
	embeddingModel: values.embeddingModel,
	clusterName: values.clusterName?.trim() || '-',
	updatedAt: now,
	createdAt: now,
	groupKey: values.groupKey,
});

export const updateKnowledgeRecord = (
	record: KnowledgeBaseRecord,
	values: KnowledgeFormValues,
	now: string,
): KnowledgeBaseRecord => ({
	...record,
	name: values.name,
	description: values.description?.trim() || '-',
	groupKey: values.groupKey,
	sourceType: values.sourceType,
	embeddingModel: values.embeddingModel,
	clusterName: values.clusterName?.trim() || '-',
	updatedAt: now,
});

export const moveKnowledgeRecords = (
	records: KnowledgeBaseRecord[],
	keys: string[],
	targetGroupKey: string,
	now: string,
): KnowledgeBaseRecord[] => {
	const keySet = new Set(keys);

	return records.map((record) =>
		keySet.has(record.key)
			? {
				...record,
				groupKey: targetGroupKey,
				updatedAt: now,
			}
			: record,
	);
};
