import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { CashTransaction, PaymentSource, Customer, Supplier, StoreSettings } from '../types';
import { PlusIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, PencilSquareIcon, TrashIcon, XMarkIcon, Cog6ToothIcon } from './common/Icons';
import Pagination from './common/Pagination';

const formatCurrency = (amount: number) => {
    // FIX: Add check for NaN to prevent "NaN ₫" from being displayed
    if (isNaN(amount)) {
        return '0 ₫';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- MODALS ---

// Transaction Modal
const TransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: CashTransaction) => void;
    transaction: Partial<CashTransaction> | null;
    contacts: { id: string; name: string }[];
    paymentSources: PaymentSource[];
    currentBranchId: string;
}> = ({ isOpen, onClose, onSave, transaction, contacts, paymentSources, currentBranchId }) => {
    const [formData, setFormData] = useState<Partial<CashTransaction>>({});
    const [contactSearch, setContactSearch] = useState('');
    const [isContactListOpen, setIsContactListOpen] = useState(false);
    const contactInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const initialData: Partial<CashTransaction> = transaction ? { ...transaction, date: new Date(transaction.date!).toISOString().substring(0, 16) } : {
                type: 'expense',
                date: new Date().toISOString().substring(0, 16), // For datetime-local
                branchId: currentBranchId
            };
            setFormData(initialData);
            setContactSearch(transaction?.contact?.name || '');
        }
    }, [transaction, isOpen, currentBranchId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contactInputRef.current && !contactInputRef.current.contains(event.target as Node)) {
                setIsContactListOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredContacts = useMemo(() => {
        if (!contactSearch) return contacts;
        return contacts.filter(c => c.name.toLowerCase().includes(contactSearch.toLowerCase()));
    }, [contacts, contactSearch]);

    const handleSelectContact = (contact: { id: string, name: string }) => {
        setFormData(prev => ({ ...prev, contact }));
        setContactSearch(contact.name);
        setIsContactListOpen(false);
    };
    
    const handleSave = () => {
        if (!formData.amount || formData.amount <= 0 || !formData.paymentSourceId || !contactSearch.trim()) {
            alert('Vui lòng điền đầy đủ thông tin: Số tiền, Đối tượng, và Nguồn tiền.');
            return;
        }

        let finalContact = formData.contact;
        if (!finalContact) {
            finalContact = { id: `custom-${Date.now()}`, name: contactSearch.trim() };
        }

        const finalTransaction: CashTransaction = {
            id: formData.id || `CT-${Date.now()}`,
            type: formData.type!,
            date: new Date(formData.date!).toISOString(),
            amount: formData.amount,
            contact: finalContact,
            notes: formData.notes || '',
            paymentSourceId: formData.paymentSourceId,
            branchId: formData.branchId!,
        };
        onSave(finalTransaction);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{transaction?.id ? 'Sửa Giao dịch' : 'Tạo Giao dịch Mới'}</h3>
                    <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loại giao dịch</label>
                        <div className="flex gap-4">
                            <button onClick={() => setFormData(d => ({...d, type: 'income'}))} className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg ${formData.type === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/50' : 'border-slate-300 dark:border-slate-600'}`}>
                                <ArrowUpCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" /> <span className="font-semibold text-slate-800 dark:text-slate-200">Phiếu Thu</span>
                            </button>
                            <button onClick={() => setFormData(d => ({...d, type: 'expense'}))} className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg ${formData.type === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/50' : 'border-slate-300 dark:border-slate-600'}`}>
                                <ArrowDownCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" /> <span className="font-semibold text-slate-800 dark:text-slate-200">Phiếu Chi</span>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ngày</label>
                            <input type="datetime-local" value={formData.date || ''} onChange={e => setFormData(d => ({ ...d, date: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số tiền (*)</label>
                            <input type="number" value={formData.amount || ''} onChange={e => setFormData(d => ({ ...d, amount: Number(e.target.value) }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-800 dark:text-white" autoFocus />
                        </div>
                    </div>
                     <div ref={contactInputRef}>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đối tượng (*)</label>
                        <div className="relative mt-1">
                            <input type="text" placeholder="Tìm khách hàng/NCC hoặc nhập tên mới" value={contactSearch}
                                onChange={e => { setContactSearch(e.target.value); setIsContactListOpen(true); setFormData(d => ({...d, contact: undefined})); }}
                                onFocus={() => setIsContactListOpen(true)}
                                className="w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-800 dark:text-white"
                            />
                            {isContactListOpen && (
                            <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
                                {filteredContacts.map(c => (
                                <div key={c.id} onClick={() => handleSelectContact(c)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                                    {c.name}
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nguồn tiền (*)</label>
                        <select value={formData.paymentSourceId || ''} onChange={e => setFormData(d => ({ ...d, paymentSourceId: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-800 dark:text-white">
                            <option value="">-- Chọn nguồn tiền --</option>
                            {paymentSources.map(ps => <option key={ps.id} value={ps.id}>{ps.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ghi chú</label>
                        <textarea value={formData.notes || ''} onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-800 dark:text-white" rows={2}></textarea>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                    <button onClick={handleSave} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu</button>
                </div>
            </div>
        </div>
    );
};

// Settings Modal
const SettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (sources: PaymentSource[]) => void;
    paymentSources: PaymentSource[];
    storeSettings: StoreSettings;
}> = ({ isOpen, onClose, onSave, paymentSources, storeSettings }) => {
    const [localSources, setLocalSources] = useState<PaymentSource[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLocalSources(JSON.parse(JSON.stringify(paymentSources)));
        }
    }, [isOpen, paymentSources]);

    const handleBalanceChange = (sourceId: string, branchId: string, newBalance: number) => {
        setLocalSources(prev => prev.map(source => {
            if (source.id === sourceId) {
                const updatedBalance = { ...source.balance, [branchId]: newBalance };
                return { ...source, balance: updatedBalance };
            }
            return source;
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Thiết lập Nguồn tiền</h3>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {localSources.map(source => (
                        <div key={source.id} className="p-4 border dark:border-slate-700 rounded-lg">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{source.name}</h4>
                            <div className="space-y-2">
                                {storeSettings.branches.map(branch => (
                                    <div key={branch.id} className="grid grid-cols-3 items-center gap-4">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 col-span-1">{branch.name}:</label>
                                        <input
                                            type="number"
                                            value={source.balance[branch.id] || 0}
                                            onChange={e => handleBalanceChange(source.id, branch.id, Number(e.target.value))}
                                            className="col-span-2 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                    <button onClick={() => onSave(localSources)} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu</button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
interface CashflowManagerProps {
    cashTransactions: CashTransaction[];
    setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
    paymentSources: PaymentSource[];
    setPaymentSources: React.Dispatch<React.SetStateAction<PaymentSource[]>>;
    customers: Customer[];
    suppliers: Supplier[];
    currentBranchId: string;
    storeSettings: StoreSettings;
}

const ITEMS_PER_PAGE = 15;

const CashflowManager: React.FC<CashflowManagerProps> = ({
    cashTransactions, setCashTransactions,
    paymentSources, setPaymentSources,
    customers, suppliers,
    currentBranchId, storeSettings,
}) => {
    const [activeTab, setActiveTab] = useState<'balance' | 'history' | 'overview'>('balance');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Partial<CashTransaction> | null>(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Overview Tab State
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const allContacts = useMemo(() => [
        ...customers.map(c => ({ id: c.id, name: c.name })),
        ...suppliers.map(s => ({ id: s.id, name: s.name })),
    ], [customers, suppliers]);

    const handleOpenModal = (tx: Partial<CashTransaction> | null = null) => {
        setEditingTransaction(tx);
        setIsModalOpen(true);
    };

    const handleSaveTransaction = (transaction: CashTransaction) => {
        const isEditing = cashTransactions.some(t => t.id === transaction.id);
        let oldTransaction: CashTransaction | undefined;

        if (isEditing) {
            oldTransaction = cashTransactions.find(t => t.id === transaction.id);
            setCashTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
        } else {
            setCashTransactions(prev => [transaction, ...prev]);
        }

        setPaymentSources(prevSources => prevSources.map(ps => {
            const newBalance = { ...ps.balance };
            let balanceChanged = false;

            if (oldTransaction && oldTransaction.paymentSourceId === ps.id) {
                const change = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
                newBalance[oldTransaction.branchId] = (newBalance[oldTransaction.branchId] || 0) + change;
                balanceChanged = true;
            }
            
            if (transaction.paymentSourceId === ps.id) {
                const change = transaction.type === 'income' ? transaction.amount : -transaction.amount;
                newBalance[transaction.branchId] = (newBalance[transaction.branchId] || 0) + change;
                balanceChanged = true;
            }
            
            return balanceChanged ? { ...ps, balance: newBalance } : ps;
        }));

        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleDeleteTransaction = (transactionId: string) => {
        const transactionToDelete = cashTransactions.find(t => t.id === transactionId);
        if (!transactionToDelete || !window.confirm('Bạn có chắc muốn xóa giao dịch này không? Hành động này sẽ hoàn tác số dư trong quỹ.')) return;

        setPaymentSources(prevSources => prevSources.map(ps => {
            if (ps.id === transactionToDelete.paymentSourceId) {
                const newBalance = { ...ps.balance };
                const change = transactionToDelete.type === 'income' ? -transactionToDelete.amount : transactionToDelete.amount;
                newBalance[transactionToDelete.branchId] = (newBalance[transactionToDelete.branchId] || 0) + change;
                return { ...ps, balance: newBalance };
            }
            return ps;
        }));

        setCashTransactions(prev => prev.filter(t => t.id !== transactionId));
    };

    const handleSaveSettings = (newSources: PaymentSource[]) => {
        setPaymentSources(newSources);
        setIsSettingsModalOpen(false);
    };

    const filteredTransactions = useMemo(() => {
        return cashTransactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [cashTransactions]);

    const paginatedTransactions = useMemo(() => {
        const branchTransactions = filteredTransactions.filter(t => t.branchId === currentBranchId);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return branchTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTransactions, currentPage, currentBranchId]);

    const totalPages = Math.ceil(filteredTransactions.filter(t => t.branchId === currentBranchId).length / ITEMS_PER_PAGE);
    
    // NEW: Memoized data for overview tab
    const overviewData = useMemo(() => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        
        const relevantTransactions = cashTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= start && txDate <= end;
        });

        let totalIncome = 0;
        let totalExpense = 0;
        
        const branchBreakdown: { [branchId: string]: { name: string, income: number, expense: number } } = {};
        storeSettings.branches.forEach(branch => {
            branchBreakdown[branch.id] = { name: branch.name, income: 0, expense: 0 };
        });

        relevantTransactions.forEach(tx => {
            if (tx.type === 'income') {
                totalIncome += tx.amount;
                if (branchBreakdown[tx.branchId]) {
                    branchBreakdown[tx.branchId].income += tx.amount;
                }
            } else {
                totalExpense += tx.amount;
                if (branchBreakdown[tx.branchId]) {
                    branchBreakdown[tx.branchId].expense += tx.amount;
                }
            }
        });
        
        return {
            totalIncome,
            totalExpense,
            totalNet: totalIncome - totalExpense,
            branchData: Object.values(branchBreakdown)
        };
    }, [cashTransactions, startDate, endDate, storeSettings.branches]);

    return (
        <div className="space-y-6">
            <TransactionModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }} onSave={handleSaveTransaction} transaction={editingTransaction} contacts={allContacts} paymentSources={paymentSources} currentBranchId={currentBranchId} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onSave={handleSaveSettings} paymentSources={paymentSources} storeSettings={storeSettings} />
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Thu – Chi & Tồn quỹ</h1>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-600">
                        <Cog6ToothIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={() => handleOpenModal({type: 'income'})} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-700">
                        <PlusIcon className="w-5 h-5"/> Phiếu Thu
                    </button>
                    <button onClick={() => handleOpenModal({type: 'expense'})} className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-red-600">
                       <PlusIcon className="w-5 h-5"/> Phiếu Chi
                    </button>
                </div>
            </div>

             <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('balance')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'balance' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>Tồn quỹ</button>
                    <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>Tổng quan Thu Chi</button>
                    <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>Lịch sử Giao dịch</button>
                </nav>
            </div>
            
            {activeTab === 'balance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paymentSources.map(source => {
                        const totalBalance = Object.values(source.balance).reduce((acc: number, val: number) => acc + val, 0);
                        return (
                            <div key={source.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border dark:border-slate-700 space-y-3">
                                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{source.name}</h3>
                                {storeSettings.branches.map(branch => (
                                    <div key={branch.id} className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">{branch.name}:</span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(source.balance[branch.id] || 0)}</span>
                                    </div>
                                ))}
                                <div className="border-t dark:border-slate-600 pt-3 flex justify-between items-center font-bold">
                                    <span className="text-slate-800 dark:text-slate-100">Tổng cộng:</span>
                                    <span className="text-sky-600 dark:text-sky-400 text-lg">{formatCurrency(totalBalance)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {activeTab === 'overview' && (
                <div className="space-y-6">
                     <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Từ ngày</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" /></div>
                        <div className="flex-1 w-full"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đến ngày</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" /></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">Tổng Thu</p><p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(overviewData.totalIncome)}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-lg border border-red-200 dark:border-red-800">
                             <p className="text-sm font-medium text-red-800 dark:text-red-300">Tổng Chi</p><p className="text-2xl font-bold text-red-800 dark:text-red-200">{formatCurrency(overviewData.totalExpense)}</p>
                        </div>
                         <div className="bg-sky-50 dark:bg-sky-900/50 p-4 rounded-lg border border-sky-200 dark:border-sky-800">
                             <p className="text-sm font-medium text-sky-800 dark:text-sky-300">Lợi nhuận</p><p className={`text-2xl font-bold ${overviewData.totalNet >= 0 ? 'text-sky-800 dark:text-sky-200' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(overviewData.totalNet)}</p>
                        </div>
                    </div>
                     <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
                        <table className="w-full text-left min-w-max">
                            <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Chi nhánh</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Tổng Thu</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Tổng Chi</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Lợi nhuận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overviewData.branchData.map(branch => {
                                    const net = branch.income - branch.expense;
                                    return (
                                        <tr key={branch.name} className="border-t dark:border-slate-700">
                                            <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{branch.name}</td>
                                            <td className="p-3 text-right text-green-600 dark:text-green-400">{formatCurrency(branch.income)}</td>
                                            <td className="p-3 text-right text-red-600 dark:text-red-400">{formatCurrency(branch.expense)}</td>
                                            <td className={`p-3 text-right font-semibold ${net >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(net)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
                        <table className="w-full text-left min-w-max">
                            <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Ngày</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Loại</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Đối tượng</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Số tiền</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Nguồn tiền</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Chi nhánh</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTransactions.map(tx => (
                                    <tr key={tx.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-3 text-slate-700 dark:text-slate-300 text-sm">{new Date(tx.date).toLocaleString('vi-VN')}</td>
                                        <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${tx.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{tx.type === 'income' ? 'Thu' : 'Chi'}</span></td>
                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{tx.contact.name}</td>
                                        <td className={`p-3 text-right font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{paymentSources.find(p => p.id === tx.paymentSourceId)?.name}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{storeSettings.branches.find(b => b.id === tx.branchId)?.name}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleOpenModal(tx)} className="p-1 text-sky-600 dark:text-sky-400"><PencilSquareIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteTransaction(tx.id)} className="p-1 text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {paginatedTransactions.length === 0 && <div className="text-center p-8 text-slate-500 dark:text-slate-400">Chưa có giao dịch nào cho chi nhánh này.</div>}
                    </div>
                    {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredTransactions.filter(t => t.branchId === currentBranchId).length} />}
                </>
            )}
        </div>
    );
};

export default CashflowManager;