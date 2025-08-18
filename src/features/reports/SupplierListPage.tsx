import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,Typography, Box  } from '@mui/material';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import {type RootState } from '../../store/store';

const SupplierListPage = () => {
    const suppliers = useSelector((state: RootState) => state.suppliers);

    return (
        <>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Typography sx={{ textAlign: 'center', fontWeight:'800', fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>
                    لیست مشتریان خرید
                </Typography>
            </Box>
            
            <PrintableReportLayout>
                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>شناسه</TableCell>
                                <TableCell>نام فروشنده</TableCell>
                                <TableCell>تلفن</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {suppliers.map(supplier => (
                                <TableRow key={supplier.id}>
                                    <TableCell>{supplier.id}</TableCell>
                                    <TableCell>{supplier.name}</TableCell>
                                    <TableCell>{supplier.phone || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </PrintableReportLayout>
        </>
    );
};

export default SupplierListPage;