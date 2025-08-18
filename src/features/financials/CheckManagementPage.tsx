import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid, Chip, Tabs, Tab,
  Snackbar, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { type RootState } from '../../store/store';
import { addCheck, editCheck, deleteCheck, type Check, type CheckStatus } from '../../store/slices/checksSlice';
import { differenceInCalendarDays, isToday, isTomorrow, startOfDay, isPast } from 'date-fns';
import DatePicker, { type DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

type CheckFormData = Omit<Check, 'id' | 'status' | 'dueDate'> & { dueDate: Date | null };
type EditFormData = { amount: number; dueDate: Date | null; status: CheckStatus; };

const getStatusChipColor = (status: CheckStatus) => {
    if (status === 'پاس شده') return 'success';
    if (status === 'برگشتی') return 'error';
    return 'warning';
}

const CheckManagementPage = () => {
    const dispatch = useDispatch();
    const allChecks = useSelector((state: RootState) => state.checks);
    const [tab, setTab] = useState(0);

    const [isAddFormOpen, setAddFormOpen] = useState(false);
    const [isEditFormOpen, setEditFormOpen] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
    const [isUpdateBySerialOpen, setUpdateBySerialOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [checkToDelete, setCheckToDelete] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    const { control: addFormControl, handleSubmit: handleAddSubmit, reset: resetAddForm } = useForm<CheckFormData>({
        defaultValues: { serial: '', amount: 0, payee: '', dueDate: new Date(), type: 'received' }
    });

    const { control: editFormControl, handleSubmit: handleEditSubmit, reset: resetEditForm } = useForm<EditFormData>();

    const { control: updateSerialFormControl, handleSubmit: handleUpdateBySerialSubmit, reset: resetUpdateSerialForm } = useForm({
        defaultValues: { serial: '', status: 'پاس شده' as CheckStatus }
    });
    
    useEffect(() => {
        if (selectedCheck) {
            resetEditForm({
                status: selectedCheck.status,
                amount: selectedCheck.amount,
                dueDate: new Date(selectedCheck.dueDate),
            });
        }
    }, [selectedCheck, resetEditForm]);

    const processedChecks = useMemo(() => {
        return allChecks.map(check => {
            let derivedStatus = check.status;
            if (check.status === 'در جریان' && isPast(new Date(check.dueDate)) && !isToday(new Date(check.dueDate))) {
                derivedStatus = 'برگشتی';
            }
            return { ...check, derivedStatus };
        });
    }, [allChecks]);

    const onAddSubmit: SubmitHandler<CheckFormData> = (data) => {
        if (data.dueDate) {
            const isoDate = data.dueDate.toISOString(); 
            dispatch(addCheck({ ...data, amount: Number(data.amount), dueDate: isoDate }));
            setSnackbar({ open: true, message: 'چک جدید با موفقیت ثبت شد.', severity: 'success' });
            setAddFormOpen(false);
            resetAddForm({ serial: '', amount: 0, payee: '', dueDate: new Date(), type: 'received' });
        }
    };
    
    const onEditSubmit: SubmitHandler<EditFormData> = (data) => {
        if (selectedCheck && data.dueDate) {
            dispatch(editCheck({
                id: selectedCheck.id,
                status: data.status,
                amount: Number(data.amount),
                dueDate: data.dueDate.toISOString(),
            }));
            setSnackbar({ open: true, message: 'چک با موفقیت ویرایش شد.', severity: 'success' });
            setEditFormOpen(false);
            setSelectedCheck(null);
        }
    };

    const openDeleteConfirm = (id: string) => {
        setCheckToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (checkToDelete) {
            dispatch(deleteCheck(checkToDelete));
            setSnackbar({ open: true, message: 'چک با موفقیت حذف شد.', severity: 'success' });
        }
        setDeleteConfirmOpen(false);
        setCheckToDelete(null);
    };

    const onUpdateBySerial = (data: {serial: string, status: CheckStatus}) => {
        const checkToUpdate = allChecks.find(c => c.serial === data.serial);
        if (checkToUpdate) {
            dispatch(editCheck({ id: checkToUpdate.id, status: data.status }));
            setSnackbar({ open: true, message: `وضعیت چک با سریال ${data.serial} به‌روزرسانی شد.`, severity: 'success' });
            setUpdateBySerialOpen(false);
            resetUpdateSerialForm();
        } else {
            setSnackbar({ open: true, message: 'چکی با این سریال یافت نشد.', severity: 'error' });
        }
    }

    const today = startOfDay(new Date());
    const filteredChecks = processedChecks.filter(check => {
        const dueDate = startOfDay(new Date(check.dueDate));
        const diffDays = differenceInCalendarDays(dueDate, today);

        switch (tab) {
            case 1: return isToday(dueDate) && check.derivedStatus === 'در جریان';
            case 2: return isTomorrow(dueDate) && check.derivedStatus === 'در جریان';
            case 3: return diffDays > 1 && diffDays <= 5 && check.derivedStatus === 'در جریان';
            case 4: return check.derivedStatus === 'برگشتی';
            case 0:
            default: return true;
        }
    });

    return (
        <Box>
            <Box sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" sx={{textAlign:'center', fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>مدیریت چک‌ها</Typography>
                <Box sx={{display: 'flex',justifyContent:'flex-end' ,gap: 1}}>
                    <Button variant="outlined" startIcon={<FindReplaceIcon />} onClick={() => setUpdateBySerialOpen(true)}>تغییر وضعیت با سریال</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddFormOpen(true)}>ثبت چک جدید</Button>
                </Box>
            </Box>

            <Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
                <Tab label="همه چک‌ها" />
                <Tab label="چک‌های امروز" />
                <Tab label="چک‌های فردا" />
                <Tab label="چک‌های تا ۵ روز آینده" />
                <Tab label="چک‌های برگشتی" />
            </Tabs>

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>سریال</TableCell>
                                <TableCell>شخص</TableCell>
                                <TableCell>نوع</TableCell>
                                <TableCell>مبلغ</TableCell>
                                <TableCell>تاریخ سررسید</TableCell>
                                <TableCell>وضعیت</TableCell>
                                <TableCell align="center">عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredChecks.map(check => (
                                <TableRow key={check.id}>
                                    <TableCell>{check.serial}</TableCell>
                                    <TableCell>{check.payee}</TableCell>
                                    <TableCell>{check.type === 'received' ? 'دریافتی' : 'پرداختی'}</TableCell>
                                    <TableCell>{check.amount.toLocaleString()} تومان</TableCell>
                                    <TableCell>{new Date(check.dueDate).toLocaleDateString('fa-IR')}</TableCell>
                                    <TableCell>
                                        <Chip label={check.derivedStatus} color={getStatusChipColor(check.derivedStatus as CheckStatus)} size="small" />
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => { setSelectedCheck(check); setEditFormOpen(true); }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => openDeleteConfirm(check.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={isAddFormOpen} onClose={() => setAddFormOpen(false)}>
                <DialogTitle>ثبت چک جدید</DialogTitle>
                <form onSubmit={handleAddSubmit(onAddSubmit)}>
                    <DialogContent>
                        <Grid container spacing={2} sx={{pt: 1}}>
                            <Grid><Controller name="serial" control={addFormControl} rules={{required: true}} render={({field}) => <TextField {...field} label="سریال چک" fullWidth margin="dense"/>}/></Grid>
                            <Grid><Controller name="payee" control={addFormControl} rules={{required: true}} render={({field}) => <TextField {...field} label="نام شخص (پرداخت کننده/دریافت کننده)" fullWidth margin="dense"/>}/></Grid>
                            <Grid><Controller name="amount" control={addFormControl} rules={{required: true, min: 1}} render={({field}) => <TextField {...field} type="number" label="مبلغ" fullWidth margin="dense"/>}/></Grid>
                            <Grid>
                                <Controller
                                  name="dueDate"
                                  control={addFormControl}
                                  rules={{ required: true }}
                                  render={({ field: { onChange, value } }) => (
                                    <DatePicker
                                      portal
                                      zIndex={1400}
                                      value={value}
                                      onChange={(date: DateObject) => onChange(date?.toDate())}
                                      calendar={persian}
                                      locale={persian_fa}
                                      render={<TextField fullWidth label="تاریخ سررسید" margin="dense" />}
                                    />
                                  )}
                                />
                            </Grid>
                            <Grid>
                                <Controller name="type" control={addFormControl} rules={{required: true}} render={({field}) => (
                                    <FormControl fullWidth margin="dense"><InputLabel>نوع چک</InputLabel><Select {...field} label="نوع چک"><MenuItem value="received">دریافتی</MenuItem><MenuItem value="issued">پرداختی</MenuItem></Select></FormControl>
                                )}/>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'flex-start', padding: '0 24px 20px' }}><Button onClick={()=>setAddFormOpen(false)}>انصراف</Button><Button type="submit" variant="contained">ثبت</Button></DialogActions>
                </form>
            </Dialog>
            <Dialog open={isEditFormOpen} onClose={() => setEditFormOpen(false)}>
                <DialogTitle>ویرایش چک</DialogTitle>
                <form onSubmit={handleEditSubmit(onEditSubmit)}>
                    <DialogContent>
                        <Typography sx={{mb: 2}}>سریال: {selectedCheck?.serial}</Typography>
                        <Controller name="amount" control={editFormControl} rules={{ required: true, min: 1 }} render={({ field }) => <TextField {...field} type="number" label="مبلغ" fullWidth margin="dense" />} />
                        <Controller
                          name="dueDate"
                          control={editFormControl}
                          rules={{ required: true }}
                          render={({ field: { onChange, value } }) => (
                            <DatePicker
                              portal
                              zIndex={1400}
                              value={value}
                              onChange={(date: DateObject) => onChange(date?.toDate())}
                              calendar={persian}
                              locale={persian_fa}
                              render={<TextField fullWidth label="تاریخ سررسید" margin="dense" sx={{mt: 1}} />}
                            />
                          )}
                        />
                        <Controller name="status" control={editFormControl} rules={{ required: true }} render={({ field }) => (
                            <FormControl fullWidth margin="dense" sx={{mt: 1}}>
                                <InputLabel>وضعیت</InputLabel>
                                <Select {...field} label="وضعیت">
                                    <MenuItem value="در جریان">در جریان</MenuItem>
                                    <MenuItem value="پاس شده">پاس شده</MenuItem>
                                    <MenuItem value="برگشتی">برگشتی</MenuItem>
                                </Select>
                            </FormControl>
                        )} />
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'flex-start', padding: '0 24px 20px' }}>
                        <Button onClick={() => setEditFormOpen(false)}>انصراف</Button>
                        <Button type="submit" variant="contained">ذخیره تغییرات</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog open={isUpdateBySerialOpen} onClose={() => setUpdateBySerialOpen(false)}>
                <DialogTitle>تغییر وضعیت چک با سریال</DialogTitle>
                <form onSubmit={handleUpdateBySerialSubmit(onUpdateBySerial)}>
                    <DialogContent>
                        <Grid container spacing={2} sx={{pt: 1}}>
                            <Grid><Controller name="serial" control={updateSerialFormControl} rules={{required: true}} render={({field}) => <TextField {...field} label="سریال چک را وارد کنید" fullWidth autoFocus margin="dense"/>}/></Grid>
                            <Grid><Controller name="status" control={updateSerialFormControl} render={({field}) => (<FormControl fullWidth margin="dense"><InputLabel>وضعیت جدید</InputLabel><Select {...field} label="وضعیت جدید"><MenuItem value="در جریان">در جریان</MenuItem><MenuItem value="پاس شده">پاس شده</MenuItem><MenuItem value="برگشتی">برگشتی</MenuItem></Select></FormControl>)}/></Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'flex-start', padding: '0 24px 20px' }}><Button onClick={()=>setUpdateBySerialOpen(false)}>انصراف</Button><Button type="submit" variant="contained">اعمال تغییر</Button></DialogActions>
                </form>
            </Dialog>
            <Dialog
                open={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>تایید حذف</DialogTitle>
                <DialogContent>
                    <Typography>آیا از حذف این چک اطمینان دارید؟ این عملیات غیرقابل بازگشت است.</Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'flex-start', padding: '0 24px 20px' }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>خیر</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        بله، حذف کن
                    </Button>
                </DialogActions>
            </Dialog>

            {snackbar && (
                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default CheckManagementPage;
