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

export const toPersianDigitsString = (str: string | number | null | undefined): string => {
  if (str === null || str === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
};