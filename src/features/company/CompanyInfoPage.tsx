import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  companySchema,
  type CompanyFormData,
} from "../../schema/companySchema";
import { type RootState } from "../../store/store";
import { updateCompanyInfo } from "../../store/slices/companySlice";
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
  } = useForm<CompanyFormData>({
    mode: "onTouched",
    resolver: yupResolver(companySchema),
    defaultValues: companyInfo,
  });

  useEffect(() => {
    reset(companyInfo);
  }, [companyInfo, reset]);

  const handleSave = (data: CompanyFormData) => {
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

  const stepFields: (keyof CompanyFormData)[][] = [
    ["name", "managerName", "economicCode"],
    ["phone", "mobile", "address"],
    ["promoMessage"],
  ];

  const handleNext = async () => {
    const fieldsToValidate = stepFields[activeStep];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      const values = getValues();
      dispatch(updateCompanyInfo(values));
      if (activeStep === steps.length - 1) {
        handleSubmit(handleSave)();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    const values = getValues();
    dispatch(updateCompanyInfo(values));
    setActiveStep((prev) => prev - 1);
  };

  const primaryInfoConfig = useMemo<FormField<CompanyFormData>[]>(
    () => [
      {
        name: "name",
        label: "نام شرکت",
        type: "text",
      },
      {
        name: "managerName",
        label: "نام مدیر",
        type: "text",
      },
      {
        name: "economicCode",
        label: "کد اقتصادی",
        type: "text",
      },
    ],
    []
  );

  const contactInfoConfig = useMemo<FormField<CompanyFormData>[]>(
    () => [
      {
        name: "phone",
        label: "شماره تلفن",
        type: "text",
      },
      {
        name: "mobile",
        label: "شماره همراه",
        type: "text",
      },
      { name: "fax", label: "فکس", type: "text" },
      {
        name: "address",
        label: "آدرس",
        type: "textarea",
        rows: 3,
      },
    ],
    []
  );

  const brandingConfig = useMemo<FormField<CompanyFormData>[]>(
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
                        const values = getValues();
                        dispatch(
                          updateCompanyInfo({
                            ...values,
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
