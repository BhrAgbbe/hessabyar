import React, { ReactNode } from 'react';
import {
  Stepper as MuiStepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  StepConnector,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface StepperProps {
  steps: string[];
  getStepContent: (step: number) => ReactNode;
  onFinish: () => void;
}

const CustomConnector = styled(StepConnector)({
  '& .MuiStepConnector-line': {
    display: 'none',
  },
});

const Stepper: React.FC<StepperProps> = ({ steps, getStepContent, onFinish }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onFinish();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <MuiStepper
        activeStep={activeStep}
        alternativeLabel
        connector={<CustomConnector />}
        sx={{ mb: 4 }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </MuiStepper>
      <>
        <Typography component="div" sx={{ mb: 1 }}>
          {getStepContent(activeStep)}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            بازگشت
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button onClick={handleNext} variant="contained">
            {activeStep === steps.length - 1 ? 'پایان' : 'بعدی'}
          </Button>
        </Box>
      </>
    </Box>
  );
};

export default Stepper;