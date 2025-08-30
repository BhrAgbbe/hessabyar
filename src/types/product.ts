export interface Product {
  id: number;
  name: string;
  unitId: number;
  model?: string;
  groupId: number;
  purchasePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  warehouseId: number;
  barcode?: string;
  allowDuplicate: boolean;
  stock: { [warehouseId: number]: number };
}

export type ProductFormData = Omit<Product, 'id' | 'stock'>;