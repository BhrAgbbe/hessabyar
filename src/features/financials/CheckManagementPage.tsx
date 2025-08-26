import { useState, useMemo, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Chip, Tabs, Tab, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { differenceInCalendarDays, isToday, isTomorrow, startOfDay, isPast } from 'date-fns';

import { type RootState } from '../../store/store';
import { addCheck, editCheck, deleteCheck, type Check, type CheckStatus } from '../../store/slices/checksSlice';
import { ToastContext } from '../../contexts/toast.context';

import EnhancedMuiTable, { type HeadCell, type Action } from '../../components/Table';
import FormDialog from '../../components/FormDialog';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import SearchAndSortPanel from '../../components/SearchAndSortPanel';
import Form from '../../components/Form';

type CheckFormData = Omit<Check, 'id' | 'status'>;
type EditFormData = Pick<Check, 'status' | 'amount' | 'dueDate'>;
type UpdateBySerialData = { serial: string; status: CheckStatus };

const getStatusChipColor = (status: CheckStatus) => {
    if (status === 'پاس شده') return 'success';
    if (status === 'برگشتی') return 'error';
    return 'warning';
};

const CheckManagementPage = () => {
    const dispatch = useDispatch();
    const allChecks = useSelector((state: RootState) => state.checks);
    const { showToast } = useContext(ToastContext);

    const [tab, setTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogState, setDialogState] = useState({ add: false, edit: false, updateBySerial: false });
    const [editingCheck, setEditingCheck] = useState<Check | null>(null);
    const [deletingCheckId, setDeletingCheckId] = useState<string | null>(null);

    const { control: addFormControl, handleSubmit: handleAddSubmit, reset: resetAddForm } = useForm<CheckFormData>({
        defaultValues: { serial: '', amount: 0, payee: '', dueDate: new Date().toISOString(), type: 'received' }
    });
    const { control: editFormControl, handleSubmit: handleEditSubmit, reset: resetEditForm } = useForm<EditFormData>();
    const { control: updateSerialFormControl, handleSubmit: handleUpdateBySerialSubmit, reset: resetUpdateSerialForm } = useForm<UpdateBySerialData>({
        defaultValues: { serial: '', status: 'پاس شده' }
    });

    useEffect(() => {
        if (editingCheck) {
            resetEditForm({
                status: editingCheck.status,
                amount: editingCheck.amount,
                dueDate: editingCheck.dueDate,
            });
        }
    }, [editingCheck, resetEditForm]);

    const processedChecks = useMemo(() => {
        return allChecks.map(check => {
            let derivedStatus = check.status;
            if (check.status === 'در جریان' && isPast(new Date(check.dueDate)) && !isToday(new Date(check.dueDate))) {
                derivedStatus = 'برگشتی';
            }
            return { ...check, derivedStatus };
        });
    }, [allChecks]);

    const filteredChecks = useMemo(() => {
        const today = startOfDay(new Date());
        let checks = processedChecks;

        checks = checks.filter(check => {
            const dueDate = startOfDay(new Date(check.dueDate));
            const diffDays = differenceInCalendarDays(dueDate, today);
            switch (tab) {
                case 1: return isToday(dueDate) && check.derivedStatus === 'در جریان';
                case 2: return isTomorrow(dueDate) && check.derivedStatus === 'در جریان';
                case 3: return diffDays > 1 && diffDays <= 5 && check.derivedStatus === 'در جریان';
                case 4: return check.derivedStatus === 'برگشتی';
                default: return true;
            }
        });

        if (searchTerm) {
            checks = checks.filter(c =>
                c.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.payee.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return checks;
    }, [processedChecks, tab, searchTerm]);


    const onAddSubmit: SubmitHandler<CheckFormData> = (data) => {
        dispatch(addCheck({ ...data, amount: Number(data.amount) }));
        showToast('چک جدید با موفقیت ثبت شد.', 'success');
        setDialogState({ ...dialogState, add: false });
        resetAddForm({ serial: '', amount: 0, payee: '', dueDate: new Date().toISOString(), type: 'received' });
    };

    const onEditSubmit: SubmitHandler<EditFormData> = (data) => {
        if (editingCheck) {
            dispatch(editCheck({ id: editingCheck.id, ...data, amount: Number(data.amount) }));
            showToast('چک با موفقیت ویرایش شد.', 'success');
            setDialogState({ ...dialogState, edit: false });
            setEditingCheck(null);
        }
    };

    const onUpdateBySerial: SubmitHandler<UpdateBySerialData> = (data) => {
        const checkToUpdate = allChecks.find(c => c.serial === data.serial);
        if (checkToUpdate) {
            dispatch(editCheck({ id: checkToUpdate.id, status: data.status }));
            showToast(`وضعیت چک با سریال ${data.serial} به‌روزرسانی شد.`, 'success');
            setDialogState({ ...dialogState, updateBySerial: false });
            resetUpdateSerialForm();
        } else {
            showToast('چکی با این سریال یافت نشد.', 'error');
        }
    };

    const handleConfirmDelete = () => {
        if (deletingCheckId) {
            dispatch(deleteCheck(deletingCheckId));
            showToast('چک با موفقیت حذف شد.', 'success');
        }
        setDeletingCheckId(null);
    };

    const headCells: readonly HeadCell<Check & { derivedStatus: CheckStatus }>[] = [
        { id: 'serial', numeric: false, label: 'سریال' },
        { id: 'payee', numeric: false, label: 'شخص' },
        { id: 'type', numeric: false, label: 'نوع', cell: (row) => row.type === 'received' ? 'دریافتی' : 'پرداختی' },
        { id: 'amount', numeric: true, label: 'مبلغ', cell: (row) => row.amount.toLocaleString('fa-IR') },
        { id: 'dueDate', numeric: false, label: 'سررسید', cell: (row) => new Date(row.dueDate).toLocaleDateString('fa-IR') },
        { id: 'status', numeric: false, label: 'وضعیت', cell: (row) => <Chip label={row.derivedStatus} color={getStatusChipColor(row.derivedStatus)} size="small" /> },
    ];

    const actions: readonly Action<Check>[] = [
        { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: (row) => { setEditingCheck(row); setDialogState({ ...dialogState, edit: true }); } },
        { icon: <DeleteIcon color="error" fontSize="small" />, tooltip: 'حذف', onClick: (row) => setDeletingCheckId(row.id) },
    ];

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                <Button variant="outlined" onClick={() => setDialogState({ ...dialogState, updateBySerial: true })}>تغییر وضعیت با سریال</Button>
                <Button variant="contained" onClick={() => setDialogState({ ...dialogState, add: true })}>ثبت چک جدید</Button>
            </Box>

            <SearchAndSortPanel
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              sortBy={''} 
              onSortByChange={() => {}}
              sortOptions={[{label: 'سریال', value: 'serial'}, {label: 'شخص', value: 'payee'}]}
            />

            <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                <Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                    <Tab label="همه چک‌ها" />
                    <Tab label="سررسید امروز" />
                    <Tab label="سررسید فردا" />
                    <Tab label="۵ روز آینده" />
                    <Tab label="چک‌های برگشتی" />
                </Tabs>
            </Box>

            <EnhancedMuiTable
                rows={filteredChecks}
                headCells={headCells}
                title="لیست چک‌ها"
                actions={actions}
                onDelete={(selectedIds) => selectedIds.forEach(id => dispatch(deleteCheck(id.toString())))}
            />

            <FormDialog open={dialogState.add} onClose={() => setDialogState({ ...dialogState, add: false })} title="ثبت چک جدید" onSave={handleAddSubmit(onAddSubmit)}>
                <Form config={[
                    { name: 'serial', label: 'سریال چک', type: 'text', rules: { required: 'این فیلد الزامی است' } },
                    { name: 'payee', label: 'نام شخص', type: 'text', rules: { required: 'این فیلد الزامی است' } },
                    { name: 'amount', label: 'مبلغ', type: 'number', rules: { required: 'این فیلد الزامی است', min: { value: 1, message: 'مبلغ باید مثبت باشد' } } },
                    { name: 'dueDate', label: 'تاریخ سررسید', type: 'date', rules: { required: 'این فیلد الزامی است' } },
                    { name: 'type', label: 'نوع چک', type: 'select', options: [{ id: 'received', label: 'دریافتی' }, { id: 'issued', label: 'پرداختی' }], rules: { required: 'این فیلد الزامی است' } },
                ]} control={addFormControl} errors={{}} />
            </FormDialog>

            <FormDialog open={dialogState.edit} onClose={() => setDialogState({ ...dialogState, edit: false })} title={`ویرایش چک ${editingCheck?.serial}`} onSave={handleEditSubmit(onEditSubmit)}>
                <Typography sx={{ mb: 2 }}>سریال: {editingCheck?.serial}</Typography>
                <Form config={[
                    { name: 'amount', label: 'مبلغ', type: 'number', rules: { required: 'این فیلد الزامی است', min: { value: 1, message: 'مبلغ باید مثبت باشد' } } },
                    { name: 'dueDate', label: 'تاریخ سررسید', type: 'date', rules: { required: 'این فیلد الزامی است' } },
                    { name: 'status', label: 'وضعیت', type: 'select', options: [{ id: 'در جریان', label: 'در جریان' }, { id: 'پاس شده', label: 'پاس شده' }, { id: 'برگشتی', label: 'برگشتی' }], rules: { required: 'این فیلد الزامی است' } },
                ]} control={editFormControl} errors={{}} />
            </FormDialog>

            <FormDialog open={dialogState.updateBySerial} onClose={() => setDialogState({ ...dialogState, updateBySerial: false })} title="تغییر وضعیت با سریال" onSave={handleUpdateBySerialSubmit(onUpdateBySerial)}>
                <Form config={[
                     { name: 'serial', label: 'سریال چک', type: 'text', rules: { required: 'این فیلد الزامی است' } },
                     { name: 'status', label: 'وضعیت جدید', type: 'select', options: [{ id: 'در جریان', label: 'در جریان' }, { id: 'پاس شده', label: 'پاس شده' }, { id: 'برگشتی', label: 'برگشتی' }], rules: { required: 'این فیلد الزامی است' } },
                ]} control={updateSerialFormControl} errors={{}} />
            </FormDialog>

            <ConfirmationDialog
                open={!!deletingCheckId}
                onClose={() => setDeletingCheckId(null)}
                onConfirm={handleConfirmDelete}
                title="تایید حذف چک"
                message="آیا از حذف این چک اطمینان دارید؟ این عملیات غیرقابل بازگشت است."
            />
        </Box>
    );
};

export default CheckManagementPage;