import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from '@mui/material';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import {type RootState } from '../../store/store';

const SupplierListPage = () => {
    const suppliers = useSelector((state: RootState) => state.suppliers);

    return (
        <>
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