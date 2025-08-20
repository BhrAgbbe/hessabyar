import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper ,Typography} from '@mui/material';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import { type RootState } from '../../store/store';

const CustomerListPage = () => {
    const customers = useSelector((state: RootState) => state.customers);

    const cellStyles = {
        textAlign: 'center', 
        fontSize: { xs: '0.6rem', sm: '0.8rem' }, 
        p: { xs: 1, sm: 2 } 
    };

    return (
        <>
        <PrintableReportLayout title={
                <Typography
                  variant="h4"
                  sx={{ fontSize: { xs: "0.75rem", sm: "1rem",md:"1.5rem" } }}
                >
                  لیست  مشتریان
                </Typography>
              }>
            <TableContainer component={Paper} elevation={0}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={cellStyles}>شناسه</TableCell>
                            <TableCell sx={cellStyles}>نام مشتری</TableCell>
                            <TableCell sx={cellStyles}>تلفن</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map(customer => (
                            <TableRow key={customer.id}>
                                <TableCell sx={cellStyles}>{customer.id}</TableCell>
                                <TableCell sx={cellStyles}>{customer.name}</TableCell>
                                <TableCell sx={cellStyles}>{customer.phone || '-'}</TableCell>
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