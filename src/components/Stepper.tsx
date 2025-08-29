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
import { type StepIconProps } from '@mui/material/StepIcon';

interface StepperProps {
  steps: string[];
  getStepContent: (step: number) => ReactNode;
  activeStep: number;
  onNext: () => void;
  onBack: () => void;
}

const toPersianDigitsString = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};

const PersianStepIcon = (props: StepIconProps) => {
  const { active, completed, className, icon } = props;

  return (
    <Box
      sx={{
        backgroundColor: active || completed ? 'primary.main' : 'grey.400',
        zIndex: 1,
        color: '#fff',
        width: 24,
        height: 24,
        display: 'flex',
        borderRadius: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.875rem',
        fontWeight: 'bold',
      }}
      className={className}
    >
      {toPersianDigitsString(icon as number)}
    </Box>
  );
};


const CustomConnector = styled(StepConnector)({
  '& .MuiStepConnector-line': {
    display: 'none',
  },
});

const Stepper: React.FC<StepperProps> = ({ steps, getStepContent, activeStep, onNext, onBack }) => {
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
            <StepLabel StepIconComponent={PersianStepIcon}>{label}</StepLabel>
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
            onClick={onBack}
            sx={{ mr: 1 }}
          >
            بازگشت
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button onClick={onNext} variant="contained">
            {activeStep === steps.length - 1 ? 'پایان' : 'بعدی'}
          </Button>
        </Box>
      </>
    </Box>
  );
};

export default Stepper;