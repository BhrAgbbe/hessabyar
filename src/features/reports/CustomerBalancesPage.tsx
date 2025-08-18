import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store/store";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

const CustomerBalancesPage = () => {
  const customers = useSelector((state: RootState) => state.customers);
  const suppliers = useSelector((state: RootState) => state.suppliers);
  const invoices = useSelector((state: RootState) => state.invoices);
  const transactions = useSelector((state: RootState) => state.transactions);

  const [personType, setPersonType] = useState<"sales" | "purchases">("sales");
  const [searchTerm, setSearchTerm] = useState("");

  const balances = useMemo(() => {
    const personList = personType === "sales" ? customers : suppliers;

    return personList
      .map((person) => {
        let balance = 0;
        if (personType === "sales") {
          const totalSales =
            invoices.sales
              ?.filter((inv) => inv.customerId === person.id)
              .reduce((sum, inv) => sum + inv.grandTotal, 0) || 0;

          const totalReturns =
            invoices.salesReturns
              ?.filter((inv) => inv.customerId === person.id)
              .reduce((sum, inv) => sum + inv.grandTotal, 0) || 0;

          const totalPayments =
            transactions
              ?.filter(
                (tx) => tx.customerId === person.id && tx.type === "receipt"
              )
              .reduce((sum, tx) => sum + tx.amount, 0) || 0;

          balance = totalSales - (totalReturns + totalPayments);
        } else {
          const totalPurchases =
            invoices.purchases
              ?.filter((inv) => inv.customerId === person.id)
              .reduce((sum, inv) => sum + inv.grandTotal, 0) || 0;

          const totalReturns =
            invoices.purchaseReturns
              ?.filter((inv) => inv.customerId === person.id)
              .reduce((sum, inv) => sum + inv.grandTotal, 0) || 0;

          const totalPayments =
            transactions
              ?.filter(
                (tx) => tx.supplierId === person.id && tx.type === "payment"
              )
              .reduce((sum, tx) => sum + tx.amount, 0) || 0;

          balance = totalPayments + totalReturns - totalPurchases;
        }

        return {
          id: person.id,
          name: person.name,
          balance: balance,
        };
      })
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [personType, customers, suppliers, invoices, transactions, searchTerm]);

  return (
    <>
      <Box
        sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 3 }}
      >
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: "800",
            fontSize: { xs: "0.75rem", sm: "1.5rem" },
          }}
        >
          گزارش مانده حساب مشتریان
        </Typography>
      </Box>
      <PrintableReportLayout>
        <Box
          className="no-print"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            gap: 2,
          }}
        >
          <TextField
            label="جستجو نام..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <ToggleButtonGroup
            value={personType}
            exclusive
            onChange={(_e, newValue) => {
              if (newValue) setPersonType(newValue);
            }}
            color="primary"
          >
            <ToggleButton value="sales">فروش</ToggleButton>
            <ToggleButton value="purchases">خرید</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  نام {personType === "sales" ? "مشتری" : "فروشنده"}
                </TableCell>
                <TableCell align="center">مانده نهایی</TableCell>
                <TableCell align="center">وضعیت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balances.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="center">
                    {Math.abs(item.balance).toLocaleString("fa-IR")} تومان
                  </TableCell>
                  <TableCell align="center">
                    {item.balance > 0 ? (
                      <Typography color="error">بدهکار</Typography>
                    ) : item.balance < 0 ? (
                      <Typography color="success">بستانکار</Typography>
                    ) : (
                      <Typography>تسویه</Typography>
                    )}
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

export default CustomerBalancesPage;
