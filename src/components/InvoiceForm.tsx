import React, { useReducer, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  toPersianDigits,
  toPersianDigitsString,
  toEnglishDigits,
} from "../utils/utils";
import { type RootState } from "../store/store";
import type { Invoice, InvoiceItem } from "../types/invoice";
import { type Product } from "../types/product";
import { type Customer, type Supplier } from "../types/person";
import { useToast } from "../hooks/useToast";
import {
  addInvoice,
  addPurchase,
  addSalesReturn,
  addPurchaseReturn,
} from "../store/slices/invoicesSlice";
import { setCustomers } from "../store/slices/customersSlice";
import { setSupplier } from "../store/slices/suppliersSlice";
import apiClient from "../lib/apiClient";
import SearchableSelect, { type SelectOption } from "./SearchableSelect";
import ShamsiDatePicker from "./DatePicker";
import CustomTextField from "./TextField";
interface ApiUser {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  company: {
    name: string;
    address: {
      address: string;
      city: string;
    };
  };
}

interface ApiResponse {
  users: ApiUser[];
}

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
      payload: {
        id: number | string | null;
        personType: "customer" | "supplier";
      };
    }
  | { type: "SET_DATE"; payload: string | null }
  | { type: "ADD_EMPTY_ROW"; payload: { defaultQuantity: number } }
  | { type: "ADD_ITEM"; payload: { product: Product; defaultQuantity: number } }
  | { type: "REMOVE_ITEM"; payload: number }
  | {
      type: "UPDATE_ITEM_PRODUCT";
      payload: { rowId: number; product: Product };
    }
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
  issueDate: new Date().toISOString(),
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
          customerId: Number(action.payload.id) || 0,
          supplierId: 0,
        };
      } else {
        return {
          ...state,
          supplierId: Number(action.payload.id) || 0,
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
      return {
        ...state,
        issueDate: action.payload || new Date().toISOString(),
      };
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
    case "UPDATE_ITEM_PRODUCT":
      return {
        ...state,
        items: state.items.map((item) =>
          item.rowId === action.payload.rowId
            ? {
                ...item,
                productId: action.payload.product.id,
                unitPrice: action.payload.product.retailPrice,
                warehouseId: action.payload.product.warehouseId,
              }
            : item
        ),
      };
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
  const { showToast } = useToast();
  const reduxDispatch = useDispatch();
  const defaultQuantity = settings.autoAddQuantity ? 1 : 0;

  const [state, localDispatch] = useReducer(
    invoiceReducer,
    getInitialState(defaultQuantity)
  );

  const [returnPersonType, setReturnPersonType] = useState<
    "customer" | "supplier"
  >("customer");

  useEffect(() => {
    const loadInitialData = async () => {
      if (customers.length === 0 && suppliers.length === 0) {
        try {
          const response = await apiClient.get<ApiResponse>("/users");

          const fetchedCustomers: Customer[] = response.data.users.map(
            (user) => ({
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              phone: user.phone,
              city: user.company.address.city,
              address: user.company.address.address,
            })
          );

          const fetchedSuppliers: Supplier[] = response.data.users.map(
            (user) => ({
              id: user.id,
              name: user.company.name,
              phone: user.phone,
              city: user.company.address.city,
              address: user.company.address.address,
            })
          );

          reduxDispatch(setCustomers(fetchedCustomers));
          reduxDispatch(setSupplier(fetchedSuppliers));
        } catch (error) {
          console.error("Failed to fetch persons:", error);
          showToast("خطا در دریافت لیست اشخاص", "error");
        }
      }
    };

    loadInitialData();
  }, [customers.length, suppliers.length, reduxDispatch, showToast]);

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

  const isSupplierMode =
    mode === "purchase" ||
    (mode === "return" && returnPersonType === "supplier");

  const personList = isSupplierMode ? suppliers : customers;
  const personLabel = isSupplierMode ? "فروشنده" : "مشتری";
  const personType = isSupplierMode ? "supplier" : "customer";

  const personOptions: SelectOption[] = Array.isArray(personList)
    ? personList.map((p) => ({ id: p.id, label: p.name }))
    : [];
  const productOptions: SelectOption[] = Array.isArray(products)
    ? products.map((p) => ({ id: p.id, label: p.name }))
    : [];

  const selectedPersonId = isSupplierMode ? state.supplierId : state.customerId;
  const selectedPersonValue =
    personOptions.find((p) => p.id === selectedPersonId) || null;

  useEffect(() => {
    localDispatch({ type: "RECALCULATE_TOTALS" });
  }, [state.items, state.discountAmount, state.discountPercent, state.tax]);

  const handleSaveInvoice = () => {
    const validItems = state.items.filter(
      (item) => item.productId > 0 && item.quantity > 0
    );

    const isPersonSelected = state.customerId || state.supplierId;
    if (!isPersonSelected || validItems.length === 0) {
      showToast(
        `لطفا ${personLabel} و حداقل یک کالا با تعداد معتبر انتخاب کنید.`,
        "error"
      );
      return;
    }

    if (mode === "sale" && settings.checkStockOnHand) {
      for (const item of validItems) {
        const product = products.find((p) => p.id === item.productId);
        if (product && (product.stock[item.warehouseId] ?? 0) < item.quantity) {
          showToast(
            `موجودی کالای "${product.name}" کافی نیست (موجودی: ${
              product.stock[item.warehouseId] ?? 0
            })`,
            "error"
          );
          return;
        }
      }
    }

    const finalItems = validItems.map(({ ...rest }) => rest);

    const invoiceData: Omit<Invoice, "id" | "invoiceNumber"> = {
      ...state,
      items: finalItems,
    };

    if (mode === "sale") reduxDispatch(addInvoice(invoiceData));
    else if (mode === "purchase") reduxDispatch(addPurchase(invoiceData));
    else if (mode === "return") {
      if (returnPersonType === "customer")
        reduxDispatch(addSalesReturn(invoiceData));
      else reduxDispatch(addPurchaseReturn(invoiceData));
    }

    showToast("سند با موفقیت صادر شد!", "success");

    const savedInvoiceForCallback: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      invoiceNumber: displayInvoiceNumber,
    };
    onSaveSuccess(savedInvoiceForCallback);

    localDispatch({ type: "RESET_FORM", payload: { defaultQuantity } });
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
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

      <Grid container spacing={2} sx={{ mb: 3, alignItems: "center" }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SearchableSelect
            label={`نام ${personLabel}`}
            options={personOptions}
            value={selectedPersonValue}
            onChange={(option) =>
              localDispatch({
                type: "SET_PERSON",
                payload: { id: option ? option.id : null, personType },
              })
            }
            sx={{ minWidth: 200 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShamsiDatePicker
            label="تاریخ صدور"
            value={state.issueDate ? new Date(state.issueDate) : null}
            onChange={(date) =>
              localDispatch({
                type: "SET_DATE",
                payload: date ? date.toISOString() : null,
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CustomTextField
            label="شماره فاکتور"
            value={toPersianDigits(displayInvoiceNumber || 1)}
            disabled
            fullWidth
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "flex-start", my: 2 }}>
        <Button
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
            <TableRow>
              <TableCell
                sx={{
                  width: "40%",
                  textAlign: "center",
                  fontSize: { xs: "0.65rem", sm: "0.875rem" },
                }}
              >
                کالا
              </TableCell>
              <TableCell
                sx={{
                  width: "15%",
                  textAlign: "center",
                  fontSize: { xs: "0.65rem", sm: "0.875rem" },
                }}
              >
                تعداد
              </TableCell>
              <TableCell
                sx={{
                  width: "20%",
                  textAlign: "center",
                  fontSize: { xs: "0.65rem", sm: "0.875rem" },
                }}
              >
                قیمت واحد
              </TableCell>
              <TableCell
                sx={{
                  width: "20%",
                  textAlign: "center",
                  fontSize: { xs: "0.65rem", sm: "0.875rem" },
                }}
              >
                قیمت کل
              </TableCell>
              <TableCell
                sx={{
                  width: "5%",
                  textAlign: "center",
                  fontSize: { xs: "0.65rem", sm: "0.875rem" },
                }}
              >
                حذف
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.items.map((item) => {
              const selectedProductValue =
                productOptions.find((p) => p.id === item.productId) || null;
              return (
                <TableRow key={item.rowId}>
                  <TableCell sx={{ p: 1 }}>
                    <SearchableSelect
                      placeholder="انتخاب کالا"
                      label=""
                      options={productOptions}
                      value={selectedProductValue}
                      onChange={(option) => {
                        if (option) {
                          const product = products.find(
                            (p) => p.id === option.id
                          );
                          if (product) {
                            localDispatch({
                              type: "UPDATE_ITEM_PRODUCT",
                              payload: { rowId: item.rowId, product },
                            });
                          }
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ p: 1 }}>
                    <CustomTextField
                      type="text"
                      value={toPersianDigitsString(item.quantity)}
                      onChange={(e) =>
                        localDispatch({
                          type: "UPDATE_ITEM_QUANTITY",
                          payload: {
                            rowId: item.rowId,
                            quantity: Number(toEnglishDigits(e.target.value)),
                          },
                        })
                      }
                      InputProps={{ inputProps: { min: 0 } }}
                      sx={{
                        width: "95%",
                        "& input": { textAlign: "center", p: 1 },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" } }}
                  >
                    {toPersianDigits(item.unitPrice)}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" } }}
                  >
                    {toPersianDigits(item.quantity * item.unitPrice)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        localDispatch({
                          type: "REMOVE_ITEM",
                          payload: item.rowId,
                        })
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid
        container
        spacing={2}
        sx={{ mt: 1 }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid>
          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomTextField
              label="تخفیف (مبلغ)"
              type="text"
              value={toPersianDigitsString(state.discountAmount || "")}
              onChange={(e) =>
                localDispatch({
                  type: "SET_DISCOUNT_AMOUNT",
                  payload: Number(toEnglishDigits(e.target.value)),
                })
              }
            />
            <CustomTextField
              label="تخفیف (درصد)"
              type="text"
              value={toPersianDigitsString(state.discountPercent || "")}
              onChange={(e) =>
                localDispatch({
                  type: "SET_DISCOUNT_PERCENT",
                  payload: Number(toEnglishDigits(e.target.value)),
                })
              }
            />
          </Box>
        </Grid>
        <Grid>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: { xs: "center", md: "flex-start" },
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
              {toPersianDigits(state.grandTotal, {
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
      </Grid>
    </Paper>
  );
};

export default InvoiceForm;
