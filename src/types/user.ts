export interface User {
  id: number;
  username: string;
  role: 'مدیر سیستم' | 'فروشنده' | 'حسابدار' | 'انباردار';
  password?: string;
}