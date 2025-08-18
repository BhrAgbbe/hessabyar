import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Button, List, ListItem, ListItemText, Divider, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, IconButton, FormControl, Select, MenuItem,
  RadioGroup, FormControlLabel, Radio, Snackbar, Alert, DialogContentText,
  useTheme, useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { type RootState } from '../../store/store';
import { addAccount, editAccount, deleteAccount, updateBalance, type BankAccount } from '../../store/slices/accountsSlice';

type AccountFormData = Omit<BankAccount, 'id'>;
type TransactionFormData = {
    accountId: string;
    amount: number;
    type: 'deposit' | 'withdrawal';
    reason: string;
    paymentMethod: 'cash' | 'check';
    checkSerial?: string;
};

const initialIranianBanks = [
    'ملت', 'ملی', 'صادرات', 'تجارت', 'سپه', 'مسکن', 'کشاورزی', 'پارسیان', 'پاسارگاد',
    'اقتصاد نوین', 'سامان', 'سینا', 'شهر', 'دی', 'آینده', 'سرمایه', 'پست بانک ایران',
    'کارآفرینان', 'توسعه تعاون', 'رفاه ', ' قرض‌الحسنه ',
    'بانک گردشگری', 'بانک ایران زمین', ' خاورمیانه','صنعت و معدن',
];

const toPersianDigits = (num: number | string, options: Intl.NumberFormatOptions = { useGrouping: true }) => {
    if (num === null || num === undefined || num === '') return '';
    return new Intl.NumberFormat('fa-IR', options).format(Number(num));
};

const CompanyAccountPage = () => {
    const dispatch = useDispatch();
    const accounts = useSelector((state: RootState) => state.accounts);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [formOpen, setFormOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [transactionOpen, setTransactionOpen] = useState(false);
    const [banks, setBanks] = useState<string[]>(initialIranianBanks);
    const [newBankDialogOpen, setNewBankDialogOpen] = useState(false);
    const [newBankName, setNewBankName] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, id: string | null }>({ open: false, id: null });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

    const { control: accountControl, handleSubmit: handleAccountSubmit, reset: resetAccountForm, setValue: setAccountValue, formState: { errors: accountErrors } } = useForm<AccountFormData>();
    const { control: transControl, handleSubmit: handleTransSubmit, reset: resetTransForm, watch: watchTransaction } = useForm<TransactionFormData>({
        defaultValues: { paymentMethod: 'cash' }
    });

    const paymentMethod = watchTransaction("paymentMethod");

    useEffect(() => {
        if (editingAccount) {
            resetAccountForm(editingAccount);
        } else {
            resetAccountForm({ bankName: 'ملی', branchName: '', branchCode: '', accountNumber: '', balance: 0 });
        }
    }, [editingAccount, resetAccountForm]);

    const handleOpenForm = (account: BankAccount | null = null) => {
        setEditingAccount(account);
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingAccount(null);
    };

    const onAccountSubmit: SubmitHandler<AccountFormData> = (data) => {
        const processedData = { ...data, balance: Number(data.balance) };
        if (editingAccount) {
            dispatch(editAccount({ ...processedData, id: editingAccount.id }));
        } else {
            dispatch(addAccount(processedData));
        }
        handleCloseForm();
    };
    
    const handleDelete = (id: string) => {
        setDeleteConfirm({ open: true, id });
    };

    const confirmDelete = () => {
        if (deleteConfirm.id) {
            dispatch(deleteAccount(deleteConfirm.id));
        }
        setDeleteConfirm({ open: false, id: null });
    };

    const onTransaction: SubmitHandler<TransactionFormData> = (data) => {
        const amount = data.type === 'deposit' ? Number(data.amount) : -Number(data.amount);
        dispatch(updateBalance({ id: data.accountId, amount }));
        console.log("Transaction Data:", data); 
        setTransactionOpen(false);
        resetTransForm();
    };
    
    const handleAddNewBank = () => {
        if (newBankName && !banks.includes(newBankName)) {
            const updatedBanks = [...banks, newBankName].sort();
            setBanks(updatedBanks);
            setAccountValue('bankName', newBankName); 
            setNewBankDialogOpen(false);
            setNewBankName('');
        } else {
            setSnackbar({ open: true, message: 'نام بانک نمی‌تواند خالی یا تکراری باشد.', severity: 'error' });
        }
    };

    const FormRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Typography sx={{ ml: 2, whiteSpace: 'nowrap' }}>{label} :</Typography>
            {children}
        </Box>
    );

    return (
        <Box>
            <Box sx={{ alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent:'flex-end', mt: 1 }}>
                    <Button 
                        variant="outlined" 
                        size={isMobile ? 'small' : 'medium'} 
                        onClick={() => setTransactionOpen(true)}
                        sx={{ fontSize: { xs: '0.5rem', sm: '0.8rem' }, px: { xs: 1, sm:4 } }}
                    >
                        واریز/برداشت
                    </Button>
                    <Button 
                        variant="contained" 
                        size={isMobile ? 'small' : 'medium'} 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenForm()}
                        sx={{ fontSize: { xs: '0.5rem', sm: '0.8rem' }, px: { xs: 1, sm: 4} }}
                    >
                        حساب جدید
                    </Button>
                </Box>
            </Box>
            <Paper>
                <List>
                    {accounts.map((acc, index) => (
                        <React.Fragment key={acc.id}>
                            <ListItem
                                sx={{
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'flex-start', sm: 'center' },
                                    py: 2,
                                }}
                                secondaryAction={
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        width: { xs: '100%', sm: 'auto' },
                                        mt: { xs: 1.5, sm: 0 },
                                        justifyContent: {xs: 'flex-end'}
                                    }}>
                                        <Typography variant="h6" sx={{
                                            fontSize: { xs: '1rem', sm: '1.25rem' },
                                            mr: 2, 
                                            ml: {xs: 'auto', sm: 0} 
                                        }}>
                                            {toPersianDigits(acc.balance || 0)} تومان
                                        </Typography>
                                        <IconButton size="small" aria-label="edit" onClick={() => handleOpenForm(acc)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" aria-label="delete" onClick={() => handleDelete(acc.id)}>
                                            <DeleteIcon color="error" fontSize="small"/>
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText 
                                    primary={`${acc.bankName} - شعبه ${acc.branchName}`} 
                                    secondary={`شماره حساب: ${toPersianDigits(acc.accountNumber, { useGrouping: false })}`}
                                    primaryTypographyProps={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                                    secondaryTypographyProps={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                />
                            </ListItem>
                            {index < accounts.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="sm">
                <DialogTitle>{editingAccount ? 'ویرایش حساب بانکی' : 'افزودن حساب بانکی جدید'}</DialogTitle>
                <form onSubmit={handleAccountSubmit(onAccountSubmit)}>
                    <DialogContent sx={{pt: '20px !important'}}>
                        <FormRow label="نام بانک">
                             <Box sx={{display: 'flex', alignItems: 'center', width: '75%'}}>
                                <Controller name="bankName" control={accountControl} rules={{ required: 'نام بانک اجباری است' }}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!accountErrors.bankName}>
                                            <Select {...field} >
                                                {banks.map(bank => <MenuItem key={bank} value={bank}>{bank}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    )}
                                />
                                <IconButton color="primary" onClick={() => setNewBankDialogOpen(true)}><AddIcon /></IconButton>
                            </Box>
                        </FormRow>
                        <FormRow label="کد شعبه">
                            <Controller name="branchCode" control={accountControl} rules={{ required: 'کد شعبه اجباری است' }} render={({field}) => <TextField {...field} size="small" sx={{width: '75%'}} error={!!accountErrors.branchCode} />}/>
                        </FormRow>
                        <FormRow label="نام شعبه">
                            <Controller name="branchName" control={accountControl} rules={{ required: 'نام شعبه اجباری است' }} render={({field}) => <TextField {...field} size="small" sx={{width: '75%'}} error={!!accountErrors.branchName} />}/>
                        </FormRow>
                        <FormRow label="شماره حساب">
                            <Controller name="accountNumber" control={accountControl} rules={{ required: 'شماره حساب اجباری است' }} render={({field}) => <TextField {...field} size="small" sx={{width: '75%'}} error={!!accountErrors.accountNumber} />}/>
                        </FormRow>
                        <FormRow label="موجودی حساب">
                            <Controller name="balance" control={accountControl} rules={{ required: 'موجودی اولیه اجباری است' }} render={({field}) => <TextField {...field} type="number" size="small" sx={{width: '75%'}} error={!!accountErrors.balance} />}/>
                        </FormRow>
                    </DialogContent>
                    <DialogActions><Button onClick={handleCloseForm}>انصراف</Button><Button type="submit" variant="contained">ذخیره</Button></DialogActions>
                </form>
            </Dialog>

            <Dialog open={newBankDialogOpen} onClose={() => setNewBankDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>افزودن نام بانک جدید</DialogTitle>
                <DialogContent>
                    <TextField autoFocus label="نام بانک" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} fullWidth sx={{mt: 1}}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewBankDialogOpen(false)}>انصراف</Button>
                    <Button onClick={handleAddNewBank}>افزودن</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={transactionOpen} onClose={() => setTransactionOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>واریز یا برداشت متفرقه</DialogTitle>
                <form onSubmit={handleTransSubmit(onTransaction)}>
                    <DialogContent sx={{pt: '20px !important'}}>
                        <FormRow label="نوع تراکنش">
                            <Controller name="type" control={transControl} rules={{ required: true }} render={({field}) => (
                                <FormControl size="small" sx={{width: '75%'}}>
                                    <Select {...field} >
                                        <MenuItem value="withdrawal">برداشت</MenuItem>
                                        <MenuItem value="deposit">واریز</MenuItem>
                                    </Select>
                                </FormControl>
                            )}/>
                        </FormRow>
                        <FormRow label="شماره حساب">
                             <Controller name="accountId" control={transControl} rules={{ required: true }} render={({field}) => (
                                <FormControl size="small" sx={{width: '75%'}}>
                                    <Select {...field} >
                                        {accounts.map(acc => <MenuItem key={acc.id} value={acc.id}>{`${acc.bankName} - ${toPersianDigits(acc.accountNumber, { useGrouping: false })}`}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            )}/>
                        </FormRow>
                        <FormRow label="مبلغ">
                            <Controller name="amount" control={transControl} rules={{ required: true, min: 1 }} render={({field}) => <TextField {...field} type="number" size="small" sx={{width: '75%'}}/>}/>
                        </FormRow>
                        <FormRow label="علت کسری">
                             <Controller name="reason" control={transControl} render={({field}) => <TextField {...field} multiline rows={2} sx={{width: '75%'}}/>}/>
                        </FormRow>
                        <FormRow label="نوع پرداخت">
                            <Controller name="paymentMethod" control={transControl} render={({ field }) => (
                                <RadioGroup {...field} row sx={{ width: '75%' }}>
                                    <FormControlLabel value="cash" control={<Radio />} label="نقدی" />
                                    <FormControlLabel value="check" control={<Radio />} label="چکی" />
                                </RadioGroup>
                            )} />
                        </FormRow>
                        {paymentMethod === 'check' && (
                             <FormRow label="سریال چک">
                                <Controller name="checkSerial" control={transControl} render={({field}) => <TextField {...field} size="small" sx={{width: '75%'}}/>}/>
                            </FormRow>
                        )}
                    </DialogContent>
                    <DialogActions><Button onClick={() => setTransactionOpen(false)}>انصراف</Button><Button type="submit" variant="contained">ثبت</Button></DialogActions>
                </form>
            </Dialog>

            <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>
                <DialogTitle>تایید حذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>آیا از حذف این حساب بانکی اطمینان دارید؟</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })}>انصراف</Button>
                    <Button onClick={confirmDelete} color="error">حذف</Button>
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
export default CompanyAccountPage;