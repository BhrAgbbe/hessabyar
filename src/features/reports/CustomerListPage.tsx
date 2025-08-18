import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import { type RootState } from '../../store/store';

const CustomerListPage = () => {
    const customers = useSelector((state: RootState) => state.customers);

    return (
        <>
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Typography sx={{ textAlign: 'center', fontWeight:'800', fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>
                    لیست مشتریان فروش
                </Typography>
            </Box>
        <PrintableReportLayout>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>شناسه</TableCell>
                            <TableCell>نام مشتری</TableCell>
                            <TableCell>تلفن</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map(customer => (
                            <TableRow key={customer.id}>
                                <TableCell>{customer.id}</TableCell>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.phone || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </PrintableReportLayout>
        </>
    );
};

export default CustomerListPage;