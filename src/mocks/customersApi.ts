import apiClient from "../lib/apiClient";
import { Customer, PersonFormData, Supplier } from "../types/person";

interface FakeApiUser {
  id: number;
  name: string;
  phone: string;
  company: { name: string };
  address: { city: string; street: string };
}

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data } = await apiClient.get<FakeApiUser[]>("/users");
  return data.slice(0, 5).map((user) => ({
    id: user.id,
    name: user.name,
    phone: user.phone.split(" ")[0],
    city: user.address.city,
    address: user.address.street,
    moein: "بدهکاران",
    debt: user.id * 10000,
  }));
};

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const { data } = await apiClient.get<FakeApiUser[]>("/users");
  return data.slice(5, 10).map((user) => ({
    id: user.id,
    name: user.company.name,
    phone: user.phone.split(" ")[0],
    city: user.address.city,
    address: user.address.street,
    moein: "طلبکاران",
  }));
};

export const addPerson = async (personData: {
  type: "customer" | "supplier";
  data: PersonFormData;
}): Promise<Customer | Supplier> => {
  const { data } = await apiClient.post<FakeApiUser>("/users", {
    name: personData.data.name,
    phone: personData.data.phone,
    city: personData.data.city,
    address: personData.data.address,
    moein: personData.data.moein,
  });
  if (personData.type === "customer") {
    return { ...personData.data, id: data.id, debt: 0 } as Customer;
  }
  return { ...personData.data, id: data.id } as Supplier;
};

export const editPerson = async (
  personData: Customer | Supplier
): Promise<Customer | Supplier> => {
  const { data } = await apiClient.put<FakeApiUser>(`/users/${personData.id}`, {
    name: personData.name,
    phone: personData.phone,
  });
  return { ...personData, name: data.name };
};

export const deletePerson = async (personId: number): Promise<void> => {
  await apiClient.delete(`/users/${personId}`);
};
