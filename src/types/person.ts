export type MoeinCategory = 'بدهکاران' |'طلبکاران'|'همکاران'|' متفرقه' | 'ضایعات';

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  city?: string;
  address?: string;
  moein?: MoeinCategory;
  debt?: number;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  city?: string;
  address?: string;
  moein?: MoeinCategory;
}

export type PersonFormData = Omit<Customer, 'id'>;
