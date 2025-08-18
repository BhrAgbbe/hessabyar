import { useState } from 'react';
import { Box, Button } from '@mui/material';
import InvoiceForm from './InvoiceForm';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import { type Invoice } from '../../store/slices/invoicesSlice';
import { InvoicePrintView } from './InvoicePrintView'; 

const ProformaInvoicePage = () => {
    const [savedInvoice, setSavedInvoice] = useState<Invoice | null>(null);

    const handleSaveSuccess = (invoice: Invoice) => {
        setSavedInvoice(invoice);
    };

    const handleCreateNewInvoice = () => {
        setSavedInvoice(null);
    };

    if (savedInvoice) {
        return (
            <PrintableReportLayout title={`پیش‌نمایش پیش فاکتور شماره ${savedInvoice.invoiceNumber}`}>
                <InvoicePrintView invoice={savedInvoice} />
                <Box className="no-print" sx={{ mt: 2, direction: 'rtl' }}>
                    <Button variant="outlined" onClick={handleCreateNewInvoice}>
                        صدور پیش فاکتور جدید
                    </Button>
                </Box>
            </PrintableReportLayout>
        );
    }

    return (
        <Box sx={{ direction: 'rtl' }}>
            <InvoiceForm mode="proforma" onSaveSuccess={handleSaveSuccess} />
        </Box>
    );
};

export default ProformaInvoicePage;
