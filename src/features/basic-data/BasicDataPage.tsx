import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import toast, { Toaster } from 'react-hot-toast'; 
import { type RootState } from "../../store/store";
import {
  type Product,
  type ProductFormData,
  addProduct,
  editProduct,
  deleteProduct,
} from "../../store/slices/productsSlice";
import { CrudTable } from "../../components/CrudTable";
import {
  addGroup,
  editGroup,
  deleteGroup,
} from "../../store/slices/groupsSlice";
import { addUnit, editUnit, deleteUnit } from "../../store/slices/unitsSlice";
import {
  addWarehouse,
  editWarehouse,
  deleteWarehouse,
} from "../../store/slices/warehousesSlice";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box
          sx={{
            maxHeight: "calc(100vh - 250px)",
            overflowY: "auto",
            p: 3,
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

const BasicDataPage = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);
  const [productView, setProductView] = useState<"form" | "report">("form");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState<"name" | "code">("name");
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['اطلاعات اصلی', 'اطلاعات قیمت', 'انبار و تنظیمات'];

  const { products, groups, units, warehouses } = useSelector(
    (state: RootState) => state
  );
  
  const { control, handleSubmit, reset, trigger } = useForm<ProductFormData>();

  const getNextProductId = () => {
    const maxId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) : 14;
    return maxId < 15 ? 15 : maxId + 1;
  };

  const handleSetFormView = (product: Product | null = null) => {
    setActiveStep(0);
    setEditingProduct(product);
    if (product) {
      reset(product);
    } else {
      reset({
        name: "",
        unitId: 0,
        groupId: 0,
        model: "",
        purchasePrice: 0,
        wholesalePrice: 0,
        retailPrice: 0,
        warehouseId: 0,
        barcode: "",
        allowDuplicate: false,
      });
    }
    setProductView("form");
  };

  const onProductSubmit: SubmitHandler<ProductFormData> = (data) => {
    const processedData = {
      ...data,
      purchasePrice: Number(data.purchasePrice),
      wholesalePrice: Number(data.wholesalePrice),
      retailPrice: Number(data.retailPrice),
    };
    if (editingProduct) {
      dispatch(editProduct({ ...processedData, id: editingProduct.id }));
      toast.success("کالا با موفقیت ویرایش شد.");
    } else {
      dispatch(addProduct(processedData));
      toast.success("کالا با موفقیت ثبت شد.");
    }
    handleSetFormView(null);
  };

  const handleProductDelete = (id: number) => {
    if (window.confirm("آیا از حذف این کالا اطمینان دارید؟")) {
      dispatch(deleteProduct(id));
      toast.success("کالا با موفقیت حذف شد.");
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchBy === "name") {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return String(p.id).includes(searchTerm);
    });
  }, [products, searchTerm, searchBy]);

  const handleNextStep = async () => {
    let isValid = false;
    if (activeStep === 0) {
        isValid = await trigger(['name', 'groupId', 'unitId']);
    } else if (activeStep === 1) {
        isValid = await trigger(['purchasePrice', 'retailPrice']);
    }

    if (isValid) {
        setActiveStep((prev) => prev + 1);
    }
  };

  const handleBackStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Box>
      <Toaster position="top-center" reverseOrder={false} />
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>
        اطلاعات پایه
      </Typography>

      <Paper>
        <Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)}>
          <Tab label="معرفی کالا" />
          <Tab label="گروه‌ها" />
          <Tab label="واحدها" />
          <Tab label="انبارها" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          {productView === "form" ? (
            <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", boxShadow: "none" }}>
              <Typography variant="h6" sx={{ textAlign: "center", mb: 3 }}>
                {editingProduct ? 'ویرایش کالا' : 'معرفی کالای جدید'}
              </Typography>
              
              <Stepper activeStep={activeStep} alternativeLabel sx={{mb: 4}}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <form onSubmit={handleSubmit(onProductSubmit)}>
                <Grid container spacing={2.5} direction="column">
                  <Grid sx={{ textAlign: "right" }}>
                    <Typography>
                      کد کالا:{" "}
                      {editingProduct ? editingProduct.id : getNextProductId()}
                    </Typography>
                  </Grid>

                  {activeStep === 0 && (
                    <>
                      <Grid ><Controller name="name" control={control} rules={{ required: true }} render={({ field }) => (<TextField {...field} label="نام کالا" fullWidth autoFocus />)}/></Grid>
                      <Grid ><Controller name="model" control={control} render={({ field }) => (<TextField {...field} label="مدل کالا" fullWidth />)}/></Grid>
                      <Grid ><Controller name="groupId" control={control} rules={{ required: true, min: 1 }} render={({ field }) => (
                          <FormControl fullWidth><InputLabel>گروه کالا</InputLabel><Select {...field} label="گروه کالا">{groups.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}</Select></FormControl>
                      )}/></Grid>
                      <Grid ><Controller name="unitId" control={control} rules={{ required: true, min: 1 }} render={({ field }) => (
                          <FormControl fullWidth><InputLabel>واحد کالا</InputLabel><Select {...field} label="واحد کالا">{units.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}</Select></FormControl>
                      )}/></Grid>
                      <Grid ><Controller name="barcode" control={control} render={({ field }) => (<TextField {...field} label="شماره بارکد" fullWidth />)}/></Grid>
                    </>
                  )}

                  {activeStep === 1 && (
                     <>
                        <Grid><Controller name="purchasePrice" control={control} rules={{ required: true }} render={({ field }) => (<TextField {...field} type="number" label="قیمت خرید" fullWidth autoFocus />)}/></Grid>
                        <Grid><Controller name="retailPrice" control={control} rules={{ required: true }} render={({ field }) => (<TextField {...field} type="number" label="قیمت فروش" fullWidth />)}/></Grid>
                        <Grid><Controller name="wholesalePrice" control={control} render={({ field }) => (<TextField {...field} type="number" label="قیمت فروش عمده" fullWidth />)}/></Grid>
                     </>
                  )}

                  {activeStep === 2 && (
                    <>
                      <Grid><Controller name="warehouseId" control={control} rules={{ required: true, min: 1 }} render={({ field }) => (
                        <FormControl fullWidth><InputLabel>انبار</InputLabel><Select {...field} label="انبار">{warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}</Select></FormControl>
                      )}/></Grid>
                      <Grid><Controller name="allowDuplicate" control={control} render={({ field }) => (<FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="امکان تکرار پذیری کالا در فاکتور"/>)}/></Grid>
                    </>
                  )}
                  
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button disabled={activeStep === 0} onClick={handleBackStep}>قبلی</Button>
                    <Box>
                        {activeStep < steps.length - 1 && (<Button variant="contained" onClick={handleNextStep}>بعدی</Button>)}
                        {activeStep === steps.length - 1 && (<Button type="submit" variant="contained">ذخیره کالا</Button>)}
                    </Box>
                    <Button variant="outlined" onClick={() => setProductView("report")}>مشاهده لیست</Button>
                </Box>
              </form>
            </Paper>
          ) : (
            <PrintableReportLayout title="لیست گزارش کالا">
              <Box className="no-print" sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <TextField label="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small"/>
                <RadioGroup row value={searchBy} onChange={(e) => setSearchBy(e.target.value as "name" | "code")}>
                  <FormControlLabel value="name" control={<Radio size="small" />} label="نام کالا"/>
                  <FormControlLabel value="code" control={<Radio size="small" />} label="کد کالا"/>
                </RadioGroup>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead><TableRow><TableCell>کد</TableCell><TableCell>نام کالا</TableCell><TableCell>قیمت فروش</TableCell><TableCell className="no-print">عملیات</TableCell></TableRow></TableHead>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.id}</TableCell>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.retailPrice.toLocaleString()}</TableCell>
                        <TableCell className="no-print">
                          <IconButton size="small" onClick={() => handleSetFormView(p)}><EditIcon /></IconButton>
                          <IconButton size="small" onClick={() => handleProductDelete(p.id)}><DeleteIcon color="error" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box className="no-print" sx={{ mt: 2, textAlign: "center" }}>
                <Button variant="contained" onClick={() => handleSetFormView(null)}>ثبت کالای جدید</Button>
              </Box>
            </PrintableReportLayout>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <CrudTable title="گروه" items={groups} onAdd={addGroup} onEdit={editGroup} onDelete={deleteGroup} />
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <CrudTable title="واحد" items={units} onAdd={addUnit} onEdit={editUnit} onDelete={deleteUnit}/>
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <CrudTable title="انبار" items={warehouses} onAdd={addWarehouse} onEdit={editWarehouse} onDelete={deleteWarehouse} />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default BasicDataPage;