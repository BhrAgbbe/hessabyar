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
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert,
 
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { type RootState } from "../../store/store";
import {
    type Product,
    type ProductFormData,
    addProduct,
    editProduct,
    deleteProduct,
} from "../../store/slices/productsSlice";
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
import Stepper from "../../components/Stepper";
import GenericCrudPanel from "../../components/GenericCrudPanel";
import SearchAndSortPanel from "../../components/SearchAndSortPanel";

function TabPanel(props: {
    children?: React.ReactNode;
    index: number;
    value: number;
}) {
    const { children, value, index, ...other } = props;
    return (
        <Box role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box
                    sx={{
                        maxHeight: "calc(100vh - 250px)",
                        overflow: "auto",
                        p: 3,
                    }}
                >
                    {children}
                </Box>
            )}
        </Box>
    );
}

const BasicDataPage = () => {
    const dispatch = useDispatch();
    const [tab, setTab] = useState(0);
    const [productView, setProductView] = useState<"form" | "report">("report");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "code">("name");
    const [activeStep, setActiveStep] = useState(0);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);
    

    const steps = ["اطلاعات اصلی", "اطلاعات قیمت", "انبار و تنظیمات"];

    const { products, groups, units, warehouses } = useSelector(
        (state: RootState) => state
    );

    const { control, handleSubmit, reset, trigger } = useForm<ProductFormData>();

    const getNextProductId = () => {
        const maxId =
            products.length > 0 ? Math.max(...products.map((p) => p.id)) : 14;
        return maxId < 15 ? 15 : maxId + 1;
    };

    const handleShowToast = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
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
            handleShowToast("کالا با موفقیت ویرایش شد.", "success");
        } else {
            dispatch(addProduct(processedData));
            handleShowToast("کالا با موفقیت ثبت شد.", "success");
        }
        handleSetFormView(null);
        setProductView("report");
    };

    const handleProductDelete = (id: number) => {
        if (window.confirm("آیا از حذف این کالا اطمینان دارید؟")) {
            dispatch(deleteProduct(id));
            handleShowToast("کالا با موفقیت حذف شد.", "success");
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const term = searchTerm.trim();
            if (!term) return true;
            if (sortBy === "name") {
                return p.name.toLowerCase().includes(term.toLowerCase());
            }
            return String(p.id).includes(term);
        });
    }, [products, searchTerm, sortBy]);

    const handleNext = async () => {
        const isValid = await trigger();
        if (isValid) {
            if (activeStep === steps.length - 1) {
                handleSubmit(onProductSubmit)(); 
            } else {
                setActiveStep((prevActiveStep) => prevActiveStep + 1); 
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2.5} direction="column">
                        <Grid>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: "نام کالا الزامی است" }}
                                render={({ field, fieldState }) => (
                                    <TextField {...field} label="نام کالا" fullWidth autoFocus error={!!fieldState.error} helperText={fieldState.error?.message}/>
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="model"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="مدل کالا" fullWidth />
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="groupId"
                                control={control}
                                rules={{ required: "گروه کالا الزامی است", validate: value => value > 0 || "گروه کالا الزامی است" }}
                                render={({ field, fieldState }) => (
                                    <FormControl fullWidth error={!!fieldState.error}>
                                        <InputLabel>گروه کالا</InputLabel>
                                        <Select {...field} label="گروه کالا">
                                            {groups.map((g) => (
                                                <MenuItem key={g.id} value={g.id}>
                                                    {g.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldState.error && <Typography color="error" variant="caption" sx={{p:1}}>{fieldState.error.message}</Typography>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="unitId"
                                control={control}
                                rules={{ required: "واحد کالا الزامی است", validate: value => value > 0 || "واحد کالا الزامی است" }}
                                render={({ field, fieldState }) => (
                                    <FormControl fullWidth error={!!fieldState.error}>
                                        <InputLabel>واحد کالا</InputLabel>
                                        <Select {...field} label="واحد کالا">
                                            {units.map((u) => (
                                                <MenuItem key={u.id} value={u.id}>
                                                    {u.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                         {fieldState.error && <Typography color="error" variant="caption" sx={{p:1}}>{fieldState.error.message}</Typography>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="barcode"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="شماره بارکد" fullWidth />
                                )}
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={2.5} direction="column">
                        <Grid>
                            <Controller
                                name="purchasePrice"
                                control={control}
                                rules={{ required: "قیمت خرید الزامی است", validate: value => value > 0 || "قیمت باید بزرگتر از صفر باشد" }}
                                render={({ field, fieldState }) => (
                                    <TextField {...field} type="number" label="قیمت خرید" fullWidth autoFocus error={!!fieldState.error} helperText={fieldState.error?.message} />
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="retailPrice"
                                control={control}
                                rules={{ required: "قیمت فروش الزامی است", validate: value => value > 0 || "قیمت باید بزرگتر از صفر باشد" }}
                                render={({ field, fieldState }) => (
                                    <TextField {...field} type="number" label="قیمت فروش" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="wholesalePrice"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} type="number" label="قیمت فروش عمده" fullWidth />
                                )}
                            />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={2.5} direction="column">
                        <Grid>
                            <Controller
                                name="warehouseId"
                                control={control}
                                rules={{ required: "انبار الزامی است", validate: value => value > 0 || "انبار الزامی است" }}
                                render={({ field, fieldState }) => (
                                    <FormControl fullWidth error={!!fieldState.error}>
                                        <InputLabel>انبار</InputLabel>
                                        <Select {...field} label="انبار">
                                            {warehouses.map((w) => (
                                                <MenuItem key={w.id} value={w.id}>
                                                    {w.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {fieldState.error && <Typography color="error" variant="caption" sx={{p:1}}>{fieldState.error.message}</Typography>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="allowDuplicate"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Checkbox {...field} checked={field.value} />}
                                        label="امکان تکرار پذیری کالا در فاکتور"
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                );
            default:
                return 'Unknown step';
        }
    };
    
    const responsiveCellSx = {
        fontSize: { xs: "0.75rem", sm: "0.875rem" },
        p: { xs: 1, sm: 2 },
    };

    const productSortOptions = [
        { value: 'name', label: 'نام کالا' },
        { value: 'code', label: 'کد کالا' }
    ];

    return (
        <Box>
            <Paper sx={{ overflow: "hidden" }}>
                <Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)}>
                    <Tab label="معرفی کالا" />
                    <Tab label="گروه‌ها" />
                    <Tab label="واحدها" />
                    <Tab label="انبارها" />
                </Tabs>

                <TabPanel value={tab} index={0}>
                    {productView === "form" ? (
                        <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", boxShadow: "none" }}>
                             <form onSubmit={handleSubmit(onProductSubmit)}>
                                <Typography sx={{ mb: 2, textAlign: 'right' }}>
                                    کد کالا:{" "}
                                    {editingProduct ? editingProduct.id : getNextProductId()}
                                </Typography>
                                <Stepper 
                                    steps={steps}
                                    getStepContent={getStepContent}
                                    activeStep={activeStep}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                />
                             </form>
                             <Button
                                sx={{mt: 2}}
                                variant="outlined"
                                onClick={() => setProductView("report")}
                              >
                                مشاهده لیست
                              </Button>
                        </Paper>
                    ) : (
                        <PrintableReportLayout title={
                            <Typography variant="h4" sx={{ fontSize: { xs: "1rem", sm: "1.5rem", md: "2rem" } }}>
                                لیست گزارش کالا
                            </Typography>
                        }>
                            <SearchAndSortPanel 
                                searchTerm={searchTerm}
                                onSearchTermChange={setSearchTerm}
                                sortBy={sortBy}
                                onSortByChange={(value) => setSortBy(value as 'name' | 'code')}
                                sortOptions={productSortOptions}
                            />
                            
                            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center" sx={responsiveCellSx}>کد</TableCell>
                                            <TableCell align="center" sx={responsiveCellSx}>نام کالا</TableCell>
                                            <TableCell align="center" sx={responsiveCellSx}>قیمت فروش</TableCell>
                                            <TableCell align="center" className="no-print" sx={responsiveCellSx}>عملیات</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredProducts.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell align="center" sx={responsiveCellSx}>{p.id}</TableCell>
                                                <TableCell align="center" sx={responsiveCellSx}>{p.name}</TableCell>
                                                <TableCell align="center" sx={responsiveCellSx}>{p.retailPrice.toLocaleString()}</TableCell>
                                                <TableCell align="center" className="no-print" sx={responsiveCellSx}>
                                                    <IconButton size="small" onClick={() => handleSetFormView(p)}><EditIcon /></IconButton>
                                                    <IconButton size="small" onClick={() => handleProductDelete(p.id)}><DeleteIcon color="error" /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Box className="no-print" sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
                                <Button variant="contained" onClick={() => handleSetFormView(null)}>ثبت کالای جدید</Button>
                            </Box>
                        </PrintableReportLayout>
                    )}
                </TabPanel>

                <TabPanel value={tab} index={1}>
                    <GenericCrudPanel 
                        title="گروه" 
                        items={groups} 
                        add_action={addGroup} 
                        edit_action={editGroup} 
                        delete_action={deleteGroup} 
                        showToast={handleShowToast}
                    />
                </TabPanel>
                <TabPanel value={tab} index={2}>
                    <GenericCrudPanel 
                        title="واحد" 
                        items={units} 
                        add_action={addUnit} 
                        edit_action={editUnit} 
                        delete_action={deleteUnit}
                        showToast={handleShowToast}
                    />
                </TabPanel>
                <TabPanel value={tab} index={3}>
                    <GenericCrudPanel 
                        title="انبار" 
                        items={warehouses} 
                        add_action={addWarehouse} 
                        edit_action={editWarehouse} 
                        delete_action={deleteWarehouse}
                        showToast={handleShowToast}
                    />
                </TabPanel>
            </Paper>

            {snackbar && (
                <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={4000} 
                    onClose={() => setSnackbar(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSnackbar(null)} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            )}
        </Box>
    );
};

export default BasicDataPage;