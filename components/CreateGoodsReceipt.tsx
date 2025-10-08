import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Part, Supplier, ReceiptItem, StoreSettings, InventoryTransaction, PaymentSource, CashTransaction } from '../types';
import { PlusIcon, ArchiveBoxIcon, TrashIcon, XMarkIcon, CameraIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon, MinusIcon, ShoppingCartIcon } from './common/Icons';

const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount);
};

// --- Camera Capture Modal ---
const CameraCaptureModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCapture: (blob: Blob) => void;
}> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera: ", err);
                    alert("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập trong trình duyệt.");
                    onClose();
                });
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [isOpen, onClose]);

    const handleCaptureClick = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                if (blob) {
                    onCapture(blob);
                }
            }, 'image/jpeg', 0.95);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex flex-col justify-center items-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-lg mb-4 border-2 border-slate-600"></video>
            <div className="flex space-x-4">
                <button onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold py-2 px-6 rounded-lg hover:bg-slate-300">Hủy</button>
                <button onClick={handleCaptureClick} className="bg-sky-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-sky-700">Chụp ảnh</button>
            </div>
        </div>
    );
};


// --- Modals ---
const PartModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSaveAndAddToCart: (part: Part, quantity: number, purchasePrice: number, sellingPrice: number, warranty?: string) => void;
    parts: Part[];
}> = ({ isOpen, onClose, onSaveAndAddToCart, parts }) => {
    const [formData, setFormData] = useState({ name: '', description: '', sku: '', category: '', quantity: 1, price: 0, sellingPrice: 0 });
    const [warrantyValue, setWarrantyValue] = useState(1);
    const [warrantyUnit, setWarrantyUnit] = useState('tháng');
    
    // State and logic for enhanced category selection
    const allCategories = useMemo(() => Array.from(new Set(parts.map(p => p.category).filter((c): c is string => !!c))).sort(), [parts]);
    const [localCategories, setLocalCategories] = useState<string[]>(allCategories);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // State for image upload and camera
    const [image, setImage] = useState<{ file: File | Blob; previewUrl: string } | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form and category state when modal is opened
            setFormData({ name: '', description: '', sku: '', category: '', quantity: 1, price: 0, sellingPrice: 0 });
            setWarrantyValue(1);
            setWarrantyUnit('tháng');
            setLocalCategories(allCategories);
            setIsAddingNewCategory(false);
            setNewCategoryName('');
            setImage(null);
            setIsCameraOpen(false);
        }
    }, [isOpen, allCategories]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
    
        if (name === 'price') {
            const purchasePrice = parseFloat(value) || 0;
            const suggestedSellingPrice = Math.round((purchasePrice * 1.4) / 1000) * 1000;
            setFormData(prev => ({
                ...prev,
                price: purchasePrice,
                sellingPrice: suggestedSellingPrice
            }));
        } else if (name === 'quantity') {
            setFormData(prev => ({ ...prev, quantity: parseInt(value) || 1 }));
        } else if (name === 'sellingPrice') {
            setFormData(prev => ({ ...prev, sellingPrice: parseFloat(value) || 0 }));
        } else { // name, description, sku, category
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddNewCategory = () => {
        const trimmedCategory = newCategoryName.trim();
        if (trimmedCategory && !localCategories.includes(trimmedCategory)) {
            const newCategoryList = [...localCategories, trimmedCategory].sort();
            setLocalCategories(newCategoryList);
            setFormData(prev => ({ ...prev, category: trimmedCategory }));
        }
        setNewCategoryName('');
        setIsAddingNewCategory(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImage({
                file: file,
                previewUrl: URL.createObjectURL(file),
            });
        }
        if(event.target) {
            event.target.value = ''; // Allow re-uploading the same file
        }
    };

    const handleCapture = (blob: Blob) => {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setImage({
            file: file,
            previewUrl: URL.createObjectURL(file),
        });
        setIsCameraOpen(false);
    };

    const handleSave = () => {
        const existingPart = parts.find(p => p.name.toLowerCase() === formData.name.toLowerCase() || p.sku.toLowerCase() === formData.sku.toLowerCase());
        const newPartData: Part = {
            id: existingPart?.id || `P${Date.now()}`,
            name: formData.name,
            sku: formData.sku || `SKU${Date.now()}`,
            description: formData.description,
            category: formData.category,
            price: formData.price,
            sellingPrice: formData.sellingPrice,
            stock: existingPart?.stock || {},
            warrantyPeriod: `${warrantyValue} ${warrantyUnit}`
        };
        onSaveAndAddToCart(newPartData, formData.quantity, formData.price, formData.sellingPrice, `${warrantyValue} ${warrantyUnit}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <CameraCaptureModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={handleCapture}
            />
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Thêm sản phẩm mới</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-300" /></button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                     <div className="p-4 bg-sky-50 dark:bg-sky-900/50 border border-sky-200 dark:border-sky-800 rounded-lg flex items-start space-x-4">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        {image ? (
                            <div className="relative w-24 h-24 flex-shrink-0">
                                <img src={image.previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                                <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform hover:scale-110">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ArchiveBoxIcon className="w-10 h-10 text-slate-400 dark:text-slate-500"/>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Tải lên ảnh sản phẩm để dễ nhận biết và quản lý hơn.</p>
                            <div className="flex items-center space-x-2">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <PlusIcon className="w-4 h-4"/> Tải lên
                                </button>
                                <button type="button" onClick={() => setIsCameraOpen(true)} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600">
                                    <CameraIcon className="w-4 h-4"/> Chụp ảnh
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên sản phẩm <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
                        <textarea name="description" value={formData.description} onChange={handleFormChange} rows={2} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Danh mục sản phẩm</label>
                         <div className="flex items-center space-x-2 mt-1">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleFormChange}
                                className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            >
                                <option value="">-- Chọn hoặc tạo mới --</option>
                                {localCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setIsAddingNewCategory(prev => !prev)}
                                className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 flex-shrink-0"
                                title="Thêm danh mục mới"
                            >
                                <PlusIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                            </button>
                        </div>
                        {isAddingNewCategory && (
                            <div className="mt-2 flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    placeholder="Tên danh mục mới..."
                                    className="block w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                    autoFocus
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewCategory(); } }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddNewCategory}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700"
                                >
                                    Lưu
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="border-t pt-4 dark:border-slate-700">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Thông tin nhập kho:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng:</label>
                                <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Giá nhập:</label>
                                <input type="number" name="price" value={formData.price} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Giá bán lẻ:</label>
                                <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"/>
                            </div>
                        </div>
                    </div>
                     <div className="border-t pt-4 dark:border-slate-700">
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bảo hành</label>
                        <div className="flex items-center space-x-2">
                            <input type="number" value={warrantyValue} onChange={e => setWarrantyValue(parseInt(e.target.value) || 0)} className="w-20 p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"/>
                            <select value={warrantyUnit} onChange={e => setWarrantyUnit(e.target.value)} className="p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100">
                                <option value="ngày">ngày</option>
                                <option value="tuần">tuần</option>
                                <option value="tháng">tháng</option>
                                <option value="năm">năm</option>
                            </select>
                        </div>
                    </div>
                </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={handleSave} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">Lưu và Thêm vào giỏ hàng</button>
                </div>
            </div>
        </div>
    );
};

const SupplierModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
    initialName?: string;
}> = ({ isOpen, onClose, onSave, initialName = '' }) => {
    const [formData, setFormData] = useState({ name: initialName, phone: '', address: '', email: '', notes: '' });
    
    useEffect(() => {
        if(isOpen) {
            setFormData({ name: initialName, phone: '', address: '', email: '', notes: '' });
        }
    }, [isOpen, initialName]);

    const handleSave = () => {
        const newSupplier: Supplier = {
            id: `SUP${Date.now()}`,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: formData.email,
        };
        onSave(newSupplier);
        onClose();
    };

    if (!isOpen) return null;
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Thêm nhà cung cấp</h2>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-300" /></button>
                </div>
                 <div className="p-6 space-y-4">
                     <div>
                        <label className="dark:text-slate-300">Tên nhà cung cấp (*)</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-md mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"/>
                     </div>
                      <div>
                        <label className="dark:text-slate-300">Điện thoại</label>
                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-md mt-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"/>
                     </div>
                 </div>
                 <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t dark:border-slate-700 flex justify-end">
                    <button onClick={handleSave} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">Lưu</button>
                </div>
            </div>
        </div>
    )
}

// Mobile Floating Cart Button
const FloatingCartButton: React.FC<{ count: number; total: number; onClick: () => void; }> = ({ count, total, onClick }) => (
    <div className="lg:hidden fixed bottom-4 right-4 z-30">
        <button onClick={onClick} className="bg-orange-500 text-white font-bold rounded-lg shadow-lg flex items-center py-3 px-5 hover:bg-orange-600 transition-transform hover:scale-105">
            <ShoppingCartIcon className="w-6 h-6" />
            <span className="bg-white text-orange-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ml-3">{count}</span>
            <span className="ml-3 text-lg">{formatCurrency(total)}</span>
        </button>
    </div>
);


// --- Main Component ---
interface CreateGoodsReceiptProps {
    parts: Part[];
    setParts: React.Dispatch<React.SetStateAction<Part[]>>;
    transactions: InventoryTransaction[];
    setTransactions: React.Dispatch<React.SetStateAction<InventoryTransaction[]>>;
    suppliers: Supplier[];
    setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
    storeSettings: StoreSettings;
    currentBranchId: string;
    paymentSources: PaymentSource[];
    setPaymentSources: React.Dispatch<React.SetStateAction<PaymentSource[]>>;
    cashTransactions: CashTransaction[];
    setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
}

const CreateGoodsReceipt: React.FC<CreateGoodsReceiptProps> = ({ 
    parts, setParts, 
    transactions, setTransactions, 
    suppliers, setSuppliers, 
    storeSettings, currentBranchId,
    paymentSources, setPaymentSources,
    cashTransactions, setCashTransactions
}) => {
    const [receiptCart, setReceiptCart] = useState<ReceiptItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
    const [receiptDiscount, setReceiptDiscount] = useState(0);
    const [paymentStatus, setPaymentStatus] = useState<'full' | 'partial' | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | null>(null);
    const [useCurrentTime, setUseCurrentTime] = useState(true);
    const [customReceiptTime, setCustomReceiptTime] = useState(new Date().toISOString().slice(0, 16));
    const [warnings, setWarnings] = useState<Record<string, string>>({});
    const [isSupplierListOpen, setIsSupplierListOpen] = useState(false);
    const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');
    const supplierInputRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (supplierInputRef.current && !supplierInputRef.current.contains(event.target as Node)) {
                setIsSupplierListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredParts = useMemo(() =>
        parts.filter(part =>
            part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.sku.toLowerCase().includes(searchTerm.toLowerCase())
        ), [parts, searchTerm]);
    
    const removeWarning = (warningId: string) => {
        setWarnings(prev => { const newWarnings = { ...prev }; delete newWarnings[warningId]; return newWarnings; });
    };

    const handleAddToCart = (part: Part, quantity = 1) => {
        setReceiptCart(prev => {
            const existingItem = prev.find(item => item.partId === part.id);
            if (existingItem) {
                return prev.map(item =>
                    item.partId === part.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, {
                partId: part.id,
                partName: part.name,
                sku: part.sku,
                quantity: quantity,
                purchasePrice: part.price,
                sellingPrice: part.sellingPrice,
                warrantyPeriod: part.warrantyPeriod,
            }];
        });
    };
    
    const handleSaveAndAddToCart = (partData: Part, quantity: number, purchasePrice: number, sellingPrice: number, warranty?: string) => {
        const isNewPart = !parts.some(p => p.id === partData.id);
        const finalPartData = {...partData, price: purchasePrice, sellingPrice: sellingPrice, warrantyPeriod: warranty};

        if (isNewPart) {
            setParts(prev => [finalPartData, ...prev]);
        } else {
             setParts(prev => prev.map(p => p.id === finalPartData.id ? finalPartData : p));
        }
        
        handleAddToCart(finalPartData, quantity);
    };

    const cartSubtotal = useMemo(() => receiptCart.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0), [receiptCart]);
    const cartTotal = useMemo(() => cartSubtotal - receiptDiscount, [cartSubtotal, receiptDiscount]);
    const totalCartItems = useMemo(() => receiptCart.reduce((acc, item) => acc + item.quantity, 0), [receiptCart]);
    
    const updateCartItem = (partId: string, field: 'quantity' | 'purchasePrice' | 'sellingPrice', value: number) => {
        const part = receiptCart.find(item => item.partId === partId);
        if (!part) return;

        const purchasePriceWarningKey = `${partId}-purchase-price`;
        const sellingPriceWarningKey = `${partId}-selling-price`;
        const quantityWarningKey = `${partId}-qty`;

        if (field === 'purchasePrice') {
            const originalPart = parts.find(p => p.id === partId);
            if (originalPart && originalPart.price > 0) {
                const differencePercent = ((value - originalPart.price) / originalPart.price) * 100;
                if (differencePercent > 10) {
                    setWarnings(prev => ({ ...prev, [purchasePriceWarningKey]: `Giá nhập mới cao hơn ${Math.round(differencePercent)}% so với giá cũ.` }));
                } else if (value < originalPart.price) {
                    setWarnings(prev => ({ ...prev, [purchasePriceWarningKey]: `Giá nhập mới thấp hơn giá cũ (${formatCurrency(originalPart.price)}).` }));
                } else {
                    removeWarning(purchasePriceWarningKey);
                }
            }
        }

        if (field === 'sellingPrice') {
            const originalPart = parts.find(p => p.id === partId);
            if (originalPart && originalPart.sellingPrice > 0) {
                if (value < originalPart.sellingPrice) {
                    setWarnings(prev => ({ ...prev, [sellingPriceWarningKey]: `Giá bán mới thấp hơn giá cũ (${formatCurrency(originalPart.sellingPrice)}).` }));
                } else {
                    removeWarning(sellingPriceWarningKey);
                }
            }
        }

        if (field === 'quantity') {
            if (value > 500) {
                setWarnings(prev => ({ ...prev, [quantityWarningKey]: `Số lượng nhập (${value}) rất lớn.` }));
            } else {
                removeWarning(quantityWarningKey);
            }
        }

        setReceiptCart(prev => prev.map(item => item.partId === partId ? { ...item, [field]: value } : item).filter(item => item.quantity > 0));
    };


    const handleFinalizeReceipt = () => {
        if (receiptCart.length === 0 || !paymentStatus || !paymentMethod) {
            alert('Vui lòng thêm sản phẩm vào giỏ và chọn hình thức thanh toán.');
            return;
        }

        const receiptId = `PN${Date.now()}`;
        const receiptDate = useCurrentTime ? new Date() : new Date(customReceiptTime);

        const newTransactions: InventoryTransaction[] = receiptCart.map(item => ({
            id: `TXN-${receiptId}-${item.partId}`, type: 'Nhập kho', partId: item.partId, partName: item.partName,
            quantity: item.quantity, date: receiptDate.toISOString().split('T')[0], notes: `Phiếu nhập ${receiptId}`,
            unitPrice: item.purchasePrice, totalPrice: item.purchasePrice * item.quantity, branchId: currentBranchId,
        }));
        
        setTransactions(prev => [...newTransactions, ...prev]);
        
        setParts(prevParts => prevParts.map(p => {
            const itemInCart = receiptCart.find(item => item.partId === p.id);
            if (itemInCart) {
                const newStock = {...p.stock};
                newStock[currentBranchId] = (newStock[currentBranchId] || 0) + itemInCart.quantity;
                return { ...p, stock: newStock, price: itemInCart.purchasePrice, sellingPrice: itemInCart.sellingPrice };
            }
            return p;
        }));

        // Financial Transaction Logic
        if (paymentStatus === 'full') { // For now, only handle full payment. Partial payment would need an amount input.
            const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

            const newCashTransaction: CashTransaction = {
                id: `CT-${receiptId}`,
                type: 'expense',
                date: receiptDate.toISOString(),
                amount: cartTotal,
                contact: {
                    id: selectedSupplierId || 'UNKNOWN_SUPPLIER',
                    name: selectedSupplier?.name || supplierSearch || 'NCC không xác định',
                },
                notes: `Thanh toán cho phiếu nhập kho #${receiptId}`,
                paymentSourceId: paymentMethod!,
                branchId: currentBranchId,
            };

            setCashTransactions(prev => [newCashTransaction, ...prev]);

            setPaymentSources(prevSources => prevSources.map(ps => {
                if (ps.id === paymentMethod) {
                    const newBalance = { ...ps.balance };
                    newBalance[currentBranchId] = (newBalance[currentBranchId] || 0) - cartTotal;
                    return { ...ps, balance: newBalance };
                }
                return ps;
            }));
        }
        
        alert('Nhập kho thành công!');
        navigate('/inventory');
    };
    
    const filteredSuppliers = useMemo(() => suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || (s.phone && s.phone.includes(supplierSearch))), [suppliers, supplierSearch]);

    return (
        <div className="lg:flex lg:h-[calc(100vh-88px)] lg:gap-6">
            <PartModal isOpen={isPartModalOpen} onClose={() => setIsPartModalOpen(false)} onSaveAndAddToCart={handleSaveAndAddToCart} parts={parts} />
            <SupplierModal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} onSave={(s) => { setSuppliers(prev => [s, ...prev]); setSelectedSupplierId(s.id); setSupplierSearch(s.name); }} initialName={supplierSearch} />
            
            {totalCartItems > 0 && mobileView === 'products' && (
                <FloatingCartButton 
                    count={totalCartItems} 
                    total={cartTotal} 
                    onClick={() => setMobileView('cart')} 
                />
            )}

            {/* Left Panel: Product Selection */}
            <div className={`${mobileView === 'products' ? 'flex' : 'hidden'} lg:flex flex-col bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 h-full lg:flex-1`}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Chọn sản phẩm nhập kho</h1>
                     <div className="flex items-center space-x-3">
                        <button onClick={() => navigate('/inventory')} className="flex items-center bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600">
                            <ArrowUturnLeftIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => setIsPartModalOpen(true)} className="flex items-center bg-sky-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-sky-700">
                            <PlusIcon /> <span className="ml-2 hidden sm:inline">Thêm sản phẩm mới</span>
                        </button>
                    </div>
                </div>
                <input type="text" placeholder="Tìm theo tên sản phẩm, SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg mb-4 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 flex-shrink-0"/>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 -mr-2">
                    {filteredParts.map(part => (
                        <div key={part.id} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-600/50">
                             <div className="flex items-center overflow-hidden">
                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-md flex items-center justify-center mr-3 flex-shrink-0">
                                    <ArchiveBoxIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                                </div>
                                 <div className="overflow-hidden">
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{part.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{part.sku} | Tồn kho: {part.stock[currentBranchId] || 0}</p>
                                </div>
                            </div>
                             <button onClick={() => handleAddToCart(part)} className="p-2 bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full hover:bg-sky-200 dark:hover:bg-sky-800/50 flex-shrink-0 ml-2">
                               <PlusIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Cart & Finalization */}
            <div className={`${mobileView === 'cart' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[520px] flex-shrink-0 bg-white dark:bg-slate-800 p-4 lg:p-6 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 flex-col h-full`}>
                <div className="lg:hidden flex items-center mb-4 flex-shrink-0">
                    <button onClick={() => setMobileView('products')} className="p-2 mr-2 -ml-2 text-slate-600 dark:text-slate-300">
                        <ArrowUturnLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Hoàn tất Phiếu nhập</h2>
                </div>

                {receiptCart.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400">
                        <ShoppingCartIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <h2 className="text-lg font-semibold">Giỏ hàng nhập kho</h2>
                        <p>Vui lòng thêm sản phẩm cần nhập vào giỏ hàng.</p>
                    </div>
                ) : (
                    <>
                    <div className="flex-1 overflow-y-auto pr-3 -mr-3 space-y-4">
                        <div ref={supplierInputRef}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nhà cung cấp (NCC):</label>
                            <div className="relative mt-1">
                                <div className="flex items-center">
                                <input type="text" placeholder="Tìm nhà cung cấp" value={supplierSearch}
                                    onChange={e => { setSupplierSearch(e.target.value); setSelectedSupplierId(null); setIsSupplierListOpen(true); }}
                                    onFocus={() => setIsSupplierListOpen(true)}
                                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-l-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                                />
                                <button type="button" onClick={() => setIsSupplierModalOpen(true)}
                                    className="p-2 bg-slate-100 dark:bg-slate-600 border-t border-b border-r border-slate-300 dark:border-slate-600 rounded-r-md hover:bg-slate-200 dark:hover:bg-slate-500 h-[42px]" title="Thêm NCC mới">
                                    <PlusIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                                </button>
                                </div>
                                {isSupplierListOpen && (
                                <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                    {filteredSuppliers.map(s => (
                                    <div key={s.id} onClick={() => { setSelectedSupplierId(s.id); setSupplierSearch(s.name); setIsSupplierListOpen(false); }}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                                        {s.name} <span className="text-slate-500 dark:text-slate-400"> - {s.phone}</span>
                                    </div>
                                    ))}
                                </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Giỏ hàng nhập kho:</h2>
                            <div className="space-y-3">
                                {receiptCart.map(item => (
                                    <div key={item.partId} className="bg-slate-50/70 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-medium text-sm text-slate-800 dark:text-slate-200 flex-1 pr-2">{item.partName}</p>
                                            <button onClick={() => setReceiptCart(prev => prev.filter(p => p.partId !== item.partId))} className="text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-x-4 gap-y-2 items-center">
                                            {/* Row 1: Quantity */}
                                            <div className="col-span-1 text-sm text-slate-600 dark:text-slate-400">Số lượng:</div>
                                            <div className="col-span-2 flex items-center gap-1">
                                                <button onClick={() => updateCartItem(item.partId, 'quantity', item.quantity - 1)} className="p-1 border dark:border-slate-500 rounded-md text-slate-600 dark:text-slate-300"><MinusIcon className="w-4 h-4"/></button>
                                                <input type="number" value={item.quantity} onChange={e => updateCartItem(item.partId, 'quantity', parseInt(e.target.value))} className="w-12 text-center border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md text-sm p-1"/>
                                                <button onClick={() => updateCartItem(item.partId, 'quantity', item.quantity + 1)} className="p-1 border dark:border-slate-500 rounded-md text-slate-600 dark:text-slate-300"><PlusIcon className="w-4 h-4"/></button>
                                            </div>
                                            
                                            {/* Row 2: Purchase Price */}
                                            <div className="col-span-1 text-sm text-slate-600 dark:text-slate-400">Giá nhập:</div>
                                            <div className="col-span-2">
                                                <input type="number" value={item.purchasePrice} onChange={e => updateCartItem(item.partId, 'purchasePrice', parseFloat(e.target.value))} className="w-full p-1 border rounded-md text-right text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-slate-100"/>
                                            </div>
                                            
                                            {/* Row 3: Selling Price */}
                                            <div className="col-span-1 text-sm text-slate-600 dark:text-slate-400">Giá bán:</div>
                                            <div className="col-span-2">
                                                <input type="number" value={item.sellingPrice} onChange={e => updateCartItem(item.partId, 'sellingPrice', parseFloat(e.target.value))} className="w-full p-1 border rounded-md text-right text-sm bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-slate-100"/>
                                            </div>

                                            {/* Row 4: Total */}
                                            <div className="col-span-1 text-sm text-slate-600 dark:text-slate-300 font-semibold">Thành tiền:</div>
                                            <div className="col-span-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                                                {formatCurrency(item.quantity * item.purchasePrice)}
                                            </div>
                                        </div>
                                        
                                        {/* Warnings */}
                                        <div className="mt-2 space-y-1">
                                            {warnings[`${item.partId}-purchase-price`] && <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center"><ExclamationTriangleIcon className="w-4 h-4 mr-1"/> {warnings[`${item.partId}-purchase-price`]}</p>}
                                            {warnings[`${item.partId}-selling-price`] && <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center"><ExclamationTriangleIcon className="w-4 h-4 mr-1"/> {warnings[`${item.partId}-selling-price`]}</p>}
                                            {warnings[`${item.partId}-qty`] && <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center"><ExclamationTriangleIcon className="w-4 h-4 mr-1"/> {warnings[`${item.partId}-qty`]}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-1 text-sm pt-2 text-slate-800 dark:text-slate-200">
                            <div className="flex justify-between"><span>Tổng tiền hàng</span><span>{formatCurrency(cartSubtotal)}</span></div>
                            <div className="flex justify-between items-center"><span>Giảm giá</span><input type="number" value={receiptDiscount || ''} onChange={e => setReceiptDiscount(parseFloat(e.target.value) || 0)} placeholder="0" className="w-24 p-1 border rounded-md text-right bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-slate-100"/></div>
                            <div className="flex justify-between font-bold text-lg"><span>Phải trả NCC</span><span className="text-sky-600 dark:text-sky-400">{formatCurrency(cartTotal)}</span></div>
                        </div>

                        <div className="border-t pt-4 mt-2 dark:border-slate-600">
                             <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Thanh toán:</p>
                             <div className="flex gap-4 text-sm text-slate-700 dark:text-slate-300">
                                <label><input type="radio" name="paymentStatus" checked={paymentStatus === 'partial'} onChange={() => setPaymentStatus('partial')} className="mr-1"/> Thanh toán một phần</label>
                                <label><input type="radio" name="paymentStatus" checked={paymentStatus === 'full'} onChange={() => setPaymentStatus('full')} className="mr-1"/> Thanh toán đủ</label>
                            </div>
                            <div className="flex gap-4 text-sm mt-2 text-slate-700 dark:text-slate-300">
                                <label><input type="radio" name="paymentMethod" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="mr-1"/> Tiền mặt</label>
                                <label><input type="radio" name="paymentMethod" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="mr-1"/> Chuyển khoản</label>
                            </div>
                        </div>
                         <div className="border-t pt-4 mt-2 dark:border-slate-600">
                             <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Thời gian nhập hàng:</p>
                             <div className="flex gap-4 text-sm text-slate-700 dark:text-slate-300">
                                <label><input type="radio" name="receiptTime" checked={useCurrentTime} onChange={() => setUseCurrentTime(true)} className="mr-1"/> Thời gian hiện tại</label>
                                <label><input type="radio" name="receiptTime" checked={!useCurrentTime} onChange={() => setUseCurrentTime(false)} className="mr-1"/> Tùy chỉnh</label>
                            </div>
                            {!useCurrentTime && <input type="datetime-local" value={customReceiptTime} onChange={e => setCustomReceiptTime(e.target.value)} className="mt-2 p-2 border dark:border-slate-600 rounded-md w-full sm:w-auto dark:bg-slate-700 dark:text-white"/>}
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t dark:border-slate-700 flex-shrink-0">
                        <div className="flex justify-end gap-3">
                            <button className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">LƯU NHÁP</button>
                            <button 
                                onClick={handleFinalizeReceipt} 
                                disabled={receiptCart.length === 0 || !paymentStatus || !paymentMethod}
                                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
                            >
                                NHẬP KHO
                            </button>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreateGoodsReceipt;