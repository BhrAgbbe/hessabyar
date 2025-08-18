// import React, { useReducer, useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   TextField,
//   Button,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   List,
//   ListItemButton,
//   ListItemText,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   FormControl,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import AddIcon from "@mui/icons-material/Add";
// import toast, { Toaster } from 'react-hot-toast'; 
// import { type RootState } from "../../store/store";
// import {
//   addInvoice,
//   addPurchase,
//   addSalesReturn,
//   addPurchaseReturn,
//   type Invoice,
//   type InvoiceItem,
// } from "../../store/slices/invoicesSlice";
// import { type Product } from "../../store/slices/productsSlice";

// interface InvoiceFormProps {
//   mode: "sale" | "purchase" | "return" | "proforma";
//   onSaveSuccess: (savedInvoice: Invoice) => void;
// }

// type DraftInvoiceItem = InvoiceItem & { rowId: number; warehouseId: number };

// type InvoiceState = Omit<Invoice, "id" | "invoiceNumber" | "items"> & {
//   items: DraftInvoiceItem[];
// };

// type Action =
//   | { type: "SET_PERSON"; payload: { id: number | null } }
//   | { type: "SET_DATE"; payload: string }
//   | { type: "ADD_EMPTY_ROW"; payload: { defaultQuantity: number } }
//   | { type: "ADD_ITEM"; payload: { product: Product; defaultQuantity: number } }
//   | { type: "REMOVE_ITEM"; payload: number }
//   | {
//       type: "UPDATE_ITEM_QUANTITY";
//       payload: { rowId: number; quantity: number };
//     }
//   | { type: "SET_DISCOUNT_AMOUNT"; payload: number }
//   | { type: "SET_DISCOUNT_PERCENT"; payload: number }
//   | { type: "RECALCULATE_TOTALS" }
//   | { type: "RESET_FORM"; payload: { defaultQuantity: number } };

// const getInitialState = (defaultQuantity: number): InvoiceState => ({
//   customerId: 0,
//   items: [
//     {
//       rowId: Date.now(),
//       productId: 0,
//       quantity: defaultQuantity,
//       unitPrice: 0,
//       warehouseId: 0,
//     },
//   ],
//   issueDate: new Date().toISOString().split("T")[0],
//   subtotal: 0,
//   discountAmount: 0,
//   discountPercent: 0,
//   tax: 0,
//   grandTotal: 0,
// });

// function invoiceReducer(state: InvoiceState, action: Action): InvoiceState {
//   switch (action.type) {
//     case "SET_PERSON":
//       return { ...state, customerId: action.payload.id || 0 };
//     case "ADD_ITEM": {
//       const { product, defaultQuantity } = action.payload;
//       const existingItem = state.items.find(
//         (item) => item.productId === product.id
//       );

//       if (existingItem && !product.allowDuplicate) {
//         return {
//           ...state,
//           items: state.items.map((item) =>
//             item.productId === product.id
//               ? { ...item, quantity: item.quantity + 1 }
//               : item
//           ),
//         };
//       }

//       const newRow: DraftInvoiceItem = {
//         rowId: Date.now(),
//         productId: product.id,
//         quantity: defaultQuantity,
//         unitPrice: product.retailPrice,
//         warehouseId: product.warehouseId,
//       };

//       const lastItem = state.items[state.items.length - 1];
//       if (lastItem && lastItem.productId === 0) {
//         const newItems = [...state.items.slice(0, -1), newRow];
//         return { ...state, items: newItems };
//       }

//       return { ...state, items: [...state.items, newRow] };
//     }
//     case "SET_DATE":
//       return { ...state, issueDate: action.payload };
//     case "ADD_EMPTY_ROW":
//       return {
//         ...state,
//         items: [
//           ...state.items,
//           {
//             rowId: Date.now(),
//             productId: 0,
//             quantity: action.payload.defaultQuantity,
//             unitPrice: 0,
//             warehouseId: 0, 
//           },
//         ],
//       };
//     case "REMOVE_ITEM": {
//       const newItems = state.items.filter(
//         (item) => item.rowId !== action.payload
//       );
//       return {
//         ...state,
//         items:
//           newItems.length > 0
//             ? newItems
//             : [{ rowId: Date.now(), productId: 0, quantity: 1, unitPrice: 0, warehouseId: 0 }],
//       };
//     }
//     case "UPDATE_ITEM_QUANTITY":
//       return {
//         ...state,
//         items: state.items.map((item) =>
//           item.rowId === action.payload.rowId
//             ? { ...item, quantity: action.payload.quantity }
//             : item
//         ),
//       };
//     case "SET_DISCOUNT_AMOUNT":
//       return { ...state, discountAmount: action.payload, discountPercent: 0 };
//     case "SET_DISCOUNT_PERCENT":
//       return { ...state, discountPercent: action.payload, discountAmount: 0 };
//     case "RECALCULATE_TOTALS": {
//       const subtotal = state.items.reduce(
//         (acc, item) => acc + item.unitPrice * item.quantity,
//         0
//       );
//       let totalAfterDiscount = subtotal;
//       if (state.discountAmount > 0) {
//         totalAfterDiscount = subtotal - state.discountAmount;
//       } else if (state.discountPercent > 0) {
//         totalAfterDiscount =
//           subtotal - subtotal * (state.discountPercent / 100);
//       }
//       const taxAmount = totalAfterDiscount * (state.tax / 100);
//       const grandTotal = totalAfterDiscount + taxAmount;
//       return { ...state, subtotal, grandTotal };
//     }
//     case "RESET_FORM":
//       return getInitialState(action.payload.defaultQuantity);
//     default:
//       return state;
//   }
// }

// const InvoiceForm: React.FC<InvoiceFormProps> = ({ mode, onSaveSuccess }) => {
//   const { products, customers, suppliers, invoices, settings } = useSelector(
//     (state: RootState) => state
//   );
//   const defaultQuantity = settings.autoAddQuantity ? 1 : 0;

//   const [state, localDispatch] = useReducer(
//     invoiceReducer,
//     getInitialState(defaultQuantity)
//   );
//   const reduxDispatch = useDispatch();

//   const [personDialogOpen, setPersonDialogOpen] = useState(false);
//   const [productDialogOpen, setProductDialogOpen] = useState(false);
//   const [personSearch, setPersonSearch] = useState("");
//   const [productSearch, setProductSearch] = useState("");
//   const [returnPersonType, setReturnPersonType] = useState<
//     "customer" | "supplier"
//   >("customer");

//   const nextSalesInvoiceNumber =
//     (invoices.sales?.length > 0
//       ? Math.max(...invoices.sales.map((inv) => inv.invoiceNumber))
//       : 0) + 1;
//   const nextPurchaseInvoiceNumber =
//     (invoices.purchases?.length > 0
//       ? Math.max(...invoices.purchases.map((inv) => inv.invoiceNumber))
//       : 0) + 1;
//   const displayInvoiceNumber =
//     mode === "purchase" ? nextPurchaseInvoiceNumber : nextSalesInvoiceNumber;

//   const personList =
//     mode === "sale" || mode === "proforma"
//       ? customers
//       : mode === "purchase"
//       ? suppliers
//       : returnPersonType === "customer"
//       ? customers
//       : suppliers;
//   const personLabel =
//     mode === "sale" || mode === "proforma"
//       ? "مشتری"
//       : mode === "purchase"
//       ? "فروشنده"
//       : returnPersonType === "customer"
//       ? "مشتری"
//       : "فروشنده";

//   useEffect(() => {
//     localDispatch({ type: "RECALCULATE_TOTALS" });
//   }, [state.items, state.discountAmount, state.discountPercent, state.tax]);

//   const handleSaveInvoice = () => {
//     const validItems = state.items.filter(
//       (item) => item.productId > 0 && item.quantity > 0
//     );
//     if (!state.customerId || validItems.length === 0) {
//       toast.error(`لطفا ${personLabel} و حداقل یک کالا با تعداد معتبر انتخاب کنید.`);
//       return;
//     }

//     if (mode === "sale" && settings.checkStockOnHand) {
//       for (const item of validItems) {
//         const product = products.find((p) => p.id === item.productId);
//         if (product && (product.stock[item.warehouseId] ?? 0) < item.quantity) {
//           toast.error(`موجودی کالای "${product.name}" کافی نیست (موجودی: ${ product.stock[item.warehouseId] ?? 0 })`);
//           return;
//         }
//       }
//     }

//     const finalItems = validItems.map(({ ...rest }) => rest);

//     const invoiceData: Omit<Invoice, "id"> = {
//       ...state,
//       items: finalItems,
//       invoiceNumber: displayInvoiceNumber,
//     };

//     if (mode === "sale") reduxDispatch(addInvoice(invoiceData));
//     else if (mode === "purchase") reduxDispatch(addPurchase(invoiceData));
//     else if (mode === "return") {
//       if (returnPersonType === "customer")
//         reduxDispatch(addSalesReturn(invoiceData));
//       else reduxDispatch(addPurchaseReturn(invoiceData));
//     }

//     toast.success("سند با موفقیت صادر شد!");

//     const savedInvoiceForCallback: Invoice = {
//       ...invoiceData,
//       id: Date.now().toString(), 
//     };
//     onSaveSuccess(savedInvoiceForCallback);

//     localDispatch({ type: "RESET_FORM", payload: { defaultQuantity } });
//   };

//   const selectedPerson = personList.find((p) => p.id === state.customerId);

//   return (
//     <Paper sx={{ p: { xs: 2, sm: 3 }, direction: "rtl" }}>
//       <Toaster position="top-center" />
//       {mode === "return" && (
//         <FormControl component="fieldset" sx={{ mb: 2 }}>
//           <RadioGroup
//             row
//             value={returnPersonType}
//             onChange={(e) =>
//               setReturnPersonType(e.target.value as "customer" | "supplier")
//             }
//           >
//             <FormControlLabel
//               value="customer"
//               control={<Radio />}
//               label="برگشت از فروش (مشتری)"
//             />
//             <FormControlLabel
//               value="supplier"
//               control={<Radio />}
//               label="برگشت به خرید (فروشنده)"
//             />
//           </RadioGroup>
//         </FormControl>
//       )}

//       <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
//         <Grid>
//           <TextField
//             label={`نام ${personLabel}`}
//             value={selectedPerson?.name || `انتخاب ${personLabel}`}
//             onClick={() => setPersonDialogOpen(true)}
//             fullWidth
//             InputProps={{ readOnly: true }}
//           />
//         </Grid>
//         <Grid>
//           <TextField
//             label="تاریخ صدور"
//             type="date"
//             value={state.issueDate}
//             onChange={(e) =>
//               localDispatch({ type: "SET_DATE", payload: e.target.value })
//             }
//             fullWidth
//             InputLabelProps={{ shrink: true }}
//           />
//         </Grid>
//         <Grid>
//           <TextField
//             label="شماره فاکتور"
//             value={displayInvoiceNumber || 1}
//             disabled
//             fullWidth
//           />
//         </Grid>
//       </Grid>

//       <TableContainer component={Paper} variant="outlined">
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell sx={{ textAlign: "right", fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>کالا</TableCell>
//               <TableCell align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>تعداد</TableCell>
//               <TableCell align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>قیمت واحد</TableCell>
//               <TableCell align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>قیمت کل</TableCell>
//               <TableCell align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>حذف</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {state.items.map((item) => {
//               const product = products.find((p) => p.id === item.productId);
//               return (
//                 <TableRow key={item.rowId}>
//                   <TableCell
//                     onClick={() => setProductDialogOpen(true)}
//                     sx={{ cursor: "pointer", textAlign: "right", minWidth: 200, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
//                   >
//                     <Typography color={product ? "inherit" : "text.secondary"} sx={{ fontSize: 'inherit' }}>
//                       {product ? product.name : "برای انتخاب کالا کلیک کنید..."}
//                     </Typography>
//                   </TableCell>
//                   <TableCell align="center">
//                     <TextField
//                       type="number"
//                       value={item.quantity}
//                       onChange={(e) =>
//                         localDispatch({
//                           type: "UPDATE_ITEM_QUANTITY",
//                           payload: {
//                             rowId: item.rowId,
//                             quantity: Number(e.target.value),
//                           },
//                         })
//                       }
//                       sx={{ width: 80 }}
//                       size="small"
//                       InputProps={{ inputProps: { min: 0 } }}
//                     />
//                   </TableCell>
//                   <TableCell align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                     {item.unitPrice.toLocaleString()}
//                   </TableCell>
//                   <TableCell align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
//                     {(item.quantity * item.unitPrice).toLocaleString()}
//                   </TableCell>
//                   <TableCell align="center">
//                     <IconButton
//                       color="error"
//                       onClick={() =>
//                         localDispatch({
//                           type: "REMOVE_ITEM",
//                           payload: item.rowId,
//                         })
//                       }
//                     >
//                       <DeleteIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       <Button
//         startIcon={<AddIcon />}
//         onClick={() =>
//           localDispatch({ type: "ADD_EMPTY_ROW", payload: { defaultQuantity } })
//         }
//         sx={{ mt: 1 }}
//       >
//         افزودن ردیف جدید
//       </Button>

//       <Grid container spacing={2} sx={{ mt: 1 }} justifyContent="space-between" alignItems="center">
//         <Grid>
//           <Grid container spacing={2}>
//             <Grid>
//               <TextField
//                 label="تخفیف (مبلغ)"
//                 type="number"
//                 fullWidth
//                 value={state.discountAmount || ""}
//                 onChange={(e) =>
//                   localDispatch({
//                     type: "SET_DISCOUNT_AMOUNT",
//                     payload: Number(e.target.value),
//                   })
//                 }
//               />
//             </Grid>
//             <Grid>
//               <TextField
//                 label="تخفیف (درصد)"
//                 type="number"
//                 fullWidth
//                 value={state.discountPercent || ""}
//                 onChange={(e) =>
//                   localDispatch({
//                     type: "SET_DISCOUNT_PERCENT",
//                     payload: Number(e.target.value),
//                   })
//                 }
//               />
//             </Grid>
//           </Grid>
//         </Grid>
//         <Grid sx={{textAlign: {xs: 'right', md: 'left'}}}>
//           <Typography
//             variant="h5"
//             color="primary.main"
//             sx={{ fontWeight: "bold", fontSize: { xs: '1.15rem', sm: '1.5rem' } }}
//           >
//             مبلغ نهایی:{" "}
//             {state.grandTotal.toLocaleString("fa-IR", {
//               style: "currency",
//               currency: "IRR",
//             })}
//           </Typography>
//         </Grid>
//       </Grid>

//       <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-start" }}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSaveInvoice}
//         >
//           صدور و ذخیره سند
//         </Button>
//       </Box>

//       <Dialog
//         open={personDialogOpen}
//         onClose={() => setPersonDialogOpen(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle>انتخاب {personLabel}</DialogTitle>
//         <DialogContent>
//           <TextField
//             label={`جستجوی ${personLabel}...`}
//             fullWidth
//             variant="outlined"
//             sx={{ mb: 2 }}
//             value={personSearch}
//             onChange={(e) => setPersonSearch(e.target.value)}
//           />
//           <Paper variant="outlined">
//             <List sx={{ maxHeight: 300, overflow: "auto" }}>
//               {personList
//                 .filter((p) =>
//                   p.name.toLowerCase().includes(personSearch.toLowerCase())
//                 )
//                 .map((person) => (
//                   <ListItemButton
//                     key={person.id}
//                     onClick={() => {
//                       localDispatch({
//                         type: "SET_PERSON",
//                         payload: { id: person.id },
//                       });
//                       setPersonDialogOpen(false);
//                     }}
//                   >
//                     <ListItemText
//                       primary={person.name}
//                       secondary={person.phone}
//                     />
//                   </ListItemButton>
//                 ))}
//             </List>
//           </Paper>
//         </DialogContent>
//       </Dialog>
      
//       <Dialog
//         open={productDialogOpen}
//         onClose={() => setProductDialogOpen(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle>انتخاب کالا</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="جستجوی کالا..."
//             fullWidth
//             variant="outlined"
//             sx={{ mb: 2 }}
//             value={productSearch}
//             onChange={(e) => setProductSearch(e.target.value)}
//           />
//           <Paper variant="outlined">
//             <List sx={{ maxHeight: 300, overflow: "auto" }}>
//               {products
//                 .filter((p) =>
//                   p.name.toLowerCase().includes(productSearch.toLowerCase())
//                 )
//                 .map((product) => (
//                   <ListItemButton
//                     key={product.id}
//                     onClick={() => {
//                       localDispatch({
//                         type: "ADD_ITEM",
//                         payload: { product, defaultQuantity },
//                       });
//                       setProductDialogOpen(false);
//                     }}
//                   >
//                     <ListItemText
//                       primary={product.name}
//                       secondary={`${product.retailPrice.toLocaleString()} تومان`}
//                     />
//                   </ListItemButton>
//                 ))}
//             </List>
//           </Paper>
//         </DialogContent>
//       </Dialog>
//     </Paper>
//   );
// };
// export default InvoiceForm;




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

// The base Invoice type requires both customerId and supplierId.
// We'll make them optional at the state level before finalizing.
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

// FIX: Added supplierId to the initial state.
const getInitialState = (defaultQuantity: number): InvoiceState => ({
  customerId: 0,
  supplierId: 0, // Added missing property
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

// FIX: Updated the reducer to handle both customer and supplier IDs correctly.
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
    
    // FIX: Check for either customerId or supplierId
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

  // FIX: Determine selected person based on mode
  const isSupplierMode = mode === 'purchase' || (mode === 'return' && returnPersonType === 'supplier');
  const selectedPersonId = isSupplierMode ? state.supplierId : state.customerId;
  const selectedPerson = personList.find((p) => p.id === selectedPersonId);

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

      <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Grid>
          <TextField
            label={`نام ${personLabel}`}
            value={selectedPerson?.name || `انتخاب ${personLabel}`}
            onClick={() => setPersonDialogOpen(true)}
            fullWidth
            InputProps={{ readOnly: true }}
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
          />
        </Grid>
        <Grid>
          <TextField
            label="شماره فاکتور"
            value={displayInvoiceNumber || 1}
            disabled
            fullWidth
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  textAlign: "right",
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                کالا
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                تعداد
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                قیمت واحد
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                قیمت کل
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
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
                      minWidth: 200,
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    }}
                  >
                    <Typography
                      color={product ? "inherit" : "text.secondary"}
                      sx={{ fontSize: "inherit" }}
                    >
                      {product
                        ? product.name
                        : "برای انتخاب کالا کلیک کنید..."}
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
                      sx={{ width: 80 }}
                      size="small"
                      InputProps={{ inputProps: { min: 0 } }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                  >
                    {item.unitPrice.toLocaleString()}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                  >
                    {(item.quantity * item.unitPrice).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() =>
                        localDispatch({
                          type: "REMOVE_ITEM",
                          payload: item.rowId,
                        })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        startIcon={<AddIcon />}
        onClick={() =>
          localDispatch({ type: "ADD_EMPTY_ROW", payload: { defaultQuantity } })
        }
        sx={{ mt: 1 }}
      >
        افزودن ردیف جدید
      </Button>

      <Grid
        container
        spacing={2}
        sx={{ mt: 1 }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid>
          <Grid container spacing={2}>
            <Grid>
              <TextField
                label="تخفیف (مبلغ)"
                type="number"
                fullWidth
                value={state.discountAmount || ""}
                onChange={(e) =>
                  localDispatch({
                    type: "SET_DISCOUNT_AMOUNT",
                    payload: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid >
              <TextField
                label="تخفیف (درصد)"
                type="number"
                fullWidth
                value={state.discountPercent || ""}
                onChange={(e) =>
                  localDispatch({
                    type: "SET_DISCOUNT_PERCENT",
                    payload: Number(e.target.value),
                  })
                }
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid sx={{ textAlign: { xs: "right", md: "left" } }}>
          <Typography
            variant="h5"
            color="primary.main"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.15rem", sm: "1.5rem" },
            }}
          >
            مبلغ نهایی:{" "}
            {state.grandTotal.toLocaleString("fa-IR", {
              style: "currency",
              currency: "IRR",
            })}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveInvoice}
        >
          صدور و ذخیره سند
        </Button>
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
                      // FIX: Dispatch the correct person type
                      const personType = isSupplierMode ? 'supplier' : 'customer';
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