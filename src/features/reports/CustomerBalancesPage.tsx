import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
} from "@mui/material";
import { type RootState } from "../../store/store";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";
import EnhancedMuiTable, { type HeadCell } from "../../components/Table";
import SearchAndSortPanel from "../../components/SearchAndSortPanel";
import { toPersianDigits } from "../../utils/utils"; 

interface BalanceData {
  id: number;
  name: string;
  balance: number;
}

const CustomerBalancesPage = () => {
  const { customers, suppliers, invoices, transactions } = useSelector(
    (state: RootState) => state
  );

  const [personType, setPersonType] = useState<"sales" | "purchases">("sales");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const balances = useMemo(() => {
    const personList = personType === "sales" ? customers : suppliers;

    let calculatedBalances = personList.map((person) => {
      let balance = 0;
      if (personType === "sales") {
        const totalSales =
          invoices.sales
            ?.filter((inv) => inv.customerId === person.id)
            .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0) || 0;
        const totalReturns =
          invoices.salesReturns
            ?.filter((inv) => inv.customerId === person.id)
            .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0) || 0;
        const totalPayments =
          transactions
            ?.filter(
              (tx) => tx.customerId === person.id && tx.type === "receipt"
            )
            .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
        balance = totalSales - (totalReturns + totalPayments);
      } else {
        const totalPurchases =
          invoices.purchases
            ?.filter((inv) => inv.customerId === person.id)
            .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0) || 0;
        const totalReturns =
          invoices.purchaseReturns
            ?.filter((inv) => inv.customerId === person.id)
            .reduce((sum, inv) => sum + (inv.grandTotal || 0), 0) || 0;
        const totalPayments =
          transactions
            ?.filter(
              (tx) => tx.supplierId === person.id && tx.type === "payment"
            )
            .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
        balance = totalPayments + totalReturns - totalPurchases;
      }
      return { id: person.id, name: person.name, balance };
    });

    if (searchTerm) {
      calculatedBalances = calculatedBalances.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (sortBy) {
      case "balanceHigh":
        calculatedBalances.sort((a, b) => b.balance - a.balance);
        break;
      case "balanceLow":
        calculatedBalances.sort((a, b) => a.balance - b.balance);
        break;
      case "name":
      default:
        calculatedBalances.sort((a, b) => a.name.localeCompare(b.name, "fa"));
        break;
    }

    return calculatedBalances;
  }, [personType, customers, suppliers, invoices, transactions, searchTerm, sortBy]);

  const sortOptions = [
    { value: "name", label: "نام" },
    { value: "balanceHigh", label: "بیشترین مانده" },
    { value: "balanceLow", label: "کمترین مانده" },
  ];

  const headCells: readonly HeadCell<BalanceData>[] = [
    {
      id: "name",
      numeric: false,
      label: `نام ${personType === "sales" ? "مشتری" : "فروشنده"}`,
      width: '33.33%',
      align: "center",
    },
    {
      id: "balance",
      numeric: true,
      label: "مانده نهایی",
      align: "center",
      cell: (row) => `${toPersianDigits(Math.abs(row.balance))} تومان`,
      width: '33.33%',
    },
    {
      id: "balance", 
      numeric: false,
      label: "وضعیت",
      align: "center",
      cell: (row) =>
        row.balance > 0 ? (
          <Typography variant="body2" color="error.main" fontWeight="bold">بدهکار</Typography>
        ) : row.balance < 0 ? (
          <Typography variant="body2" color="success.main" fontWeight="bold">بستانکار</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">تسویه</Typography>
        ),
      width: '33.33%',
    },
  ];

  return (
    <PrintableReportLayout>
      <Box
        className="no-print"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 2,
        }}
      >
        <FormControl component="fieldset">
          <RadioGroup
            row
            name="report-type"
            value={personType}
            onChange={(e) => setPersonType(e.target.value as "sales" | "purchases")}
          >
            <Typography sx={{ fontWeight: 'bold', alignSelf: 'center', ml: 2 }}>
              نوع گزارش:
            </Typography>
            <FormControlLabel value="sales" control={<Radio />} label="مشتریان" />
            <FormControlLabel value="purchases" control={<Radio />} label="فروشندگان" />
          </RadioGroup>
        </FormControl>
      </Box>

      <SearchAndSortPanel
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOptions={sortOptions}
      />

      <EnhancedMuiTable
        rows={balances}
        headCells={headCells}
        title={`لیست مانده حساب ${personType === "sales" ? "مشتریان" : "فروشندگان"}`}
      />
    </PrintableReportLayout>
  );
};

export default CustomerBalancesPage;