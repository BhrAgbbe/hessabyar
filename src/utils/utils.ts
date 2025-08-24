export const initialIranianBanks = [
    'ملت', 'ملی', 'صادرات', 'تجارت', 'سپه', 'مسکن', 'کشاورزی', 'پارسیان', 'پاسارگاد',
    'اقتصاد نوین', 'سامان', 'سینا', 'شهر', 'دی', 'آینده', 'سرمایه', 'پست بانک ایران',
    'کارآفرینان', 'توسعه تعاون', 'رفاه ', ' قرض‌الحسنه ',
    'بانک گردشگری', 'بانک ایران زمین', ' خاورمیانه','صنعت و معدن',
];

export const toPersianDigits = (num: number | string, options: Intl.NumberFormatOptions = { useGrouping: true }) => {
    if (num === null || num === undefined || num === '') return '';
    return new Intl.NumberFormat('fa-IR', options).format(Number(num));
};