import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Typography, Paper, Button, TextField, FormControlLabel,
  Table,Grid, TableContainer, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, FormControl, Select, MenuItem, Menu, RadioGroup, Radio, DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { type RootState } from '../../store/store';
import { type Customer, addCustomer, editCustomer, deleteCustomer, type MoeinCategory } from '../../store/slices/customersSlice';
import { type Supplier, addSupplier, editSupplier, deleteSupplier } from '../../store/slices/suppliersSlice';

type Person = Customer | Supplier;
type PersonFormData = Omit<Person, 'id'>;

const moeinCategories: MoeinCategory[] = ['بدهکاران','طلبکاران','همکاران',' متفرقه', 'ضایعات'];

const CustomerManagementPage = () => {
    const dispatch = useDispatch();
    const [personType, setPersonType] = useState<'customer' | 'supplier'>('customer');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'city'>('name');
    const [formOpen, setFormOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [personIdToDelete, setPersonIdToDelete] = useState<number | null>(null);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const { customers, suppliers } = useSelector((state: RootState) => state);
    const { control, handleSubmit, reset, formState: { errors } } = useForm<PersonFormData>();

    const handleTitleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handlePersonTypeChange = (type: 'customer' | 'supplier') => {
        setPersonType(type);
        handleMenuClose();
    };

    const data = useMemo(() => {
        const sourceData = personType === 'customer' ? customers : suppliers;
        
        const filtered = sourceData.filter(p => {
            const term = searchTerm.toLowerCase().trim();
            if (!term) return true; 

            if (sortBy === 'name') {
                return p.name.toLowerCase().includes(term);
            } 
            if (sortBy === 'city') {
                return (p.city || '').toLowerCase().includes(term);
            }
            return true;
        });

        return [...filtered].sort((a, b) => {
            const valueA = a[sortBy] || '';
            const valueB = b[sortBy] || '';
            return valueA.localeCompare(valueB, 'fa');
        });
    }, [personType, customers, suppliers, searchTerm, sortBy]);

    const getNextId = () => {
        const sourceData = personType === 'customer' ? customers : suppliers;
        const maxId = sourceData.length > 0 ? Math.max(...sourceData.map(p => p.id)) : 99;
        return maxId < 100 ? 100 : maxId + 1;
    };

    const handleOpenForm = (person: Person | null = null) => {
        setEditingPerson(person);
        reset(person || { name: '', phone: '', city: '', address: '', moein: 'بدهکاران' });
        setFormOpen(true);
    };

    const handleCloseForm = () => {
        setFormOpen(false);
        setEditingPerson(null);
    };

    const onSubmit: SubmitHandler<PersonFormData> = (formData) => {
        if (formData.phone) {
            const allPersons = [...customers, ...suppliers];
            const existingPersonWithPhone = allPersons.find(p =>
                p.phone === formData.phone && p.id !== editingPerson?.id
            );

            if (existingPersonWithPhone) {
                toast.error(`این شماره همراه قبلا برای کاربر با کد ${existingPersonWithPhone.id} ثبت شده است.`);
                return;
            }
        }

        if (personType === 'customer') {
            if (editingPerson) {
                dispatch(editCustomer({ ...formData, id: editingPerson.id } as Customer));
            } else {
                dispatch(addCustomer(formData as Omit<Customer, 'id'>));
            }
        } else {
            if (editingPerson) {
                dispatch(editSupplier({ ...formData, id: editingPerson.id } as Supplier));
            } else {
                dispatch(addSupplier(formData as Omit<Supplier, 'id'>));
            }
        }
        toast.success(editingPerson ? 'ویرایش با موفقیت انجام شد' : 'شخص جدید با موفقیت اضافه شد');
        handleCloseForm();
    };

    const handleOpenDeleteModal = (id: number) => {
        setPersonIdToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setPersonIdToDelete(null);
        setDeleteModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (personIdToDelete === null) return;

        if (personType === 'customer') {
            dispatch(deleteCustomer(personIdToDelete));
        } else {
            dispatch(deleteSupplier(personIdToDelete));
        }
        toast.success('شخص با موفقیت حذف شد.');
        handleCloseDeleteModal();
    };

    const headerCellStyle = {
        textAlign: 'center',
        color: 'text.secondary',
        fontWeight: 600,
        borderBottom: 'none',
        fontSize: { xs: '0.75rem', md: '0.875rem' }, 
        p: { xs: 1, md: 2 },
    };
    
    const bodyCellStyle = {
        textAlign: 'center',
        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
        fontSize: { xs: '0.75rem', md: '0.875rem' }, 
        p: { xs: 1, md: 2 },
        wordBreak: 'break-word', 
    };

    return (
        <Box sx={{p: { xs: 1, sm: 2, md: 3 }, direction: 'rtl'}}>
            <Toaster 
                position="top-center" 
                reverseOrder={false}
                toastOptions={{
                    duration: 5000,
                }}
            />
            <Paper sx={{p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
                <Box sx={{
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3,
                    gap: 2, 
                }}>
                    <div>
                        <Button
                            id="person-type-button"
                            aria-controls={menuOpen ? 'person-type-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={menuOpen ? 'true' : undefined}
                            onClick={handleTitleClick}
                            endIcon={<ArrowDropDownIcon />}
                            sx={{ color: 'text.primary', textTransform: 'none' }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                لیست {personType === 'customer' ? 'مشتریان فروش' : 'مشتریان خرید'}
                            </Typography>
                        </Button>
                        <Menu
                            id="person-type-menu"
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            MenuListProps={{ 'aria-labelledby': 'person-type-button' }}
                        >
                            <MenuItem onClick={() => handlePersonTypeChange('customer')}>مشتریان فروش</MenuItem>
                            <MenuItem onClick={() => handlePersonTypeChange('supplier')}>مشتریان خرید</MenuItem>
                        </Menu>
                    </div>

                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpenForm()}
                        sx={{ 
                            backgroundColor: '#673ab7', 
                            '&:hover': { backgroundColor: '#5e35b1' },
                            borderRadius: 2,
                            boxShadow: 'none',
                            px: 3,
                            width: { xs: '100%', sm: 'auto' }, 
                        }}
                    >
                        افزودن شخص جدید
                    </Button>
                </Box>
                
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3, 
                    gap: 2 
                }}>
                     <TextField
                        placeholder={`جستجو بر اساس ${sortBy === 'name' ? 'نام' : 'شهر'}...`}
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: { xs: '100%', md: '280px' } }} 
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                            مرتب‌سازی:
                        </Typography>
                        <FormControl size="small" variant="outlined" fullWidth>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'city')}
                            >
                                <MenuItem value="name">نام</MenuItem>
                                <MenuItem value="city">شهر</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>

                <TableContainer>
                    <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-root': { py: 1 } }}>
                                <TableCell sx={{...headerCellStyle, width: '15%'}}>کد</TableCell>
                                <TableCell sx={{...headerCellStyle, width: '30%'}}>نام</TableCell>
                                <TableCell sx={{...headerCellStyle, width: '25%'}}>تلفن</TableCell>
                                <TableCell sx={{...headerCellStyle, width: '15%'}}>شهر</TableCell>
                                <TableCell sx={{...headerCellStyle, width: '15%'}}>عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map(person => (
                                <TableRow key={person.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={bodyCellStyle}>{person.id}</TableCell>
                                    <TableCell sx={bodyCellStyle}>{person.name}</TableCell>
                                    <TableCell sx={bodyCellStyle}>{person.phone || '-'}</TableCell>
                                    <TableCell sx={bodyCellStyle}>{person.city || '-'}</TableCell>
                                    <TableCell sx={bodyCellStyle}>
                                        <IconButton size="small" onClick={() => handleOpenForm(person)}><EditIcon fontSize="small" /></IconButton>
                                        <IconButton size="small" onClick={() => handleOpenDeleteModal(person.id)}><DeleteIcon color="error" fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={formOpen} onClose={handleCloseForm} fullWidth maxWidth="sm" dir="rtl">
                <DialogTitle sx={{textAlign: 'right'}}>{editingPerson ? 'ویرایش شخص' : 'افزودن شخص جدید'}</DialogTitle>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography component="label" sx={{fontWeight: 'medium'}}>نوع شخص:</Typography>
                                <RadioGroup
                                    row
                                    value={personType}
                                    onChange={(e) => setPersonType(e.target.value as 'customer' | 'supplier')}
                                >
                                    <FormControlLabel value="customer" control={<Radio size="small" />} label="مشتری فروش" />
                                    <FormControlLabel value="supplier" control={<Radio size="small" />} label="مشتری خرید" />
                                </RadioGroup>
                            </Box>
                            
                            <Grid container spacing={2}>
                                <Grid>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography component="label">کد:</Typography>
                                        <TextField value={editingPerson ? editingPerson.id : getNextId()} disabled fullWidth size="small"/>
                                    </Box>
                                </Grid>
                                <Grid>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography component="label">معین:</Typography>
                                        <Controller name="moein" control={control} render={({field}) => (
                                            <FormControl fullWidth size="small">
                                                <Select {...field} defaultValue="بدهکاران">
                                                    {moeinCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        )}/>
                                    </Box>
                                </Grid>
                                <Grid >
                                    <Controller name="name" control={control} rules={{required: 'نام اجباری است'}} render={({field}) => 
                                        <TextField {...field} label="نام کاربر" fullWidth size="small" error={!!errors.name} helperText={errors.name?.message}/>
                                    }/>
                                </Grid>
                                <Grid >
                                    <Controller name="phone" control={control} render={({field}) => <TextField {...field} label="شماره همراه" fullWidth size="small" />}/>
                                </Grid>
                                <Grid>
                                    <Controller name="address" control={control} render={({field}) => <TextField {...field} label="آدرس" fullWidth multiline rows={2} size="small"/>}/>
                                </Grid>
                                <Grid>
                                    <Controller name="city" control={control} render={({field}) => <TextField {...field} label="نام شهر" fullWidth size="small"/>}/>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{p: 2, px: 3}}>
                        <Button onClick={handleCloseForm} color="secondary">انصراف</Button>
                        <Button type="submit" variant="contained">ذخیره</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal} dir="rtl">
                <DialogTitle>تایید حذف</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        آیا از حذف این شخص اطمینان دارید؟ این عمل قابل بازگشت نیست.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteModal} color="secondary">انصراف</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">حذف</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CustomerManagementPage;