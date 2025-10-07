import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { WorkOrder, Part, User, StoreSettings, WorkOrderPart, Customer, QuotationItem } from '../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, PrinterIcon, XMarkIcon, ChevronDownIcon, ArrowUturnLeftIcon } from './common/Icons';
import Pagination from './common/Pagination';

// Helper to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const NewCustomerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Customer) => void;
    initialName?: string;
}> = ({ isOpen, onClose, onSave, initialName = '' }) => {
    const [formData, setFormData] = useState<Omit<Customer, 'id' | 'loyaltyPoints' | 'lastServiceDate'>>({ name: initialName, phone: '', vehicle: '', licensePlate: '', lastServiceOdometer: undefined });
    
    React.useEffect(() => {
        if(isOpen) {
            setFormData({ name: initialName, phone: '', vehicle: '', licensePlate: '', lastServiceOdometer: undefined });
        }
    }, [isOpen, initialName]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? undefined : parseInt(value, 10)) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalCustomer: Customer = {
            id: `C${Date.now()}`,
            ...formData,
            loyaltyPoints: 0,
            lastServiceDate: formData.lastServiceOdometer ? new Date().toISOString().split('T')[0] : undefined,
        };
        onSave(finalCustomer);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Thêm Khách hàng mới</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="new-customer-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên khách hàng (*)</label>
                                <input id="new-customer-name" type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required autoFocus />
                            </div>
                            <div>
                                <label htmlFor="new-customer-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số điện thoại (*)</label>
                                <input id="new-customer-phone" type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="new-customer-vehicle" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dòng xe</label>
                                    <input id="new-customer-vehicle" type="text" name="vehicle" value={formData.vehicle} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                                </div>
                                <div>
                                    <label htmlFor="new-customer-licensePlate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Biển số xe</label>
                                    <input id="new-customer-licensePlate" type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="new-customer-odometer" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số ODO (km)</label>
                                <input id="new-customer-odometer" type="number" name="lastServiceOdometer" value={formData.lastServiceOdometer || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                            Trở về
                        </button>
                        <button type="submit" className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- WorkOrder Modal for Processing/Editing ---
const WorkOrderModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (workOrder: WorkOrder) => void;
    workOrder: WorkOrder | null;
    parts: Part[];
    currentBranchId: string;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}> = ({ isOpen, onClose, onSave, workOrder, parts, currentBranchId, customers, setCustomers }) => {
    const [formData, setFormData] = useState<Omit<WorkOrder, 'id' | 'creationDate' | 'total'>>(() => {
        const defaults = {
            customerName: '', customerPhone: '', vehicleModel: '', licensePlate: '', issueDescription: '',
            technicianName: '', status: 'Tiếp nhận' as const, laborCost: 0, partsUsed: [], quotationItems: [], notes: '',
            branchId: currentBranchId,
            discount: 0,
            odometerReading: 0,
            serviceTypes: [],
        };
        return workOrder ? { ...workOrder } : defaults;
    });
    
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerListOpen, setIsCustomerListOpen] = useState(false);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
    const [newQuoteItem, setNewQuoteItem] = useState({ description: '', quantity: 1, unitPrice: 0 });
    const customerInputRef = useRef<HTMLDivElement>(null);
    const [openSections, setOpenSections] = useState<string[]>(['customerInfo']);
    const serviceTypesOptions = ['Thay nhớt', 'Bảo dưỡng định kỳ', 'Sửa chữa chung', 'Tân trang'];

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => 
            prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
        );
    };

    const AccordionSection: React.FC<{ title: string; id: string; children: React.ReactNode; }> = ({ title, id, children }) => {
        const isOpen = openSections.includes(id);
        return (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSection(id)} className="w-full flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                    <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">{title}</h3>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <div className="p-4 border-t border-slate-200 dark:border-slate-700">{children}</div>}
            </div>
        );
    };


    const getStatusColorClass = (status: WorkOrder['status']) => {
        switch (status) {
            case 'Tiếp nhận': return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600';
            case 'Đang sửa': return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-700';
            case 'Đã sửa xong': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700';
            case 'Trả máy': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
            default: return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600';
        }
    };

    useEffect(() => {
        const defaults = {
            customerName: '', customerPhone: '', vehicleModel: '', licensePlate: '', issueDescription: '',
            technicianName: '', status: 'Tiếp nhận' as const, laborCost: 0, partsUsed: [], quotationItems: [], notes: '',
            branchId: currentBranchId,
            discount: 0,
            odometerReading: 0,
            serviceTypes: [],
        };
        setFormData(workOrder ? { ...workOrder, quotationItems: workOrder.quotationItems || [], serviceTypes: workOrder.serviceTypes || [] } : defaults);
        setCustomerSearch(workOrder ? workOrder.customerName : '');
        // For mobile-first accordion: Open all sections if editing, otherwise just the first.
        setOpenSections(workOrder ? ['customerInfo', 'issueDetails', 'serviceDetails', 'quotationItems', 'partsUsed'] : ['customerInfo']);
    }, [workOrder, currentBranchId, isOpen]);
    
    // Auto-open next sections as user fills out the form for a new work order (for mobile accordion)
    useEffect(() => {
        if (workOrder || window.innerWidth >= 1024) { // Disable on desktop or when editing
            return;
        }

        const sectionsToOpen = new Set(openSections);
        let hasChanged = false;

        if (sectionsToOpen.has('customerInfo') && formData.customerName && formData.vehicleModel && !sectionsToOpen.has('issueDetails')) {
            sectionsToOpen.add('issueDetails'); hasChanged = true;
        }
        if (sectionsToOpen.has('issueDetails') && formData.issueDescription && !sectionsToOpen.has('serviceDetails')) {
            sectionsToOpen.add('serviceDetails'); hasChanged = true;
        }
        if (sectionsToOpen.has('serviceDetails') && formData.technicianName && !sectionsToOpen.has('partsUsed')) {
            sectionsToOpen.add('partsUsed'); sectionsToOpen.add('quotationItems'); hasChanged = true;
        }
        if (hasChanged) setOpenSections(Array.from(sectionsToOpen));
    }, [formData, workOrder, openSections]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
                setIsCustomerListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return [];
        return customers.filter(c => 
            c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
            c.phone.includes(customerSearch)
        );
    }, [customers, customerSearch]);
    
    const handleSelectCustomer = (customer: Customer) => {
        setFormData(prev => ({
            ...prev,
            customerName: customer.name,
            customerPhone: customer.phone,
            vehicleModel: customer.vehicle,
            licensePlate: customer.licensePlate,
            odometerReading: customer.lastServiceOdometer
        }));
        setCustomerSearch(customer.name);
        setIsCustomerListOpen(false);
    };

    const handleSaveNewCustomer = (newCustomer: Customer) => {
        setCustomers(prev => [newCustomer, ...prev]);
        handleSelectCustomer(newCustomer);
        setIsNewCustomerModalOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'laborCost' || name === 'discount' || name === 'odometerReading' ? parseFloat(value) || 0 : value }));
    };
    
    const handleServiceTypeChange = (serviceType: string) => {
        setFormData(prev => {
            const currentTypes = prev.serviceTypes || [];
            const newTypes = currentTypes.includes(serviceType)
                ? currentTypes.filter(st => st !== serviceType)
                : [...currentTypes, serviceType];
            return { ...prev, serviceTypes: newTypes };
        });
    };


    const handleAddPart = (part: Part) => {
        if (!part) return;
        setFormData(prev => {
            const existingPart = prev.partsUsed?.find(p => p.partId === part.id);
            if (existingPart) {
                return {
                    ...prev,
                    partsUsed: prev.partsUsed?.map(p => p.partId === part.id ? { ...p, quantity: p.quantity + 1 } : p)
                };
            }
            const newPart: WorkOrderPart = {
                partId: part.id,
                partName: part.name,
                sku: part.sku,
                quantity: 1,
                price: part.sellingPrice, // Charge customer the selling price
            };
            return { ...prev, partsUsed: [...(prev.partsUsed || []), newPart] };
        });
    };

    const handleRemovePart = (partId: string) => {
        setFormData(prev => ({ ...prev, partsUsed: prev.partsUsed?.filter(p => p.partId !== partId) }));
    };
    
    const handlePartQuantityChange = (partId: string, newQuantity: number) => {
         setFormData(prev => ({
            ...prev,
            partsUsed: prev.partsUsed?.map(p => p.partId === partId ? { ...p, quantity: newQuantity } : p).filter(p => p.quantity > 0)
        }));
    }

    const handleAddQuoteItem = () => {
        if (!newQuoteItem.description.trim() || !newQuoteItem.unitPrice || newQuoteItem.unitPrice <= 0 || !newQuoteItem.quantity || newQuoteItem.quantity <= 0) {
            alert("Vui lòng điền đầy đủ thông tin hợp lệ cho mục báo giá.");
            return;
        }
        const newItem: QuotationItem = {
            id: `Q-${Date.now()}`,
            description: newQuoteItem.description,
            quantity: newQuoteItem.quantity,
            unitPrice: newQuoteItem.unitPrice,
        };
        setFormData(prev => ({
            ...prev,
            quotationItems: [...(prev.quotationItems || []), newItem],
        }));
        setNewQuoteItem({ description: '', quantity: 1, unitPrice: 0 }); // Reset form
    };

    const handleRemoveQuoteItem = (id: string) => {
        setFormData(prev => ({
            ...prev,
            quotationItems: (prev.quotationItems || []).filter(item => item.id !== id),
        }));
    };

    const handleUpdateQuoteItem = (id: string, field: 'quantity' | 'unitPrice' | 'description', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            quotationItems: (prev.quotationItems || []).map(item =>
                item.id === id ? { ...item, [field]: value } : item
            ),
        }));
    };

    const totalPartsCost = useMemo(() =>
        formData.partsUsed?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0,
        [formData.partsUsed]
    );

    const totalQuoteCost = useMemo(() =>
        formData.quotationItems?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0,
        [formData.quotationItems]
    );

    const total = (formData.laborCost || 0) + totalPartsCost + totalQuoteCost - (formData.discount || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalWorkOrder: WorkOrder = {
            id: workOrder?.id || `S${String(Math.floor(Math.random() * 900) + 100)}`,
            creationDate: workOrder?.creationDate || new Date().toISOString().split('T')[0],
            ...formData,
            branchId: formData.branchId || currentBranchId,
            total,
        };
        onSave(finalWorkOrder);
    };

    if (!isOpen) return null;

    const renderFormContent = () => (
        <>
            {/* --- CUSTOMER INFO --- */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 lg:hidden">Thông tin Khách hàng & Xe</h3>
                 <div ref={customerInputRef}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Khách hàng <span className="text-red-500">*</span></label>
                    <div className="relative mt-1">
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="Tìm hoặc thêm khách hàng..."
                                value={customerSearch}
                                onChange={e => {
                                    setCustomerSearch(e.target.value);
                                    setIsCustomerListOpen(true);
                                    setFormData(prev => ({ ...prev, customerName: e.target.value, customerPhone: '', vehicleModel: '', licensePlate: '' }));
                                }}
                                onFocus={() => setIsCustomerListOpen(true)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-l-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-800 dark:text-slate-100"
                                required
                            />
                            <button type="button" onClick={() => setIsNewCustomerModalOpen(true)} className="p-2 border-t border-b border-r border-slate-300 dark:border-slate-600 rounded-r-md h-[42px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600" title="Thêm khách hàng mới">
                                <PlusIcon />
                            </button>
                        </div>
                        {isCustomerListOpen && (
                            <div className="absolute z-20 w-full bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
                                {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                    <div key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-sm">
                                        <p className="font-semibold dark:text-slate-200">{c.name}</p>
                                        <p className="text-slate-500 dark:text-slate-400">{c.phone}</p>
                                    </div>
                                )) : (
                                    <div className="p-2 text-sm text-slate-500 dark:text-slate-400">Không tìm thấy khách hàng.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="wo-vehicleModel" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dòng xe</label>
                        <input id="wo-vehicleModel" type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="Honda Air Blade" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required />
                    </div>
                    <div>
                        <label htmlFor="wo-licensePlate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Biển số xe</label>
                        <input id="wo-licensePlate" type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="59-A1 123.45" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                    </div>
                    <div>
                        <label htmlFor="wo-odometerReading" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số ODO (km)</label>
                        <input id="wo-odometerReading" type="number" name="odometerReading" value={formData.odometerReading || ''} onChange={handleChange} placeholder="15000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                    </div>
                 </div>
            </div>

            {/* --- ISSUE & SERVICE --- */}
             <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 lg:hidden">Sự cố & Dịch vụ</h3>
                <div>
                    <label htmlFor="wo-issueDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả sự cố</label>
                    <textarea id="wo-issueDescription" name="issueDescription" value={formData.issueDescription} onChange={handleChange} placeholder="Bảo dưỡng định kỳ, thay nhớt..." rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loại hình dịch vụ</label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {serviceTypesOptions.map(type => (
                            <label key={type} className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-200">
                                <input 
                                    type="checkbox" 
                                    checked={formData.serviceTypes?.includes(type) || false}
                                    onChange={() => handleServiceTypeChange(type)}
                                    className="rounded text-sky-600 focus:ring-sky-500"
                                />
                                <span>{type}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- TECHNICAL DETAILS --- */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 lg:hidden">Chi tiết Kỹ thuật</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="wo-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái</label>
                        <select
                            id="wo-status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-semibold transition-colors ${getStatusColorClass(formData.status)} dark:bg-transparent`}
                        >
                            <option value="Tiếp nhận">Tiếp nhận</option>
                            <option value="Đang sửa">Đang sửa</option>
                            <option value="Đã sửa xong">Đã sửa xong</option>
                            <option value="Trả máy">Trả máy</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="wo-technicianName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Kỹ thuật viên</label>
                        <input id="wo-technicianName" type="text" name="technicianName" value={formData.technicianName} onChange={handleChange} placeholder="Trần Văn An" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                    </div>
                </div>
                <div>
                    <label htmlFor="wo-laborCost" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phí dịch vụ (công thợ)</label>
                    <input id="wo-laborCost" type="number" name="laborCost" value={formData.laborCost || ''} onChange={handleChange} placeholder="100000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                </div>
                <div>
                    <label htmlFor="wo-notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ghi chú nội bộ</label>
                    <textarea id="wo-notes" name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="VD: Khách yêu cầu kiểm tra thêm hệ thống điện" rows={2} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                </div>
           </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center md:items-start md:p-4 overflow-y-auto">
            <NewCustomerModal 
                isOpen={isNewCustomerModalOpen}
                onClose={() => setIsNewCustomerModalOpen(false)}
                onSave={handleSaveNewCustomer}
                initialName={customerSearch}
            />
             <div className="bg-white dark:bg-slate-900 w-full h-full md:h-auto md:max-w-6xl md:my-8 md:rounded-lg flex flex-col shadow-xl">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{workOrder ? `Xử lý Phiếu #${workOrder.id}` : 'Tạo Phiếu Sửa chữa mới'}</h2>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {/* --- MOBILE ACCORDION LAYOUT --- */}
                        <div className="space-y-4 lg:hidden">
                           <AccordionSection title="Thông tin Khách hàng & Xe" id="customerInfo">{renderFormContent()}</AccordionSection>
                           <AccordionSection title="Sự cố & Dịch vụ" id="issueDetails">{/* Content is inside renderFormContent */}</AccordionSection>
                           <AccordionSection title="Chi tiết Kỹ thuật" id="serviceDetails">{/* Content is inside renderFormContent */}</AccordionSection>
                           <AccordionSection title="Báo giá (Gia công, Đặt hàng)" id="quotationItems">{/* Separate content */}</AccordionSection>
                           <AccordionSection title="Phụ tùng sử dụng" id="partsUsed">{/* Separate content */}</AccordionSection>
                        </div>
                        
                        {/* --- DESKTOP TWO-COLUMN LAYOUT --- */}
                        <div className="hidden lg:flex lg:gap-6">
                            {/* Left Column */}
                            <div className="lg:w-1/2 space-y-6">
                               <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
                                    <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Thông tin Khách hàng & Xe</h3>
                                    {renderFormContent().props.children[0]}
                               </div>
                               <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
                                    <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Sự cố & Dịch vụ</h3>
                                    {renderFormContent().props.children[1]}
                               </div>
                               <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
                                    <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200">Chi tiết Kỹ thuật</h3>
                                    {renderFormContent().props.children[2]}
                               </div>
                            </div>
                            {/* Right Column */}
                            <div className="lg:w-1/2 space-y-6">
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 p-4">Phụ tùng sử dụng</h3>
                                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-center gap-4 mb-4">
                                            <h4 className="font-medium text-slate-700 dark:text-slate-200">Thêm phụ tùng</h4>
                                            <div className="flex-grow max-w-xs sm:max-w-sm">
                                                <select onChange={(e) => { handleAddPart(parts.find(p => p.id === e.target.value) as Part); e.target.value = ""; }} defaultValue="" className="p-2 border border-slate-300 dark:border-slate-600 rounded w-full text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                                                    <option value="" disabled>-- Chọn phụ tùng --</option>
                                                    {parts.filter(p => (p.stock[currentBranchId] || 0) > 0).map(p => <option key={p.id} value={p.id}>{p.name} (Tồn: {p.stock[currentBranchId]})</option>)}
                                                </select>
                                            </div>
                                        </div>
                                         <div className="max-h-48 overflow-y-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0"><tr><th className="p-2 font-semibold">Tên</th><th className="p-2 font-semibold">SL</th><th className="p-2 font-semibold">Đ.Giá</th><th className="p-2 font-semibold">T.Tiền</th><th></th></tr></thead>
                                                <tbody>
                                                    {formData.partsUsed?.map(p => (
                                                        <tr key={p.partId} className="border-b dark:border-slate-700">
                                                            <td className="p-2 font-medium dark:text-slate-200">{p.partName}</td>
                                                            <td className="p-1"><input type="number" value={p.quantity} onChange={(e) => handlePartQuantityChange(p.partId, parseInt(e.target.value))} min="1" className="w-16 p-1 border rounded dark:bg-slate-800 dark:border-slate-600"/></td>
                                                            <td className="p-2 dark:text-slate-300">{formatCurrency(p.price)}</td>
                                                            <td className="p-2 dark:text-slate-100 font-semibold">{formatCurrency(p.price * p.quantity)}</td>
                                                            <td className="p-1 text-right"><button type="button" onClick={() => handleRemovePart(p.partId)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
                                     <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-200 p-4">Báo giá (Gia công, Đặt hàng)</h3>
                                     <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="p-2 font-semibold w-2/5">Mô tả</th><th className="p-2 font-semibold">SL</th><th className="p-2 font-semibold">Đ.Giá</th><th className="p-2 font-semibold">T.Tiền</th><th></th></tr></thead>
                                            <tbody>
                                                {formData.quotationItems?.map(item => (
                                                    <tr key={item.id} className="border-b dark:border-slate-700"><td className="p-1"><input type="text" value={item.description} onChange={e => handleUpdateQuoteItem(item.id, 'description', e.target.value)} className="w-full p-1 bg-transparent dark:text-slate-100"/></td><td className="p-1"><input type="number" value={item.quantity} onChange={e => handleUpdateQuoteItem(item.id, 'quantity', Number(e.target.value))} min="1" className="w-16 p-1 border rounded dark:bg-slate-800 dark:border-slate-600"/></td><td className="p-1"><input type="number" value={item.unitPrice} onChange={e => handleUpdateQuoteItem(item.id, 'unitPrice', Number(e.target.value))} min="0" className="w-24 p-1 border rounded dark:bg-slate-800 dark:border-slate-600"/></td><td className="p-2 dark:text-slate-100 font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</td><td className="p-1 text-right"><button type="button" onClick={() => handleRemoveQuoteItem(item.id)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button></td></tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-slate-50 dark:bg-slate-800/50"><td className="p-1"><input type="text" placeholder="Mô tả..." value={newQuoteItem.description} onChange={e => setNewQuoteItem(prev => ({...prev, description: e.target.value}))} className="w-full p-1 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"/></td><td className="p-1"><input type="number" value={newQuoteItem.quantity} onChange={e => setNewQuoteItem(prev => ({...prev, quantity: Number(e.target.value)}))} min="1" className="w-16 p-1 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"/></td><td className="p-1"><input type="number" placeholder="Đơn giá" value={newQuoteItem.unitPrice || ''} onChange={e => setNewQuoteItem(prev => ({...prev, unitPrice: Number(e.target.value)}))} min="0" className="w-24 p-1 border rounded bg-white dark:bg-slate-700 dark:border-slate-600"/></td><td></td><td className="p-1 text-right"><button type="button" onClick={handleAddQuoteItem} className="bg-sky-600 text-white rounded px-3 py-1 text-sm font-semibold hover:bg-sky-700">Thêm</button></td></tr>
                                            </tfoot>
                                        </table>
                                     </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Sticky Footer with Totals and Actions */}
                    <div className="bg-slate-50 dark:bg-slate-800/70 backdrop-blur-sm p-4 sm:p-6 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <div className="max-w-md ml-auto space-y-2 mb-4">
                            <div className="flex justify-between text-sm"><span className="text-slate-700 dark:text-slate-300">Phí dịch vụ:</span> <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(formData.laborCost || 0)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-700 dark:text-slate-300">Tiền phụ tùng:</span> <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totalPartsCost)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-700 dark:text-slate-300">Gia công/Đặt hàng:</span> <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totalQuoteCost)}</span></div>
                             <div className="flex justify-between items-center py-1">
                                <label htmlFor="wo-discount" className="text-red-600 dark:text-red-400 font-bold text-base">Giảm giá:</label>
                                <input id="wo-discount" type="number" name="discount" value={formData.discount || ''} onChange={handleChange} placeholder="0" className="w-32 px-2 py-1 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-red-600 dark:text-red-400 font-bold text-base text-right"/>
                            </div>
                            <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-300 dark:border-slate-600"><span className="text-slate-900 dark:text-slate-100">Tổng cộng:</span> <span className="text-sky-600 dark:text-sky-400">{formatCurrency(total)}</span></div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                                <ArrowUturnLeftIcon className="w-5 h-5" />
                                Trở về
                            </button>
                            <button type="submit" className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700">Lưu Phiếu</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PrintInvoiceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    workOrder: WorkOrder | null;
    settings: StoreSettings;
}> = ({ isOpen, onClose, workOrder, settings }) => {
    if (!isOpen || !workOrder) return null;

    const handlePrint = () => {
        const printContents = document.getElementById('invoice-print-area')?.innerHTML;
        const originalContents = document.body.innerHTML;
        if (printContents) {
            const printStyles = `
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');
                    body { 
                        font-family: 'Be Vietnam Pro', sans-serif; 
                        color: #1e293b; /* slate-800 */
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px 12px; border: 1px solid #e2e8f0; /* slate-200 */ text-align: left; }
                    th { background-color: #f8fafc !important; /* slate-50 */ }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: 700; }
                    .text-lg { font-size: 1.125rem; }
                    .mt-4 { margin-top: 1rem; }
                    .mb-4 { margin-bottom: 1rem; }
                </style>
            `;
            document.body.innerHTML = printStyles + printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); 
        }
    };
    
    const partsTotal = workOrder.partsUsed?.reduce((sum, part) => sum + (part.price * part.quantity), 0) || 0;
    const quoteTotal = workOrder.quotationItems?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0;
    const branchName = settings.branches.find(b => b.id === workOrder.branchId)?.name || 'N/A';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 print:hidden">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl transform transition-all my-8 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 text-center">HÓA ĐƠN DỊCH VỤ</h2>
                </div>
                <div className="p-6 overflow-y-auto" id="invoice-print-area">
                    <div className="text-center mb-6">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">{settings.name}</h3>
                        <p className="text-slate-700 dark:text-slate-300">{branchName} - {settings.address}</p>
                        <p className="text-slate-700 dark:text-slate-300">ĐT: {settings.phone}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-200 dark:border-slate-700 py-4">
                        <div className="dark:text-slate-300">
                            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Mã Phiếu:</span> {workOrder.id}</p>
                            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Ngày tạo:</span> {workOrder.creationDate}</p>
                            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Kỹ thuật viên:</span> {workOrder.technicianName}</p>
                        </div>
                        <div className="dark:text-slate-300">
                            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Khách hàng:</span> {workOrder.customerName}</p>
                            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Điện thoại:</span> {workOrder.customerPhone}</p>
                            <p><span className="font-semibold text-slate-800 dark:text-slate-200">Xe:</span> {workOrder.vehicleModel} ({workOrder.licensePlate})</p>
                             {workOrder.odometerReading && <p><span className="font-semibold text-slate-800 dark:text-slate-200">Số km:</span> {workOrder.odometerReading.toLocaleString('vi-VN')} km</p>}
                        </div>
                    </div>
                     <p className="mt-4 dark:text-slate-300"><span className="font-semibold text-slate-800 dark:text-slate-200">Yêu cầu của khách:</span> {workOrder.issueDescription}</p>
                     
                    <div className="mt-6">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">#</th>
                                    <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Mô tả</th>
                                    <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 text-right">SL</th>
                                    <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 text-right">Đơn giá</th>
                                    <th className="p-2 font-semibold text-slate-700 dark:text-slate-300 text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(workOrder.partsUsed || []).map((part, index) => (
                                    <tr key={part.partId} className="border-b border-slate-200 dark:border-slate-700">
                                        <td className="p-2 text-slate-700 dark:text-slate-300">{index + 1}</td>
                                        <td className="p-2 text-slate-900 dark:text-slate-100 font-medium">{part.partName} <span className="text-slate-600 dark:text-slate-400">({part.sku})</span></td>
                                        <td className="p-2 text-slate-900 dark:text-slate-100 text-right">{part.quantity}</td>
                                        <td className="p-2 text-slate-900 dark:text-slate-100 text-right">{formatCurrency(part.price)}</td>
                                        <td className="p-2 text-slate-900 dark:text-slate-100 text-right">{formatCurrency(part.price * part.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {(workOrder.quotationItems && workOrder.quotationItems.length > 0) && (
                        <div className="mt-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Các hạng mục gia công / đặt hàng:</p>
                            <table className="w-full mt-1">
                                <tbody>
                                    {(workOrder.quotationItems || []).map((item, index) => (
                                        <tr key={item.id} className="border-b border-slate-200 dark:border-slate-700">
                                            <td className="p-2 text-slate-700 dark:text-slate-300">{index + 1}</td>
                                            <td className="p-2 text-slate-900 dark:text-slate-100 font-medium">{item.description}</td>
                                            <td className="p-2 text-slate-900 dark:text-slate-100 text-right">{item.quantity}</td>
                                            <td className="p-2 text-slate-900 dark:text-slate-100 text-right">{formatCurrency(item.unitPrice)}</td>
                                            <td className="p-2 text-slate-900 dark:text-slate-100 text-right">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}


                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-slate-800 dark:text-slate-300">
                                <span>Tiền phụ tùng:</span>
                                <span>{formatCurrency(partsTotal)}</span>
                            </div>
                            {quoteTotal > 0 && (
                                <div className="flex justify-between text-slate-800 dark:text-slate-300">
                                    <span>Gia công/Đặt hàng:</span>
                                    <span>{formatCurrency(quoteTotal)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-800 dark:text-slate-300">
                                <span>Tiền công:</span>
                                <span>{formatCurrency(workOrder.laborCost || 0)}</span>
                            </div>
                            {(workOrder.discount || 0) > 0 && (
                                <div className="flex justify-between text-slate-800 dark:text-slate-300">
                                    <span>Giảm giá:</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(workOrder.discount!)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-slate-100 border-t border-slate-300 dark:border-slate-600 pt-2">
                                <span>TỔNG CỘNG:</span>
                                <span>{formatCurrency(workOrder.total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center mt-8 text-sm text-slate-700 dark:text-slate-400">
                        <p>Cảm ơn quý khách đã sử dụng dịch vụ của {settings.name}!</p>
                        <p>Thông tin thanh toán: {settings.bankName} - {settings.bankAccountNumber} - {settings.bankAccountHolder}</p>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">Đóng</button>
                    <button onClick={handlePrint} className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700">
                        <PrinterIcon className="w-5 h-5 mr-2"/> In hóa đơn
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main ServiceManager Component ---
interface ServiceManagerProps {
    currentUser: User;
    workOrders: WorkOrder[];
    setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
    parts: Part[];
    storeSettings: StoreSettings;
    currentBranchId: string;
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const ITEMS_PER_PAGE = 15;

const ServiceManager: React.FC<ServiceManagerProps> = ({ currentUser, workOrders, setWorkOrders, parts, storeSettings, currentBranchId, customers, setCustomers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceWorkOrder, setInvoiceWorkOrder] = useState<WorkOrder | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedWoId, setExpandedWoId] = useState<string | null>(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, currentBranchId]);
    
    const handleOpenModal = (workOrder: WorkOrder | null = null) => {
        setSelectedWorkOrder(workOrder);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedWorkOrder(null);
    };

    const handleOpenInvoiceModal = (workOrder: WorkOrder) => {
        setInvoiceWorkOrder(workOrder);
        setIsInvoiceModalOpen(true);
    };

    const handleCloseInvoiceModal = () => {
        setIsInvoiceModalOpen(false);
        setInvoiceWorkOrder(null);
    };

    const handleSaveWorkOrder = (workOrder: WorkOrder) => {
        // Update work orders list
        if (selectedWorkOrder) {
            setWorkOrders(prev => prev.map(wo => wo.id === workOrder.id ? workOrder : wo));
        } else {
            setWorkOrders(prev => [workOrder, ...prev]);
        }
    
        // Update customer last service info if it's an oil change
        if (workOrder.status === 'Trả máy' && workOrder.serviceTypes?.includes('Thay nhớt') && workOrder.odometerReading) {
            setCustomers(prevCustomers => prevCustomers.map(c => {
                if (c.phone === workOrder.customerPhone) {
                    // Only update if this service is newer
                    const isNewerService = !c.lastServiceDate || new Date(workOrder.creationDate) >= new Date(c.lastServiceDate);
                    if (isNewerService) {
                        return {
                            ...c,
                            lastServiceOdometer: workOrder.odometerReading,
                            lastServiceDate: workOrder.creationDate,
                        };
                    }
                }
                return c;
            }));
        }
    
        handleCloseModal();
    };

    const handleDeleteWorkOrder = (workOrderId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phiếu sửa chữa này không? Hành động này không thể hoàn tác.')) {
            setWorkOrders(prev => prev.filter(wo => wo.id !== workOrderId));
        }
    };
    
    const getStatusChip = (status: WorkOrder['status']) => {
        switch (status) {
            case 'Tiếp nhận': return 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
            case 'Đang sửa': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300';
            case 'Đã sửa xong': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
            case 'Trả máy': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };
    
    const filteredWorkOrders = useMemo(() => {
        const branchWorkOrders = workOrders
            .filter(wo => wo.branchId === currentBranchId)
            .sort((a,b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime());
        if (statusFilter === 'all') return branchWorkOrders;
        return branchWorkOrders.filter(wo => wo.status === statusFilter);
    }, [workOrders, statusFilter, currentBranchId]);

    const paginatedWorkOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredWorkOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredWorkOrders, currentPage]);

    const totalPages = Math.ceil(filteredWorkOrders.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <WorkOrderModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveWorkOrder}
                workOrder={selectedWorkOrder}
                parts={parts}
                currentBranchId={currentBranchId}
                customers={customers}
                setCustomers={setCustomers}
            />
            <PrintInvoiceModal
                isOpen={isInvoiceModalOpen}
                onClose={handleCloseInvoiceModal}
                workOrder={invoiceWorkOrder}
                settings={storeSettings}
            />
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                        <button onClick={() => setStatusFilter('all')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'all' ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>Tất cả</button>
                        <button onClick={() => setStatusFilter('Tiếp nhận')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'Tiếp nhận' ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>Tiếp nhận</button>
                        <button onClick={() => setStatusFilter('Đang sửa')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'Đang sửa' ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>Đang sửa</button>
                        <button onClick={() => setStatusFilter('Đã sửa xong')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'Đã sửa xong' ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>Đã sửa xong</button>
                         <button onClick={() => setStatusFilter('Trả máy')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${statusFilter === 'Trả máy' ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>Trả máy</button>
                    </nav>
                </div>
                <div className="flex-shrink-0">
                    <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition-colors w-full sm:w-auto">
                        <PlusIcon />
                        <span className="ml-2">Thêm Phiếu</span>
                    </button>
                </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {paginatedWorkOrders.map(wo => (
                    <div key={wo.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="p-4 cursor-pointer" onClick={() => setExpandedWoId(prev => prev === wo.id ? null : wo.id)}>
                             <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusChip(wo.status)}`}>
                                            {wo.status}
                                        </span>
                                        <p className="font-semibold text-sky-600 dark:text-sky-400 truncate">{wo.id}</p>
                                    </div>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{wo.customerName}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{wo.vehicleModel} ({wo.licensePlate})</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    {wo.discount && wo.discount > 0 && (
                                        <p className="text-xs text-red-500 dark:text-red-400">-{formatCurrency(wo.discount)}</p>
                                    )}
                                    <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                                        {formatCurrency(wo.total)}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{wo.creationDate}</p>
                                </div>
                                <div className="pt-1">
                                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${expandedWoId === wo.id ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        </div>

                        {expandedWoId === wo.id && (
                            <div className="px-4 pb-4 -mt-2">
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                                    {wo.issueDescription && (
                                        <div>
                                            <p className="font-semibold text-slate-700 dark:text-slate-300">Mô tả sự cố:</p>
                                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{wo.issueDescription}</p>
                                        </div>
                                    )}
                                    {wo.technicianName && (
                                        <div>
                                            <p className="font-semibold text-slate-700 dark:text-slate-300">Kỹ thuật viên:</p>
                                            <p className="text-slate-600 dark:text-slate-400">{wo.technicianName}</p>
                                        </div>
                                    )}
                                    {wo.notes && (
                                        <div>
                                            <p className="font-semibold text-slate-700 dark:text-slate-300">Ghi chú nội bộ:</p>
                                            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{wo.notes}</p>
                                        </div>
                                    )}
                                    {(!wo.issueDescription && !wo.technicianName && !wo.notes) && (
                                        <p className="text-slate-500 dark:text-slate-400 italic">Không có thông tin chi tiết.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="px-4 pb-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                             <div className="flex items-center justify-end space-x-3">
                                <button onClick={() => handleOpenInvoiceModal(wo)} className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center text-sm">
                                    <PrinterIcon className="w-5 h-5 mr-1"/>
                                    <span>In</span>
                                </button>
                                <button onClick={() => handleDeleteWorkOrder(wo.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center text-sm">
                                    <TrashIcon className="w-5 h-5 mr-1"/>
                                    <span>Xóa</span>
                                </button>
                                <button onClick={() => handleOpenModal(wo)} className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 flex items-center text-sm font-semibold">
                                    <PencilSquareIcon className="w-5 h-5 mr-1"/>
                                    <span>Xử lý</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
                <table className="w-full text-left min-w-max">
                    <thead className="border-b border-slate-200 dark:border-slate-700">
                        <tr className="bg-slate-50 dark:bg-slate-700/50">
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Mã Phiếu</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Khách hàng</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Xe</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Ngày tạo</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Trạng thái</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Tổng chi phí</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedWorkOrders.map(wo => (
                            <tr key={wo.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                <td className="p-4 font-semibold text-sky-600 dark:text-sky-400">{wo.id}</td>
                                <td className="p-4 text-slate-900 dark:text-slate-100">{wo.customerName}<br/><span className="text-xs text-slate-600 dark:text-slate-400">{wo.customerPhone}</span></td>
                                <td className="p-4 text-slate-800 dark:text-slate-200">{wo.vehicleModel}<br/><span className="text-xs text-slate-600 dark:text-slate-400">{wo.licensePlate}</span></td>
                                <td className="p-4 text-slate-700 dark:text-slate-300">{wo.creationDate}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChip(wo.status)}`}>
                                        {wo.status}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-900 dark:text-slate-100 font-bold text-right">{formatCurrency(wo.total)}</td>
                                <td className="p-4">
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => handleOpenModal(wo)} className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 flex items-center">
                                            <PencilSquareIcon className="w-5 h-5"/>
                                            <span className="ml-1">Xử lý</span>
                                        </button>
                                        <button onClick={() => handleOpenInvoiceModal(wo)} className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 flex items-center">
                                            <PrinterIcon className="w-5 h-5"/>
                                            <span className="ml-1">In</span>
                                        </button>
                                        <button onClick={() => handleDeleteWorkOrder(wo.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center">
                                            <TrashIcon className="w-5 h-5"/>
                                            <span className="ml-1">Xóa</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {(paginatedWorkOrders.length === 0) && <p className="text-center text-slate-500 dark:text-slate-400 py-8">Không có phiếu sửa chữa nào.</p>}
            </div>
             
             {filteredWorkOrders.length > 0 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={filteredWorkOrders.length}
                />
             )}

             {(filteredWorkOrders.length === 0) && <p className="lg:hidden text-center text-slate-500 dark:text-slate-400 py-8">Không có phiếu sửa chữa nào.</p>}
        </div>
    );
};

export default ServiceManager;