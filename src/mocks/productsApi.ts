import apiClient from "../lib/apiClient";
import { Product, ProductFormData } from "../types/product";

interface FakeApiPost {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<FakeApiPost[]>("/posts");

  const products: Product[] = data.slice(0, 20).map((post) => ({
    id: post.id,
    name: post.title.substring(0, 20),
    unitId: 1,
    groupId: 1,
    model: `Model ${post.id}`,
    purchasePrice: post.userId * 10000,
    wholesalePrice: post.userId * 12000,
    retailPrice: post.userId * 15000,
    warehouseId: 1,
    barcode: `123456789${post.id}`,
    allowDuplicate: false,
    stock: { 1: post.id * 10 },
  }));

  return products;
};

export const addProduct = async (
  newProduct: ProductFormData
): Promise<Product> => {
  const { data } = await apiClient.post<FakeApiPost>("/posts", {
    title: newProduct.name,
    body: "new product body",
    userId: 1,
  });

  return {
    ...newProduct,
    id: data.id,
    stock: {},
  };
};

export const editProduct = async (
  productToUpdate: Product
): Promise<Product> => {
  const { data } = await apiClient.put<FakeApiPost>(
    `/posts/${productToUpdate.id}`,
    {
      id: productToUpdate.id,
      title: productToUpdate.name,
      body: "updated product body",
      userId: 1,
    }
  );

  return {
    ...productToUpdate,
    name: data.title,
  };
};

export const deleteProduct = async (productId: number): Promise<void> => {
  await apiClient.delete(`/posts/${productId}`);
};
