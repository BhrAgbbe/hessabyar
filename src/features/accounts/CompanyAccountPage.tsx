import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Button, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { bankAccountSchema, type BankAccountFormData } from '../../schema/bankAccountSchema';
import * as yup from 'yup'; 

import EnhancedMuiTable, { type HeadCell, type Action } from '../../components/Table';
import FormDialog from '../../components/FormDialog';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Form, { type FormField } from '../../components/Form';
import NewBankDialog from '../../components/NewBankDialog';
import { type SelectOption } from '../../components/SearchableSelect';
import { type RootState } from '../../store/store';
import { addAccount, editAccount, deleteAccount, updateBalance } from '../../store/slices/accountsSlice';
import { addTransaction, editTransaction, deleteTransaction } from '../../store/slices/transactionsSlice';
import {type Transaction } from '../../types/transaction';
import {type BankAccount } from '../../types/account';


import { initialIranianBanks, toPersianDigits } from '../../utils/utils';
import { useToast } from '../../hooks/useToast';

type TransactionFormData = {
  accountId: string;
  date: string;
  type: 'receipt' | 'payment';
  amount: number;
  description: string;
};

const CompanyAccountPage = () => {
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const accounts = useSelector((state: RootState) => state.accounts);
    const transactions = useSelector((state: RootState) => state.transactions);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [accountFormOpen, setAccountFormOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [accountDeleteConfirm, setAccountDeleteConfirm] = useState<{ open: boolean, ids: (string | number)[] }>({ open: false, ids: [] });
    const [banks, setBanks] = useState<string[]>(initialIranianBanks);
    const [newBankDialogOpen, setNewBankDialogOpen] = useState(false);

    const [transactionFormOpen, setTransactionFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [transactionDeleteConfirm, setTransactionDeleteConfirm] = useState<{ open: boolean, ids: string[] }>({ open: false, ids: [] });
    const [transactionModalView, setTransactionModalView] = useState<'form' | 'report'>('form');

    const {
        control: accountControl,
        handleSubmit: handleAccountSubmit,
        reset: resetAccountForm,
        setValue: setAccountValue,
        formState: { errors: accountErrors }
    } = useForm<BankAccountFormData>({
        resolver: yupResolver(bankAccountSchema as yup.ObjectSchema<BankAccountFormData>),
        defaultValues: {
            bankName: '',
            branchName: '',
            branchCode: '',
            accountNumber: '',
            cardNumber: null,
            balance: 0,
        }
    });

    const {
        control: transControl,
        handleSubmit: handleTransSubmit,
        reset: resetTransForm,
        formState: { errors: transErrors }
    } = useForm<TransactionFormData>({
        defaultValues: { date: new Date().toISOString(), type: 'receipt', amount: 0, description: '', accountId: '' }
    });

    const bankOptions = useMemo<SelectOption[]>(() =>
        banks.map(bank => ({ id: bank, label: bank })),
        [banks]);

    useEffect(() => {
        if (editingAccount) {
            resetAccountForm(editingAccount);
        } else {
            resetAccountForm({
                bankName: '',
                branchName: '',
                branchCode: '',
                accountNumber: '',
                cardNumber: null,
                balance: 0
            });
        }
    }, [editingAccount, resetAccountForm]);

    useEffect(() => {
        if (editingTransaction) {
            resetTransForm(editingTransaction);
            setTransactionModalView('form');
            setTransactionFormOpen(true);
        } else {
            resetTransForm();
        }
    }, [editingTransaction, resetTransForm]);

    const handleOpenAccountForm = useCallback((account: BankAccount | null = null) => {
        setEditingAccount(account);
        setAccountFormOpen(true);
    }, []);

    const handleCloseAccountForm = () => {
        setAccountFormOpen(false);
        setEditingAccount(null);
    };

    const onAccountSubmit: SubmitHandler<BankAccountFormData> = (data) => {
        const payload = {
            bankName: data.bankName,
            branchName: data.branchName,
            branchCode: data.branchCode,
            accountNumber: data.accountNumber,
            balance: data.balance,
            cardNumber: data.cardNumber || null,
        };

        if (editingAccount) {
            dispatch(editAccount({ ...payload, id: editingAccount.id }));
            showToast('حساب با موفقیت ویرایش شد.', 'success');
        } else {
            dispatch(addAccount(payload));
            showToast('حساب با موفقیت اضافه شد.', 'success');
        }
        handleCloseAccountForm();
    };
    
    const handleAccountDeleteRequest = useCallback((ids: readonly (string | number)[]) => {
        setAccountDeleteConfirm({ open: true, ids: [...ids] });
    }, []);

    const confirmAccountDelete = () => {
        accountDeleteConfirm.ids.forEach(id => dispatch(deleteAccount(String(id))));
        setAccountDeleteConfirm({ open: false, ids: [] });
        showToast('حساب‌های انتخاب شده حذف شدند.', 'success');
    };

    const handleAddNewBank = (newBankName: string) => {
        if (newBankName && !banks.includes(newBankName)) {
            const updatedBanks = [...banks, newBankName].sort();
            setBanks(updatedBanks);
            setAccountValue('bankName', newBankName);
            setNewBankDialogOpen(false);
        } else {
            showToast('نام بانک نمی‌تواند خالی یا تکراری باشد.', 'error');
        }
    };
    
    const handleOpenTransactionForm = useCallback(() => {
        setEditingTransaction(null);
        setTransactionModalView('form');
        setTransactionFormOpen(true);
        resetTransForm();
    }, [resetTransForm]);

    const handleCloseTransactionForm = () => {
        setTransactionFormOpen(false);
        setEditingTransaction(null);
        setTransactionModalView('form');
    };
    
    const onTransactionSubmit: SubmitHandler<TransactionFormData> = (data) => {
        const amount = Number(data.amount);
        const balanceChange = data.type === 'receipt' ? amount : -amount;
        
        if (editingTransaction) {
            const originalTransaction = transactions.find(t => t.id === editingTransaction.id);
            if (!originalTransaction) return;

            const originalAmount = Number(originalTransaction.amount);
            const originalBalanceChange = originalTransaction.type === 'receipt' ? originalAmount : -originalAmount;
            const balanceDelta = balanceChange - originalBalanceChange;

            if (originalTransaction.accountId !== data.accountId) {
                 dispatch(updateBalance({ id: originalTransaction.accountId, amount: -originalBalanceChange }));
                 dispatch(updateBalance({ id: data.accountId, amount: balanceChange }));
            } else {
                 dispatch(updateBalance({ id: data.accountId, amount: balanceDelta }));
            }

            dispatch(editTransaction({ ...data, id: editingTransaction.id }));
            showToast('تراکنش با موفقیت ویرایش شد.', 'success');
        } else {
            dispatch(addTransaction(data));
            dispatch(updateBalance({ id: data.accountId, amount: balanceChange }));
            showToast('تراکنش با موفقیت ثبت شد.', 'success');
        }
        
        handleCloseTransactionForm();
    };
    
    const handleTransactionDeleteRequest = useCallback((ids: readonly string[]) => {
        setTransactionDeleteConfirm({ open: true, ids: [...ids] });
    }, []);

    const confirmTransactionDelete = () => {
        transactionDeleteConfirm.ids.forEach(id => {
            const transactionToDelete = transactions.find(t => t.id === id);
            if (transactionToDelete) {
                const balanceChange = transactionToDelete.type === 'receipt' ? -Number(transactionToDelete.amount) : Number(transactionToDelete.amount);
                dispatch(updateBalance({ id: transactionToDelete.accountId, amount: balanceChange }));
                dispatch(deleteTransaction(id));
            }
        });
        setTransactionDeleteConfirm({ open: false, ids: [] });
        showToast('تراکنش‌های انتخاب شده حذف شدند.', 'success');
    };

    const accountHeadCells = useMemo<readonly HeadCell<BankAccount>[]>(() => [
        { id: 'bankName', numeric: false, label: 'نام بانک' },
        { id: 'branchName', numeric: false, label: 'نام شعبه' },
        { id: 'accountNumber', numeric: false, label: 'شماره حساب', cell: (row) => toPersianDigits(row.accountNumber) },
        { id: 'balance', numeric: true, label: 'موجودی (تومان)', cell: (row) => row.balance.toLocaleString('fa-IR') },
    ], []);

    const accountActions = useMemo<readonly Action<BankAccount>[]>(() => [
        { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: (row) => handleOpenAccountForm(row) },
        { icon: <DeleteIcon color="error" fontSize="small" />, tooltip: 'حذف', onClick: (row) => handleAccountDeleteRequest([row.id]) }
    ], [handleOpenAccountForm, handleAccountDeleteRequest]);

    const transactionHeadCells = useMemo<readonly HeadCell<Transaction>[]>(() => {
        const accountMap = new Map(accounts.map(acc => [acc.id, `${acc.bankName} - ${acc.accountNumber}`]));
        return [
            { id: 'date', numeric: false, label: 'تاریخ', cell: (row) => new Date(row.date).toLocaleDateString('fa-IR') },
            { id: 'accountId', numeric: false, label: 'حساب', cell: (row) => toPersianDigits(accountMap.get(row.accountId) || 'نامشخص') },
            { id: 'description', numeric: false, label: 'توضیحات' },
            { id: 'type', numeric: false, label: 'نوع', cell: (row) => row.type === 'receipt' ? 'واریز' : 'برداشت' },
            { id: 'amount', numeric: true, label: 'مبلغ (تومان)', cell: (row) => row.amount.toLocaleString('fa-IR') },
        ];
    }, [accounts]);

    const transactionActions = useMemo<readonly Action<Transaction>[]>(() => [
        { icon: <EditIcon fontSize="small" />, tooltip: 'ویرایش', onClick: (row) => setEditingTransaction(row) },
        { icon: <DeleteIcon color="error" fontSize="small" />, tooltip: 'حذف', onClick: (row) => handleTransactionDeleteRequest([row.id]) }
    ], [handleTransactionDeleteRequest]);

    const accountFormConfig: FormField<BankAccountFormData>[] = [
        { name: 'bankName', label: 'نام بانک', type: 'select', options: bankOptions },
        { name: 'branchName', label: 'نام شعبه', type: 'text' },
        { name: 'branchCode', label: 'کد شعبه', type: 'text' },
        { name: 'accountNumber', label: 'شماره حساب', type: 'text' },
        { name: 'cardNumber', label: 'شماره کارت (اختیاری)', type: 'text' },
        { name: 'balance', label: 'موجودی اولیه (تومان)', type: 'number' }
    ];

    const transactionFormConfig: FormField<TransactionFormData>[] = useMemo(() => {
        const accountOptions: SelectOption[] = accounts.map(acc => ({
            id: acc.id,
            label: `${acc.bankName} - ${toPersianDigits(acc.accountNumber)}`
        }));
        const transactionTypeOptions: SelectOption[] = [
            { id: 'receipt', label: 'واریز' },
            { id: 'payment', label: 'برداشت' },
        ];
        return [
            { name: 'accountId', label: 'حساب بانکی', type: 'select', options: accountOptions, rules: { required: 'انتخاب حساب بانکی الزامی است' } },
            { name: 'date', label: 'تاریخ تراکنش', type: 'date', rules: { required: 'انتخاب تاریخ الزامی است' } },
            { name: 'type', label: 'نوع تراکنش', type: 'select', options: transactionTypeOptions, rules: { required: 'انتخاب نوع تراکنش الزامی است' } },
            { name: 'amount', label: 'مبلغ (تومان)', type: 'number', rules: { required: 'وارد کردن مبلغ الزامی است', valueAsNumber: true, validate: (value: number) => value > 0 || 'مبلغ باید بزرگتر از صفر باشد' } },
            { name: 'description', label: 'توضیحات', type: 'textarea', rows: 3, rules: { required: 'ارائه توضیحات الزامی است' } },
        ];
    }, [accounts]);
    
    const renderModalContent = () => {
        if (transactionModalView === 'report') {
            return (
                <Box>
                    <EnhancedMuiTable
                        rows={transactions}
                        headCells={transactionHeadCells}
                        title="گزارش واریز و برداشت‌های متفرقه"
                        actions={transactionActions}
                        onDelete={(selectedIds) => handleTransactionDeleteRequest(selectedIds as string[])}
                    />
                    <Button variant="contained" onClick={() => setTransactionModalView('form')} sx={{ mt: 2 }}>
                       بازگشت به فرم
                    </Button>
                </Box>
            );
        }

        return (
            <Box>
                <Form config={transactionFormConfig} control={transControl} errors={transErrors} />
                <Button 
                    variant="text" 
                    onClick={() => setTransactionModalView('report')} 
                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                >
                    مشاهده گزارش
                </Button>
            </Box>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, mb: 2, mt: 1, flexWrap: 'wrap' }}>
                <Button variant="contained" size={isMobile ? 'small' : 'medium'} onClick={() => handleOpenAccountForm()}>
                    حساب جدید
                </Button>
                <Button variant="outlined" size={isMobile ? 'small' : 'medium'} onClick={handleOpenTransactionForm}>
                    واریز / برداشت جدید
                </Button>
            </Box>

            <EnhancedMuiTable
                rows={accounts}
                headCells={accountHeadCells}
                title="حساب‌های بانکی شرکت"
                actions={accountActions}
                onDelete={handleAccountDeleteRequest}
            />

            <FormDialog
                open={accountFormOpen}
                onClose={handleCloseAccountForm}
                title={editingAccount ? 'ویرایش حساب بانکی' : 'افزودن حساب جدید'}
                onSave={handleAccountSubmit(onAccountSubmit)}
            >
                <Form config={accountFormConfig} control={accountControl} errors={accountErrors} />
                <Button variant="text" onClick={() => setNewBankDialogOpen(true)} sx={{ mt: 2, alignSelf: 'flex-start' }}>
                    افزودن بانک جدید
                </Button>
            </FormDialog>
            <NewBankDialog open={newBankDialogOpen} onClose={() => setNewBankDialogOpen(false)} onSave={handleAddNewBank} />
            <ConfirmationDialog
                open={accountDeleteConfirm.open}
                onClose={() => setAccountDeleteConfirm({ ...accountDeleteConfirm, open: false })}
                onConfirm={confirmAccountDelete}
                title="تایید حذف حساب"
                message={`آیا از حذف ${toPersianDigits(accountDeleteConfirm.ids.length)} حساب بانکی اطمینان دارید؟`}
            />

            <FormDialog
                open={transactionFormOpen}
                onClose={handleCloseTransactionForm}
                title={editingTransaction ? 'ویرایش تراکنش' : (transactionModalView === 'form' ? 'ثبت واریز یا برداشت جدید' : 'گزارش تراکنش‌ها')}
                onSave={handleTransSubmit(onTransactionSubmit)}
                saveText="ثبت"
            >
                {renderModalContent()}
            </FormDialog>

            <ConfirmationDialog
                open={transactionDeleteConfirm.open}
                onClose={() => setTransactionDeleteConfirm({ ...transactionDeleteConfirm, open: false })}
                onConfirm={confirmTransactionDelete}
                title="تایید حذف تراکنش"
                message={`آیا از حذف ${toPersianDigits(transactionDeleteConfirm.ids.length)} تراکنش اطمینان دارید؟`}
            />
        </Box>
    );
};

export default CompanyAccountPage;