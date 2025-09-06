import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import InvoiceForm from "./InvoiceForm";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";
import { InvoicePrintView } from "./InvoicePrintView";
import { type Invoice } from "../../types/invoice";
import { type RootState } from "../../store/store";
import { toPersianDigits } from "../../utils/utils";

const SalesInvoicePage = () => {
  const settings = useSelector((state: RootState) => state.settings);
  const [viewMode, setViewMode] = useState<"form" | "preview">("form");
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const handleSaveSuccess = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    if (settings.quickPrintInvoice) {
      setViewMode("preview");
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      setConfirmDialogOpen(true);
    }
  };

  const handleCreateNewInvoice = () => {
    setViewMode("form");
    setCurrentInvoice(null);
  };

  const handleConfirmPrint = () => {
    setConfirmDialogOpen(false);
    setViewMode("preview");
  };

  const handleCancelPrint = () => {
    setConfirmDialogOpen(false);
    handleCreateNewInvoice();
  };

  if (viewMode === "preview" && currentInvoice) {
    return (
      <PrintableReportLayout
        title={`پیش‌نمایش فاکتور شماره ${toPersianDigits(
          currentInvoice.invoiceNumber
        )}`}
      >
        <InvoicePrintView invoice={currentInvoice} />
        <Box className="no-print" sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={handleCreateNewInvoice}>
            صدور فاکتور جدید
          </Button>
        </Box>
      </PrintableReportLayout>
    );
  }

  return (
    <>
      <Box>
        <InvoiceForm mode="sale" onSaveSuccess={handleSaveSuccess} />
      </Box>

      <Dialog open={isConfirmDialogOpen} onClose={handleCancelPrint}>
        <DialogTitle>عملیات موفق</DialogTitle>
        <DialogContent>
          <DialogContentText>
            فاکتور با موفقیت ثبت شد. آیا مایل به مشاهده و چاپ آن هستید؟
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelPrint}>خیر</Button>
          <Button onClick={handleConfirmPrint} variant="contained" autoFocus>
            بله، نمایش بده
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SalesInvoicePage;
