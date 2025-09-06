import { useRouter } from "next/router";
import { Box } from "@mui/material";
import InvoiceForm from "./InvoiceForm";
import { type Invoice } from "../../types/invoice";

const SalesReturnPage = () => {
  const router = useRouter();

  const handleSaveSuccess = (savedInvoice: Invoice) => {
    console.log("Sales return saved:", savedInvoice);
    router.push("/");
  };

  return (
    <Box>
      <InvoiceForm mode="return" onSaveSuccess={handleSaveSuccess} />
    </Box>
  );
};

export default SalesReturnPage;
