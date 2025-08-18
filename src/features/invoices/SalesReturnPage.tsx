import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import InvoiceForm from "./InvoiceForm";
import { type Invoice } from "../../store/slices/invoicesSlice";

const SalesReturnPage = () => {
  const navigate = useNavigate();

  const handleSaveSuccess = (savedInvoice: Invoice) => {
    console.log("Sales return saved:", savedInvoice);
    navigate("/");
  };

  return (
    <Box sx={{ direction: "rtl" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", fontSize: { xs: "0.75rem", sm: "1.5rem" } }}
      >
        برگشت از فروش
      </Typography>
      <InvoiceForm mode="return" onSaveSuccess={handleSaveSuccess} />
    </Box>
  );
};

export default SalesReturnPage;
