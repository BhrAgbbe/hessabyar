import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";
import { type RootState } from "../../store/store";
import { type CheckStatus } from "../../store/slices/checksSlice";

const getStatusChipColor = (status: CheckStatus) => {
  if (status === "پاس شده") return "success";
  if (status === "برگشتی") return "error";
  return "warning";
};

const CheckListPage = () => {
  const receivedChecks = useSelector((state: RootState) =>
    state.checks.filter((c) => c.type === "received")
  );

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
          صورت چک‌های دریافتی
        </Typography>
      </Box>
      <PrintableReportLayout>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>سریال</TableCell>
                <TableCell>پرداخت کننده</TableCell>
                <TableCell>مبلغ</TableCell>
                <TableCell>تاریخ سررسید</TableCell>
                <TableCell>وضعیت</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receivedChecks.map((check) => (
                <TableRow key={check.id}>
                  <TableCell>{check.serial}</TableCell>
                  <TableCell>{check.payee}</TableCell>
                  <TableCell>
                    {check.amount.toLocaleString("fa-IR")} تومان
                  </TableCell>
                  <TableCell>
                    {new Date(check.dueDate).toLocaleDateString("fa-IR")}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={check.status}
                      color={getStatusChipColor(check.status)}
                      size="small"
                    />
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

export default CheckListPage;
