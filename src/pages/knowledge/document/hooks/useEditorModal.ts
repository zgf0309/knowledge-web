import { Form, type FormInstance } from 'antd';
import { useCallback, useState } from 'react';

interface UseEditorModalReturn<TValues, TEntityId = string> {
	form: FormInstance<TValues>;
	open: boolean;
	editingId: TEntityId | null;
	initialValues: TValues;
	openCreate: (initialValues?: Partial<TValues>) => void;
	openEdit: (id: TEntityId, values: Partial<TValues>) => void;
	close: () => void;
}

/**
 * 通用「表单弹窗」状态管理：复用于切片/知识点的新建+编辑场景。
 * 通过暴露 initialValues 让 Modal 内的 Form 在 destroyOnHidden 重新挂载时注入初值，
 * 避免 Form 未挂载时调用 setFieldsValue 触发的 useForm 警告。
 */
export function useEditorModal<TValues extends Record<string, any>, TEntityId = string>(
	defaults: TValues,
): UseEditorModalReturn<TValues, TEntityId> {
	const [form] = Form.useForm<TValues>();
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<TEntityId | null>(null);
	const [initialValues, setInitialValues] = useState<TValues>(defaults);

	const openCreate = useCallback(
		(values?: Partial<TValues>) => {
			setEditingId(null);
			setInitialValues({ ...defaults, ...(values ?? {}) } as TValues);
			setOpen(true);
		},
		[defaults],
	);

	const openEdit = useCallback(
		(id: TEntityId, values: Partial<TValues>) => {
			setEditingId(id);
			setInitialValues({ ...defaults, ...values } as TValues);
			setOpen(true);
		},
		[defaults],
	);

	const close = useCallback(() => {
		setOpen(false);
		setEditingId(null);
	}, []);

	return { form, open, editingId, initialValues, openCreate, openEdit, close };
}
