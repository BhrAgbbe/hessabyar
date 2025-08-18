import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip} from '@mui/material';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import {type RootState } from '../../store/store';
import { type CheckStatus } from '../../store/slices/checksSlice';

const getStatusChipColor = (status: CheckStatus) => {
    if (status === 'پاس شده') return 'success';
    if (status === 'برگشتی') return 'error';
    return 'warning';
}

const IssuedCheckListPage = () => {
    const issuedChecks = useSelector((state: RootState) => 
        state.checks.filter(c => c.type === 'issued')
    );

    return (
        <>

            <PrintableReportLayout>
                 <TableContainer component={Paper} elevation={0}>
                    <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: '0.5rem', p: 1, textAlign: 'center', width: '12%' }}>سریال</TableCell>
                                <TableCell sx={{ fontSize: '0.5rem', p: 1, textAlign: 'center', width: '15%' }}>در وجه</TableCell>
                                <TableCell sx={{ fontSize: '0.5rem', p: 1, textAlign: 'center', width: '12%' }}>مبلغ</TableCell>
                                <TableCell sx={{ fontSize: '0.5rem', p: 1, textAlign: 'center', width: '28%' }}>تاریخ سررسید</TableCell>
                                <TableCell sx={{ fontSize: '0.5rem', p: 1, textAlign: 'center', width: '10%' }}>وضعیت</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {issuedChecks.map(check => (
                                <TableRow key={check.id}>
                                    <TableCell sx={{ fontSize: '0.5rem', p: 1, wordBreak: 'break-word', textAlign: 'center' }}>{check.serial}</TableCell>
                                    <TableCell sx={{ fontSize: '0.5rem', p: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{check.payee}</TableCell>
                                    <TableCell sx={{ fontSize: '0.5rem', p: 1, wordBreak: 'break-word', textAlign: 'center' }}>{check.amount.toLocaleString('fa-IR')}</TableCell>
                                    <TableCell sx={{ fontSize: '0.5rem', p: 1, whiteSpace: 'nowrap', textAlign: 'center' }}>{new Date(check.dueDate).toLocaleDateString('fa-IR')}</TableCell>
                                    <TableCell sx={{ fontSize: '0.5rem', p: 1, textAlign: 'center' }}>
                                        <Chip 
                                            label={check.status} 
                                            color={getStatusChipColor(check.status)} 
                                            size="small" 
                                            sx={{ fontSize: '0.7rem' }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </PrintableReportLayout>
        </>
    );
};

export default IssuedCheckListPage;