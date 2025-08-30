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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup'; 
import { productSchema } from "../../schema/productSchema"; 
import { type RootState } from "../../store/store";
import { useToast } from "../../hooks/useToast";
import {
    type ProductFormData,
    addProduct,
    editProduct,
    deleteProduct,
} from "../../store/slices/productsSlice";
import {type Product } from '../../types/product';

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
import ConfirmationDialog from "../../components/ConfirmationDialog";
import { groupSchema } from "../../schema/groupSchema";
import { unitSchema } from "../../schema/unitSchema";
import { warehouseSchema } from "../../schema/warehouseSchema"; 

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
    const { showToast } = useToast();
    const [tab, setTab] = useState(0);
    const [productView, setProductView] = useState<"form" | "report">("report");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "code">("name");
    const [activeStep, setActiveStep] = useState(0);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    
    const steps = ["اطلاعات اصلی", "اطلاعات قیمت", "انبار و تنظیمات"];

    const { products, groups, units, warehouses } = useSelector(
        (state: RootState) => state
    );

    const { control, handleSubmit, reset, trigger, formState: { errors } } = useForm<ProductFormData>({
        resolver: yupResolver(productSchema),
        defaultValues: {
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
        }
    });

    const getNextProductId = () => {
        const maxId =
            products.length > 0 ? Math.max(...products.map((p) => p.id)) : 14;
        return maxId < 15 ? 15 : maxId + 1;
    };

    const handleSetFormView = (product: Product | null = null) => {
        setActiveStep(0);
        setEditingProduct(product);
        reset(product || {
            name: "", unitId: 0, groupId: 0, model: "",
            purchasePrice: 0, wholesalePrice: 0, retailPrice: 0,
            warehouseId: 0, barcode: "", allowDuplicate: false,
        });
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
            showToast("کالا با موفقیت ویرایش شد.", "success");
        } else {
            dispatch(addProduct(processedData));
            showToast("کالا با موفقیت ثبت شد.", "success");
        }
        setProductView("report");
    };

    const handleProductDelete = (id: number) => {
        setDeleteConfirm({ open: true, id });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm.id !== null) {
            dispatch(deleteProduct(deleteConfirm.id));
            showToast("کالا با موفقیت حذف شد.", "success");
            setDeleteConfirm({ open: false, id: null });
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
        let fieldsToValidate: (keyof ProductFormData)[] = [];
        if (activeStep === 0) fieldsToValidate = ['name', 'groupId', 'unitId'];
        if (activeStep === 1) fieldsToValidate = ['purchasePrice', 'retailPrice', 'wholesalePrice'];
        if (activeStep === 2) fieldsToValidate = ['warehouseId'];
        
        const isValid = await trigger(fieldsToValidate);
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
                                render={({ field }) => (
                                 <TextField {...field} label="نام کالا" fullWidth autoFocus error={!!errors.name} helperText={errors.name?.message}/>
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
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.groupId}>
                                        <InputLabel>گروه کالا</InputLabel>
                                        <Select {...field} label="گروه کالا">
                                            {groups.map((g) => (
                                                <MenuItem key={g.id} value={g.id}>
                                                    {g.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.groupId && <Typography color="error" variant="caption" sx={{p:1}}>{errors.groupId.message}</Typography>}
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="unitId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.unitId}>
                                        <InputLabel>واحد کالا</InputLabel>
                                        <Select {...field} label="واحد کالا">
                                            {units.map((u) => (
                                                <MenuItem key={u.id} value={u.id}>
                                                    {u.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                         {errors.unitId && <Typography color="error" variant="caption" sx={{p:1}}>{errors.unitId.message}</Typography>}
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
                                render={({ field }) => (
                                    <TextField {...field} type="number" label="قیمت خرید" fullWidth autoFocus error={!!errors.purchasePrice} helperText={errors.purchasePrice?.message} />
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="retailPrice"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} type="number" label="قیمت فروش" fullWidth error={!!errors.retailPrice} helperText={errors.retailPrice?.message} />
                                )}
                            />
                        </Grid>
                        <Grid>
                            <Controller
                                name="wholesalePrice"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} type="number" label="قیمت فروش عمده" fullWidth error={!!errors.wholesalePrice} helperText={errors.wholesalePrice?.message}/>
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
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.warehouseId}>
                                        <InputLabel>انبار</InputLabel>
                                        <Select {...field} label="انبار">
                                            {warehouses.map((w) => (
                                                <MenuItem key={w.id} value={w.id}>
                                                    {w.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.warehouseId && <Typography color="error" variant="caption" sx={{p:1}}>{errors.warehouseId.message}</Typography>}
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
                        <PrintableReportLayout>
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
                        showToast={showToast}
                        schema={groupSchema} 
                    />
                </TabPanel>
                <TabPanel value={tab} index={2}>
                    <GenericCrudPanel 
                        title="واحد" 
                        items={units} 
                        add_action={addUnit} 
                        edit_action={editUnit} 
                        delete_action={deleteUnit}
                        showToast={showToast}
                        schema={unitSchema} 
                    />
                </TabPanel>
                <TabPanel value={tab} index={3}>
                    <GenericCrudPanel 
                        title="انبار" 
                        items={warehouses} 
                        add_action={addWarehouse} 
                        edit_action={editWarehouse} 
                        delete_action={deleteWarehouse}
                        showToast={showToast}
                        schema={warehouseSchema} 
                    />
                </TabPanel>
            </Paper>

            <ConfirmationDialog
                open={deleteConfirm.open}
                onClose={() => setDeleteConfirm({ open: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="تایید حذف"
                message="آیا از حذف این کالا اطمینان دارید؟"
            />
        </Box>
    );
};

export default BasicDataPage;