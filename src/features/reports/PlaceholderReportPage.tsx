import { PrintableReportLayout } from '../../components/layout/PrintableReportLayout';
import { Typography } from '@mui/material';

const PlaceholderReportPage = ({ title }: { title: string }) => {
    return (
        <PrintableReportLayout title={title}>
            <Typography>محتوای این گزارش در حال آماده‌سازی است...</Typography>
        </PrintableReportLayout>
    );
};
export default PlaceholderReportPage;