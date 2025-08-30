import { useState } from 'react';
import { Box, Button } from '@mui/material';
import InvoiceForm from '../../components/InvoiceForm';
import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import {type Invoice } from '../../types/invoice';
import { InvoicePrintView } from '../../components/InvoicePrintView'; 
import { toPersianDigits } from '../../utils/utils';

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
            <PrintableReportLayout title={`پیش‌نمایش پیش فاکتور شماره ${toPersianDigits(savedInvoice.invoiceNumber)}`}>
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