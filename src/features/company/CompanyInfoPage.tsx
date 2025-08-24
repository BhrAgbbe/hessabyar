import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { type RootState } from "../../store/store";
import {
  updateCompanyInfo,
  type CompanyInfo,
} from "../../store/slices/companySlice";
import { Box, Paper, Button, Avatar } from "@mui/material";
import Stepper from "../../components/Stepper";
import Form, { type FormField } from "../../components/Form";
import Snackbar from "@mui/material/Snackbar"; 
import MuiAlert, { type AlertProps } from "@mui/material/Alert"; 
import React from "react";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CompanyInfoPage = () => {
  const dispatch = useDispatch();
  const companyInfo = useSelector((state: RootState) => state.company);
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["اطلاعات اصلی", "اطلاعات تماس", "لوگو و تبلیغات"];

  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const {
    control,
    formState: { errors },
    trigger,
    getValues,
    handleSubmit,
    reset,
  } = useForm<CompanyInfo>({
    mode: "onTouched",
  });

  useEffect(() => {
    reset(companyInfo);
  }, [companyInfo, reset]);

  const handleSave = (data: CompanyInfo) => {
    dispatch(updateCompanyInfo(data));
    setSnackbarMessage("اطلاعات شرکت با موفقیت ذخیره شد.");
    setSnackbarSeverity("success");
    setOpen(true);
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const stepFields: (keyof CompanyInfo)[][] = [
    ["name", "managerName", "economicCode"],
    ["phone", "mobile", "address"],
    ["promoMessage"],
  ];

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      dispatch(updateCompanyInfo(getValues()));
      if (activeStep === steps.length - 1) {
        handleSubmit(handleSave)();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    dispatch(updateCompanyInfo(getValues()));
    setActiveStep((prev) => prev - 1);
  };

  const primaryInfoConfig = useMemo<FormField<CompanyInfo>[]>(
    () => [
      {
        name: "name",
        label: "نام شرکت",
        type: "text",
        rules: { required: "نام شرکت الزامی است" },
      },
      {
        name: "managerName",
        label: "نام مدیر",
        type: "text",
        rules: { required: "نام مدیر الزامی است" },
      },
      {
        name: "economicCode",
        label: "کد اقتصادی",
        type: "text",
        rules: { required: "کد اقتصادی الزامی است" },
      },
    ],
    []
  );

  const contactInfoConfig = useMemo<FormField<CompanyInfo>[]>(
    () => [
      {
        name: "phone",
        label: "شماره تلفن",
        type: "text",
        rules: { required: "شماره تلفن الزامی است" },
      },
      {
        name: "mobile",
        label: "شماره همراه",
        type: "text",
        rules: { required: "شماره همراه الزامی است" },
      },
      { name: "fax", label: "فکس", type: "text" },
      {
        name: "address",
        label: "آدرس",
        type: "textarea",
        rows: 3,
        rules: { required: "آدرس الزامی است" },
      },
    ],
    []
  );

  const brandingConfig = useMemo<FormField<CompanyInfo>[]>(
    () => [
      {
        name: "promoMessage",
        label: "پیام تبلیغاتی",
        type: "textarea",
        rows: 3,
      },
    ],
    []
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Form config={primaryInfoConfig} control={control} errors={errors} />
        );
      case 1:
        return (
          <Form config={contactInfoConfig} control={control} errors={errors} />
        );
      case 2:
        return (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Avatar
                src={companyInfo.logo || undefined}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Button variant="outlined" component="label">
                آپلود لوگو
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        dispatch(
                          updateCompanyInfo({
                            ...getValues(),
                            logo: event.target?.result as string,
                          })
                        );
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </Button>
            </Box>
            <Form config={brandingConfig} control={control} errors={errors} />
          </>
        );
      default:
        return "مرحله ناشناخته";
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          maxWidth: 600,
          mx: "auto",
          direction: "rtl",
        }}
      >
        <Stepper
          steps={steps}
          getStepContent={getStepContent}
          activeStep={activeStep}
          onNext={handleNext}
          onBack={handleBack}
        />
      </Paper>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyInfoPage;
