import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box } from "@mui/material";

import EnhancedMuiTable, { type HeadCell } from "../../components/Table";
import SearchAndSortPanel from "../../components/SearchAndSortPanel";
import { PrintableReportLayout } from "../../components/layout/PrintableReportLayout";
import AddPerson from "../../components/Addperson";
import { type SelectOption } from "../../components/SearchableSelect";

import { type RootState } from "../../store/store";
import { addSupplier, type Supplier, type MoeinCategory } from "../../store/slices/suppliersSlice";
import { addCustomer, type Customer } from "../../store/slices/customersSlice";
import { useToast } from "../../hooks/useToast";

const moeinCategories: MoeinCategory[] = ["بدهکاران", "طلبکاران", "همکاران", " متفرقه", "ضایعات"];
const moeinOptions: SelectOption[] = moeinCategories.map(cat => ({ id: cat, label: cat }));

const SupplierListPage = () => {
    const dispatch = useDispatch();
    const { showToast } = useToast();
    const { customers, suppliers } = useSelector((state: RootState) => state);
    const allPersons = useMemo(() => [...customers, ...suppliers], [customers, suppliers]);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchField, setSearchField] = useState<keyof Supplier>("name");
    const [personType, setPersonType] = useState<'customer' | 'supplier'>('supplier');

    const searchOptions = [
        { value: "name", label: "نام فروشنده" },
        { value: "phone", label: "تلفن" },
        { value: "id", label: "شناسه" },
    ];

    const headCells: readonly HeadCell<Supplier>[] = [
        { id: "id", numeric: true, label: "شناسه", width: '25%', align: 'center' },
        { id: "name", numeric: false, label: "نام فروشنده", width: '25%', align: 'center' },
        { id: "phone", numeric: false, label: "تلفن", cell: (row) => row.phone || "-", width: '25%', align: 'center' },
        { id: "address", numeric: false, label: "آدرس", cell: (row) => row.address || "-", width: '25%', align: 'center' },
    ];

    const getNextId = () => {
        const sourceData = personType === 'customer' ? customers : suppliers;
        const maxId = sourceData.length > 0 ? Math.max(...sourceData.map((p) => Number(p.id))) : 99;
        return maxId < 100 ? 100 : maxId + 1;
    };

    const handleSaveNewPerson = (personData: Omit<Supplier & Customer, 'id'>) => {
        if (personType === 'supplier') {
            dispatch(addSupplier(personData));
            showToast('فروشنده جدید با موفقیت اضافه شد', 'success');
        } else {
            dispatch(addCustomer(personData));
            showToast('مشتری جدید با موفقیت اضافه شد', 'success');
        }
    };

    const filteredSuppliers = useMemo(() => {
        if (!searchTerm) {
            return suppliers;
        }
        return suppliers.filter((supplier) => {
            const fieldValue = supplier[searchField];
            return fieldValue?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [suppliers, searchTerm, searchField]);

    return (
        <PrintableReportLayout
            primaryAction={
                <AddPerson
                    personType={personType}
                    onPersonTypeChange={setPersonType}
                    onSave={handleSaveNewPerson}
                    getNextId={getNextId}
                    moeinOptions={moeinOptions}
                    existingPersons={allPersons} 
                />
            }
        >
            <Box sx={{ mb: 2 }}>
                <SearchAndSortPanel
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    sortBy={searchField}
                    onSortByChange={(value) => setSearchField(value as keyof Supplier)}
                    sortOptions={searchOptions}
                />
            </Box>

            <EnhancedMuiTable
                rows={filteredSuppliers}
                headCells={headCells}
                title=""
            />
        </PrintableReportLayout>
    );
};

export default SupplierListPage;