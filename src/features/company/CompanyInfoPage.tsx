import { useState, type ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../../store/store';
import { updateCompanyInfo, type CompanyInfo } from '../../store/slices/companySlice';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    TextField, 
    Button, 
    Avatar, 
    Snackbar, 
    Alert,
    Stepper,    
    Step,    
    StepLabel     
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const CompanyInfoPage = () => {
    const dispatch = useDispatch();
    const companyInfo = useSelector((state: RootState) => state.company);
    const [formData, setFormData] = useState<CompanyInfo>(companyInfo);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [activeStep, setActiveStep] = useState(0);
    const steps = ['اطلاعات اصلی', 'اطلاعات تماس', 'لوگو و تبلیغات'];

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData({ ...formData, logo: event.target?.result as string });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = () => {
        dispatch(updateCompanyInfo(formData));
        setSnackbarOpen(true);
    };
    
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontSize: { xs: '0.75rem', sm: '1.5rem' } }}>
                معرفی شرکت
            </Typography>
            
            <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 600, mx: 'auto' }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Grid container spacing={3} direction="column">
                    {activeStep === 0 && (
                        <>
                            <Grid>
                                <TextField name="name" label="نام شرکت" value={formData.name} onChange={handleChange} fullWidth autoFocus />
                            </Grid>
                            <Grid>
                                <TextField name="managerName" label="نام مدیر" value={formData.managerName} onChange={handleChange} fullWidth />
                            </Grid>
                            <Grid>
                                <TextField name="economicCode" label="کد اقتصادی" value={formData.economicCode} onChange={handleChange} fullWidth />
                            </Grid>
                        </>
                    )}

                    {activeStep === 1 && (
                        <>
                            <Grid>
                                <TextField name="phone" label="شماره تلفن" value={formData.phone} onChange={handleChange} fullWidth autoFocus />
                            </Grid>
                            <Grid>
                                <TextField name="mobile" label="شماره همراه" value={formData.mobile} onChange={handleChange} fullWidth />
                            </Grid>
                            <Grid>
                                <TextField name="fax" label="فکس" value={formData.fax} onChange={handleChange} fullWidth />
                            </Grid>
                            <Grid>
                                <TextField name="address" label="آدرس" value={formData.address} onChange={handleChange} fullWidth multiline rows={3} />
                            </Grid>
                        </>
                    )}

                    {activeStep === 2 && (
                        <>
                            <Grid>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                                    <Avatar src={formData.logo || undefined} sx={{ width: 100, height: 100, mb: 2 }} />
                                    <Button variant="outlined" component="label">
                                        آپلود لوگو
                                        <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                                    </Button>
                                </Box>
                            </Grid>
                            <Grid>
                                <TextField name="promoMessage" label="پیام تبلیغاتی" value={formData.promoMessage} onChange={handleChange} fullWidth multiline rows={3} />
                            </Grid>
                        </>
                    )}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                    >
                        قبلی
                    </Button>
                    
                    {activeStep === steps.length - 1 ? (
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                            ذخیره اطلاعات
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={handleNext}>
                            بعدی
                        </Button>
                    )}
                </Box>
            </Paper>

            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={4000} 
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    اطلاعات شرکت با موفقیت ذخیره شد.
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CompanyInfoPage;