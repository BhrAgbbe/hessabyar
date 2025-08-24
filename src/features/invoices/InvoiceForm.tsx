import React, { useReducer, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import toast, { Toaster } from "react-hot-toast";
import { type RootState } from "../../store/store";
import {
  addInvoice,
  addPurchase,
  addSalesReturn,
  addPurchaseReturn,
  type Invoice,
  type InvoiceItem,
} from "../../store/slices/invoicesSlice";
import { type Product } from "../../store/slices/productsSlice";

interface InvoiceFormProps {
  mode: "sale" | "purchase" | "return" | "proforma";
  onSaveSuccess: (savedInvoice: Invoice) => void;
}

type DraftInvoiceItem = InvoiceItem & { rowId: number; warehouseId: number };
type InvoiceState = Omit<Invoice, "id" | "invoiceNumber" | "items"> & {
  items: DraftInvoiceItem[];
};

type Action =
  | {
      type: "SET_PERSON";
      payload: { id: number | null; personType: "customer" | "supplier" };
    }
  | { type: "SET_DATE"; payload: string }
  | { type: "ADD_EMPTY_ROW"; payload: { defaultQuantity: number } }
  | { type: "ADD_ITEM"; payload: { product: Product; defaultQuantity: number } }
  | { type: "REMOVE_ITEM"; payload: number }
  | {
      type: "UPDATE_ITEM_QUANTITY";
      payload: { rowId: number; quantity: number };
    }
  | { type: "SET_DISCOUNT_AMOUNT"; payload: number }
  | { type: "SET_DISCOUNT_PERCENT"; payload: number }
  | { type: "RECALCULATE_TOTALS" }
  | { type: "RESET_FORM"; payload: { defaultQuantity: number } };

const getInitialState = (defaultQuantity: number): InvoiceState => ({
  customerId: 0,
  supplierId: 0,
  items: [
    {
      rowId: Date.now(),
      productId: 0,
      quantity: defaultQuantity,
      unitPrice: 0,
      warehouseId: 0,
    },
  ],
  issueDate: new Date().toISOString().split("T")[0],
  subtotal: 0,
  discountAmount: 0,
  discountPercent: 0,
  tax: 0,
  grandTotal: 0,
});

function invoiceReducer(state: InvoiceState, action: Action): InvoiceState {
  switch (action.type) {
    case "SET_PERSON":
      if (action.payload.personType === "customer") {
        return {
          ...state,
          customerId: action.payload.id || 0,
          supplierId: 0,
        };
      } else {
        return {
          ...state,
          supplierId: action.payload.id || 0,
          customerId: 0,
        };
      }
    case "ADD_ITEM": {
      const { product, defaultQuantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.productId === product.id
      );

      if (existingItem && !product.allowDuplicate) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      const newRow: DraftInvoiceItem = {
        rowId: Date.now(),
        productId: product.id,
        quantity: defaultQuantity,
        unitPrice: product.retailPrice,
        warehouseId: product.warehouseId,
      };

      const lastItem = state.items[state.items.length - 1];
      if (lastItem && lastItem.productId === 0) {
        const newItems = [...state.items.slice(0, -1), newRow];
        return { ...state, items: newItems };
      }

      return { ...state, items: [...state.items, newRow] };
    }
    case "SET_DATE":
      return { ...state, issueDate: action.payload };
    case "ADD_EMPTY_ROW":
      return {
        ...state,
        items: [
          ...state.items,
          {
            rowId: Date.now(),
            productId: 0,
            quantity: action.payload.defaultQuantity,
            unitPrice: 0,
            warehouseId: 0,
          },
        ],
      };
    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.rowId !== action.payload
      );
      return {
        ...state,
        items:
          newItems.length > 0
            ? newItems
            : [
                {
                  rowId: Date.now(),
                  productId: 0,
                  quantity: 1,
                  unitPrice: 0,
                  warehouseId: 0,
                },
              ],
      };
    }
    case "UPDATE_ITEM_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.rowId === action.payload.rowId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case "SET_DISCOUNT_AMOUNT":
      return { ...state, discountAmount: action.payload, discountPercent: 0 };
    case "SET_DISCOUNT_PERCENT":
      return { ...state, discountPercent: action.payload, discountAmount: 0 };
    case "RECALCULATE_TOTALS": {
      const subtotal = state.items.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      );
      let totalAfterDiscount = subtotal;
      if (state.discountAmount > 0) {
        totalAfterDiscount = subtotal - state.discountAmount;
      } else if (state.discountPercent > 0) {
        totalAfterDiscount =
          subtotal - subtotal * (state.discountPercent / 100);
      }
      const taxAmount = totalAfterDiscount * (state.tax / 100);
      const grandTotal = totalAfterDiscount + taxAmount;
      return { ...state, subtotal, grandTotal };
    }
    case "RESET_FORM":
      return getInitialState(action.payload.defaultQuantity);
    default:
      return state;
  }
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ mode, onSaveSuccess }) => {
  const { products, customers, suppliers, invoices, settings } = useSelector(
    (state: RootState) => state
  );
  const defaultQuantity = settings.autoAddQuantity ? 1 : 0;

  const [state, localDispatch] = useReducer(
    invoiceReducer,
    getInitialState(defaultQuantity)
  );
  const reduxDispatch = useDispatch();

  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [returnPersonType, setReturnPersonType] = useState<
    "customer" | "supplier"
  >("customer");

  const nextSalesInvoiceNumber =
    (invoices.sales?.length > 0
      ? Math.max(...invoices.sales.map((inv) => inv.invoiceNumber))
      : 0) + 1;
  const nextPurchaseInvoiceNumber =
    (invoices.purchases?.length > 0
      ? Math.max(...invoices.purchases.map((inv) => inv.invoiceNumber))
      : 0) + 1;
  const displayInvoiceNumber =
    mode === "purchase" ? nextPurchaseInvoiceNumber : nextSalesInvoiceNumber;

  const personList =
    mode === "sale" || mode === "proforma"
      ? customers
      : mode === "purchase"
      ? suppliers
      : returnPersonType === "customer"
      ? customers
      : suppliers;
  const personLabel =
    mode === "sale" || mode === "proforma"
      ? "مشتری"
      : mode === "purchase"
      ? "فروشنده"
      : returnPersonType === "customer"
      ? "مشتری"
      : "فروشنده";

  useEffect(() => {
    localDispatch({ type: "RECALCULATE_TOTALS" });
  }, [state.items, state.discountAmount, state.discountPercent, state.tax]);

  const handleSaveInvoice = () => {
    const validItems = state.items.filter(
      (item) => item.productId > 0 && item.quantity > 0
    );

    const isPersonSelected = state.customerId || state.supplierId;
    if (!isPersonSelected || validItems.length === 0) {
      toast.error(
        `لطفا ${personLabel} و حداقل یک کالا با تعداد معتبر انتخاب کنید.`
      );
      return;
    }

    if (mode === "sale" && settings.checkStockOnHand) {
      for (const item of validItems) {
        const product = products.find((p) => p.id === item.productId);
        if (product && (product.stock[item.warehouseId] ?? 0) < item.quantity) {
          toast.error(
            `موجودی کالای "${product.name}" کافی نیست (موجودی: ${
              product.stock[item.warehouseId] ?? 0
            })`
          );
          return;
        }
      }
    }

    const finalItems = validItems.map(({ ...rest }) => rest);

    const invoiceData: Omit<Invoice, "id"> = {
      ...state,
      items: finalItems,
      invoiceNumber: displayInvoiceNumber,
    };

    if (mode === "sale") reduxDispatch(addInvoice(invoiceData));
    else if (mode === "purchase") reduxDispatch(addPurchase(invoiceData));
    else if (mode === "return") {
      if (returnPersonType === "customer")
        reduxDispatch(addSalesReturn(invoiceData));
      else reduxDispatch(addPurchaseReturn(invoiceData));
    }

    toast.success("سند با موفقیت صادر شد!");

    const savedInvoiceForCallback: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
    };
    onSaveSuccess(savedInvoiceForCallback);

    localDispatch({ type: "RESET_FORM", payload: { defaultQuantity } });
  };

  const isSupplierMode =
    mode === "purchase" ||
    (mode === "return" && returnPersonType === "supplier");
  const selectedPersonId = isSupplierMode ? state.supplierId : state.customerId;
  const selectedPerson = personList.find((p) => p.id === selectedPersonId);

  const rtlInputStyle = { '& .MuiInputBase-input': { textAlign: 'right' } };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, direction: "rtl" }}>
      <Toaster position="top-center" />
      {mode === "return" && (
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <RadioGroup
            row
            value={returnPersonType}
            onChange={(e) =>
              setReturnPersonType(e.target.value as "customer" | "supplier")
            }
          >
            <FormControlLabel
              value="customer"
              control={<Radio />}
              label="برگشت از فروش (مشتری)"
            />
            <FormControlLabel
              value="supplier"
              control={<Radio />}
              label="برگشت به خرید (فروشنده)"
            />
          </RadioGroup>
        </FormControl>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid>
          <TextField
            label={`نام ${personLabel}`}
            value={selectedPerson?.name || `انتخاب ${personLabel}`}
            onClick={() => setPersonDialogOpen(true)}
            fullWidth
            InputProps={{ readOnly: true }}
            size="small"
            sx={rtlInputStyle}
          />
        </Grid>
        <Grid>
          <TextField
            label="تاریخ صدور"
            type="date"
            value={state.issueDate}
            onChange={(e) =>
              localDispatch({ type: "SET_DATE", payload: e.target.value })
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
            size="small" 
          />
        </Grid>
        <Grid>
          <TextField
            label="شماره فاکتور"
            value={displayInvoiceNumber || 1}
            disabled
            fullWidth
            size="small" 
            sx={rtlInputStyle}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", my: 2 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={() =>
            localDispatch({
              type: "ADD_EMPTY_ROW",
              payload: { defaultQuantity },
            })
          }
        >
          افزودن ردیف جدید
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { p: 0, border: 'none' } }}>
              <TableCell sx={{ width: '28%' }} />
              <TableCell sx={{ width: '18%' }} />
              <TableCell sx={{ width: '22%' }} />
              <TableCell sx={{ width: '22%' }} />
              <TableCell sx={{ width: '10%' }} />
            </TableRow>
            <TableRow>
              <TableCell sx={{ textAlign: "right", fontSize: { xs: "0.65rem", sm: "0.875rem" }}}>
                کالا
              </TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" }}}>
                تعداد
              </TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" }}}>
                قیمت واحد
              </TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" }}}>
                قیمت کل
              </TableCell>
              <TableCell align="center" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" }}}>
                حذف
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <TableRow key={item.rowId}>
                  <TableCell
                    onClick={() => setProductDialogOpen(true)}
                    sx={{
                      cursor: "pointer",
                      textAlign: "right",
                      fontSize: { xs: "0.65rem", sm: "0.875rem" }, 
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Typography
                      color={product ? "inherit" : "text.secondary"}
                      sx={{ fontSize: "inherit", wordBreak: 'break-word' }} 
                    >
                      {product ? product.name : "برای انتخاب کلیک کنید"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        localDispatch({
                          type: "UPDATE_ITEM_QUANTITY",
                          payload: {
                            rowId: item.rowId,
                            quantity: Number(e.target.value),
                          },
                        })
                      }
                      size="small"
                      InputProps={{ inputProps: { min: 0 } }}
                      sx={{ width: '95%', "& input": { textAlign: "center" } }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" }}}>
                    {item.unitPrice.toLocaleString()}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" }}}>
                    {(item.quantity * item.unitPrice).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="error" onClick={() => localDispatch({ type: "REMOVE_ITEM", payload: item.rowId })}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3 }}>
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid>
            <Grid container spacing={1}>
              <Grid>
                <TextField
                  label="تخفیف (مبلغ)"
                  type="number"
                  size="small"
                  fullWidth
                  value={state.discountAmount || ""}
                  onChange={(e) =>
                    localDispatch({
                      type: "SET_DISCOUNT_AMOUNT",
                      payload: Number(e.target.value),
                    })
                  }
                  sx={{
                    ...rtlInputStyle,
                    '& .MuiInputBase-input': {
                      fontSize: '0.5rem',
                      padding: '11px 18px',
                      textAlign: 'right'
                    },
                  }}
                />
              </Grid>
              <Grid>
                <TextField
                  label="تخفیف (درصد)"
                  type="number"
                  size="small"
                  fullWidth
                  value={state.discountPercent || ""}
                  onChange={(e) =>
                    localDispatch({
                      type: "SET_DISCOUNT_PERCENT",
                      payload: Number(e.target.value),
                    })
                  }
                  sx={{
                    ...rtlInputStyle,
                    '& .MuiInputBase-input': {
                      fontSize: '0.5rem',
                      padding: '11px 18px',
                      textAlign: 'right'
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

        </Grid>
          <Grid
            sx={{ minWidth: 0, overflow: "hidden", flex: 1 }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-end" },
                mt: { xs: 2, md: 0 },
              }}
            >
              <Typography
                variant="h5"
                color="primary.main"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1.0rem", sm: "1.5rem" },
                  textAlign: { xs: "center", sm: "right" },
                  overflowWrap: "break-word",
                  wordBreak: "break-all",
                }}
              >
                مبلغ نهایی:{" "}
                {state.grandTotal.toLocaleString("fa-IR", {
                  style: "currency",
                  currency: "IRR",
                })}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveInvoice}
                sx={{
                  fontSize: { xs: "0.8rem", md: "0.9375rem" },
                  px: { xs: 2, md: 3 },
                }}
              >
                صدور و ذخیره سند
              </Button>
            </Box>
          </Grid>
      </Box>

      <Dialog
        open={personDialogOpen}
        onClose={() => setPersonDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>انتخاب {personLabel}</DialogTitle>
        <DialogContent>
          <TextField
            label={`جستجوی ${personLabel}...`}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            value={personSearch}
            onChange={(e) => setPersonSearch(e.target.value)}
          />
          <Paper variant="outlined">
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {personList
                .filter((p) =>
                  p.name.toLowerCase().includes(personSearch.toLowerCase())
                )
                .map((person) => (
                  <ListItemButton
                    key={person.id}
                    onClick={() => {
                      const personType = isSupplierMode
                        ? "supplier"
                        : "customer";
                      localDispatch({
                        type: "SET_PERSON",
                        payload: { id: person.id, personType },
                      });
                      setPersonDialogOpen(false);
                    }}
                  >
                    <ListItemText
                      primary={person.name}
                      secondary={person.phone}
                    />
                  </ListItemButton>
                ))}
            </List>
          </Paper>
        </DialogContent>
      </Dialog>

      <Dialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>انتخاب کالا</DialogTitle>
        <DialogContent>
          <TextField
            label="جستجوی کالا..."
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          <Paper variant="outlined">
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {products
                .filter((p) =>
                  p.name.toLowerCase().includes(productSearch.toLowerCase())
                )
                .map((product) => (
                  <ListItemButton
                    key={product.id}
                    onClick={() => {
                      localDispatch({
                        type: "ADD_ITEM",
                        payload: { product, defaultQuantity },
                      });
                      setProductDialogOpen(false);
                    }}
                  >
                    <ListItemText
                      primary={product.name}
                      secondary={`${product.retailPrice.toLocaleString()} تومان`}
                    />
                  </ListItemButton>
                ))}
            </List>
          </Paper>
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default InvoiceForm;