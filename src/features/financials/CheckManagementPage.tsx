import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, Chip, Tabs, Tab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { differenceInCalendarDays, isToday, isTomorrow, startOfDay, isPast } from 'date-fns';

// Store and Slices
import { type RootState } from '../../store/store';
import { addCheck, editCheck, deleteCheck, type Check, type CheckStatus } from '../../store/slices/checksSlice';
import { toPersianDigits } from '../../utils/utils';

// Generic Components
import { useToast } from '../../hooks/useToast';
import EnhancedMuiTable, { type HeadCell, type Action } from '../../components/Table';
import FormDialog from '../../components/FormDialog';
import Form, { type FormField } from '../../components/Form';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { type SelectOption } from '../../components/SearchableSelect';

// Define a new type that extends the original Check type
type ProcessedCheck = Check & { derivedStatus: CheckStatus };

// Form Data Types
type CheckFormData = Omit<Check, 'id' | 'status'>;
type EditFormData = { amount: number; dueDate: string; status: CheckStatus; };
type UpdateBySerialData = { serial: string; status: CheckStatus };

const getStatusChipColor = (status: CheckStatus) => {
    if (status === 'پاس شده') return 'success';
    if (status === 'برگشتی') return 'error';
    return 'warning';
};

const checkStatusOptions: SelectOption[] = [
    { id: 'در جریان', label: 'در جریان' },
    { id: 'پاس شده', label: 'پاس شده' },
    { id: 'برگشتی', label: 'برگشتی' },
];

const CheckManagementPage = () => {
    const dispatch = useDispatch();
    const allChecks = useSelector((state: RootState) => state.checks);
    const { showToast } = useToast();
    const [tab, setTab] = useState(0);

    // State Management for Dialogs
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [editFormOpen, setEditFormOpen] = useState(false);
    const [updateBySerialOpen, setUpdateBySerialOpen] = useState(false);
    const [checkToDelete, setCheckToDelete] = useState<string | null>(null);
    const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);

    // React Hook Form instances
    const { control: addFormControl, handleSubmit: handleAddSubmit, reset: resetAddForm } = useForm<CheckFormData>();
    const { control: editFormControl, handleSubmit: handleEditSubmit, reset: resetEditForm } = useForm<EditFormData>();
    const { control: updateSerialFormControl, handleSubmit: handleUpdateBySerialSubmit, reset: resetUpdateSerialForm } = useForm<UpdateBySerialData>();

    useEffect(() => {
        if (selectedCheck) {
            resetEditForm({
                status: selectedCheck.status,
                amount: selectedCheck.amount,
                dueDate: selectedCheck.dueDate,
            });
        }
    }, [selectedCheck, resetEditForm]);

    const processedChecks: ProcessedCheck[] = useMemo(() => allChecks.map(check => ({
        ...check,
        derivedStatus: (check.status === 'در جریان' && isPast(new Date(check.dueDate)) && !isToday(new Date(check.dueDate)))
            ? 'برگشتی'
            : check.status,
    })), [allChecks]);

    const onAddSubmit: SubmitHandler<CheckFormData> = (data) => {
        dispatch(addCheck({ ...data, amount: Number(data.amount) }));
        showToast('چک جدید با موفقیت ثبت شد.', 'success');
        setAddFormOpen(false);
        resetAddForm();
    };
    
    const onEditSubmit: SubmitHandler<EditFormData> = (data) => {
        if (selectedCheck) {
            dispatch(editCheck({ id: selectedCheck.id, ...data, amount: Number(data.amount) }));
            showToast('چک با موفقیت ویرایش شد.', 'success');
            setEditFormOpen(false);
            setSelectedCheck(null);
        }
    };

    const onUpdateBySerial: SubmitHandler<UpdateBySerialData> = (data) => {
        const checkToUpdate = allChecks.find(c => c.serial === data.serial);
        if (checkToUpdate) {
            dispatch(editCheck({ id: checkToUpdate.id, status: data.status }));
            showToast(`وضعیت چک با سریال ${data.serial} به‌روزرسانی شد.`, 'success');
            setUpdateBySerialOpen(false);
            resetUpdateSerialForm();
        } else {
            showToast('چکی با این سریال یافت نشد.', 'error');
        }
    };

    const handleConfirmDelete = () => {
        if (checkToDelete) {
            dispatch(deleteCheck(checkToDelete));
            showToast('چک با موفقیت حذف شد.', 'success');
        }
        setCheckToDelete(null);
    };

    const today = startOfDay(new Date());
    const filteredChecks: ProcessedCheck[] = useMemo(() => processedChecks.filter(check => {
        const dueDate = startOfDay(new Date(check.dueDate));
        const diffDays = differenceInCalendarDays(dueDate, today);
        switch (tab) {
            case 1: return isToday(dueDate) && check.derivedStatus === 'در جریان';
            case 2: return isTomorrow(dueDate) && check.derivedStatus === 'در جریان';
            case 3: return diffDays > 1 && diffDays <= 5 && check.derivedStatus === 'در جریان';
            case 4: return check.derivedStatus === 'برگشتی';
            default: return true;
        }
    }), [processedChecks, tab, today]);

    const headCells: readonly HeadCell<ProcessedCheck>[] = [
        { id: 'serial', numeric: false, label: 'سریال' },
        { id: 'payee', numeric: false, label: 'شخص' },
        { id: 'type', numeric: false, label: 'نوع', cell: (row) => row.type === 'received' ? 'دریافتی' : 'پرداختی' },
        { id: 'amount', numeric: true, label: 'مبلغ', cell: (row) => toPersianDigits(row.amount) },
        { id: 'dueDate', numeric: false, label: 'سررسید', cell: (row) => new Date(row.dueDate).toLocaleDateString('fa-IR') },
        { id: 'derivedStatus', numeric: false, label: 'وضعیت', cell: (row) => <Chip label={row.derivedStatus} color={getStatusChipColor(row.derivedStatus as CheckStatus)} size="small" /> },
    ];

    const actions: readonly Action<Check>[] = [
        { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: (check) => { setSelectedCheck(check); setEditFormOpen(true); } },
        { icon: <DeleteIcon fontSize="small" color="error" />, tooltip: 'حذف', onClick: (check) => setCheckToDelete(check.id) },
    ];

    const addFormConfig: FormField<CheckFormData>[] = [
        { name: 'serial', label: 'سریال چک', type: 'text', rules: { required: true } },
        { name: 'payee', label: 'نام شخص', type: 'text', rules: { required: true } },
        { name: 'amount', label: 'مبلغ', type: 'number', rules: { required: true, min: 1 } },
        { name: 'dueDate', label: 'تاریخ سررسید', type: 'date', rules: { required: true } },
        { name: 'type', label: 'نوع چک', type: 'select', rules: { required: true }, options: [{ id: 'received', label: 'دریافتی' }, { id: 'issued', label: 'پرداختی' }] },
    ];

    const editFormConfig: FormField<EditFormData>[] = [
        { name: 'amount', label: 'مبلغ', type: 'number', rules: { required: true, min: 1 } },
        { name: 'dueDate', label: 'تاریخ سررسید', type: 'date', rules: { required: true } },
        { name: 'status', label: 'وضعیت', type: 'select', rules: { required: true }, options: checkStatusOptions },
    ];
    
    const updateBySerialFormConfig: FormField<UpdateBySerialData>[] = [
        { name: 'serial', label: 'سریال چک', type: 'text', rules: { required: true } },
        { name: 'status', label: 'وضعیت جدید', type: 'select', rules: { required: true }, options: checkStatusOptions },
    ];

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%', overflowX: 'auto' }}>
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, pt: { xs: 1, sm: 0 } }}>
                    <Button variant="outlined" size="small" onClick={() => setUpdateBySerialOpen(true)}>تغییر وضعیت با سریال</Button>
                    <Button variant="contained" size="small" onClick={() => setAddFormOpen(true)}>ثبت چک جدید</Button>
                </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
                    <Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
                        <Tab label="همه چک‌ها" />
                        <Tab label="چک‌های امروز" />
                        <Tab label="چک‌های فردا" />
                        <Tab label="چک‌های تا ۵ روز آینده" />
                        <Tab label="چک‌های برگشتی" />
                    </Tabs>
                </Box>
            </Box>

            <EnhancedMuiTable
                rows={filteredChecks}
                headCells={headCells}
                actions={actions}
                title="لیست چک‌ها"
            />

            <FormDialog open={addFormOpen} onClose={() => setAddFormOpen(false)} onSave={handleAddSubmit(onAddSubmit)} title="ثبت چک جدید">
                <Form config={addFormConfig} control={addFormControl} errors={{}} />
            </FormDialog>

            <FormDialog open={editFormOpen} onClose={() => setEditFormOpen(false)} onSave={handleEditSubmit(onEditSubmit)} title={`ویرایش چک: ${selectedCheck?.serial || ''}`}>
                <Form config={editFormConfig} control={editFormControl} errors={{}} />
            </FormDialog>
            
            <FormDialog open={updateBySerialOpen} onClose={() => setUpdateBySerialOpen(false)} onSave={handleUpdateBySerialSubmit(onUpdateBySerial)} title="تغییر وضعیت با سریال">
                <Form config={updateBySerialFormConfig} control={updateSerialFormControl} errors={{}} />
            </FormDialog>

            <ConfirmationDialog
                open={!!checkToDelete}
                onClose={() => setCheckToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="تایید حذف چک"
                message="آیا از حذف این چک اطمینان دارید؟ این عمل قابل بازگشت نیست."
            />
        </Box>
    );
};

export default CheckManagementPage;