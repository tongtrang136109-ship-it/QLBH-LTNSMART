import React, { useState, useMemo } from 'react';
import type { FixedAsset, CapitalInvestment } from '../types';
import { PlusIcon, PencilSquareIcon, TrashIcon, BuildingLibraryIcon, BanknotesIcon } from './common/Icons';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- Asset Modal ---
const AssetModal: React.FC<{
    asset: FixedAsset | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (asset: FixedAsset) => void;
    branches: { id: string; name: string }[];
}> = ({ asset, isOpen, onClose, onSave, branches }) => {
    const [formData, setFormData] = useState<Partial<FixedAsset>>({});

    React.useEffect(() => {
        if (isOpen) {
            setFormData(asset ? { ...asset } : { purchaseDate: new Date().toISOString().split('T')[0], branchId: branches[0]?.id });
        }
    }, [asset, isOpen, branches]);

    const handleSave = () => {
        if (!formData.name || !formData.purchasePrice || !formData.branchId) return;
        const finalAsset: FixedAsset = {
            id: formData.id || `ASSET-${Date.now()}`,
            name: formData.name,
            purchasePrice: formData.purchasePrice,
            purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
            branchId: formData.branchId,
            description: formData.description,
        };
        onSave(finalAsset);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{asset ? 'Sửa tài sản' : 'Thêm tài sản cố định'}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên tài sản (*)</label>
                        <input type="text" value={formData.name || ''} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ngày mua (*)</label>
                            <input type="date" value={formData.purchaseDate || ''} onChange={e => setFormData(d => ({ ...d, purchaseDate: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nguyên giá (*)</label>
                            <input type="number" value={formData.purchasePrice || ''} onChange={e => setFormData(d => ({ ...d, purchasePrice: Number(e.target.value) }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chi nhánh (*)</label>
                        <select value={formData.branchId || ''} onChange={e => setFormData(d => ({ ...d, branchId: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white">
                            <option value="">-- Chọn chi nhánh --</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
                        <textarea value={formData.description || ''} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" rows={2}></textarea>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                    <button onClick={handleSave} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu</button>
                </div>
            </div>
        </div>
    );
};

// --- Capital Investment Modal ---
const CapitalModal: React.FC<{
    investment: CapitalInvestment | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (investment: CapitalInvestment) => void;
    branches: { id: string; name: string }[];
}> = ({ investment, isOpen, onClose, onSave, branches }) => {
    const [formData, setFormData] = useState<Partial<CapitalInvestment>>({});

    React.useEffect(() => {
        if (isOpen) {
            setFormData(investment ? { ...investment } : { date: new Date().toISOString().split('T')[0], branchId: branches[0]?.id, source: 'Vốn chủ sở hữu' });
        }
    }, [investment, isOpen, branches]);

    const handleSave = () => {
        if (!formData.description || !formData.amount || !formData.branchId || !formData.source) return;
        const finalInvestment: CapitalInvestment = {
            id: formData.id || `CAPITAL-${Date.now()}`,
            description: formData.description,
            amount: formData.amount,
            date: formData.date || new Date().toISOString().split('T')[0],
            branchId: formData.branchId,
            source: formData.source,
            interestRate: formData.source === 'Vay ngân hàng' ? formData.interestRate : undefined,
        };
        onSave(finalInvestment);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{investment ? 'Sửa vốn đầu tư' : 'Thêm vốn đầu tư'}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nội dung (*)</label>
                        <input type="text" value={formData.description || ''} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" autoFocus />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ngày (*)</label>
                            <input type="date" value={formData.date || ''} onChange={e => setFormData(d => ({ ...d, date: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số tiền (*)</label>
                            <input type="number" value={formData.amount || ''} onChange={e => setFormData(d => ({ ...d, amount: Number(e.target.value) }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nguồn vốn (*)</label>
                         <select value={formData.source || ''} onChange={e => setFormData(d => ({ ...d, source: e.target.value as CapitalInvestment['source'] }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white">
                            <option value="Vốn chủ sở hữu">Vốn chủ sở hữu</option>
                            <option value="Vay ngân hàng">Vay ngân hàng</option>
                        </select>
                    </div>
                    {formData.source === 'Vay ngân hàng' && (
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lãi suất (%/năm)</label>
                            <input type="number" step="0.1" value={formData.interestRate || ''} onChange={e => setFormData(d => ({ ...d, interestRate: Number(e.target.value) }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white" />
                        </div>
                    )}
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chi nhánh (*)</label>
                        <select value={formData.branchId || ''} onChange={e => setFormData(d => ({ ...d, branchId: e.target.value }))} className="mt-1 w-full p-2 border dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white">
                            <option value="">-- Chọn chi nhánh --</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                    <button onClick={handleSave} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface AssetManagerProps {
    fixedAssets: FixedAsset[];
    setFixedAssets: React.Dispatch<React.SetStateAction<FixedAsset[]>>;
    capitalInvestments: CapitalInvestment[];
    setCapitalInvestments: React.Dispatch<React.SetStateAction<CapitalInvestment[]>>;
    storeSettings: { branches: { id: string; name: string }[] };
}

const AssetManager: React.FC<AssetManagerProps> = ({ fixedAssets, setFixedAssets, capitalInvestments, setCapitalInvestments, storeSettings }) => {
    const [activeTab, setActiveTab] = useState<'assets' | 'capital'>('assets');
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
    const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
    const [editingCapital, setEditingCapital] = useState<CapitalInvestment | null>(null);

    const totalAssetValue = useMemo(() => fixedAssets.reduce((sum, a) => sum + a.purchasePrice, 0), [fixedAssets]);
    const totalCapitalValue = useMemo(() => capitalInvestments.reduce((sum, i) => sum + i.amount, 0), [capitalInvestments]);

    const handleSaveAsset = (asset: FixedAsset) => {
        setFixedAssets(prev => {
            const exists = prev.some(a => a.id === asset.id);
            return exists ? prev.map(a => (a.id === asset.id ? asset : a)) : [asset, ...prev];
        });
        setIsAssetModalOpen(false);
        setEditingAsset(null);
    };

    const handleDeleteAsset = (assetId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài sản này?')) {
            setFixedAssets(prev => prev.filter(a => a.id !== assetId));
        }
    };
    
    const handleSaveCapital = (investment: CapitalInvestment) => {
        setCapitalInvestments(prev => {
            const exists = prev.some(i => i.id === investment.id);
            return exists ? prev.map(i => (i.id === investment.id ? investment : i)) : [investment, ...prev];
        });
        setIsCapitalModalOpen(false);
        setEditingCapital(null);
    };

    const handleDeleteCapital = (investmentId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khoản đầu tư này?')) {
            setCapitalInvestments(prev => prev.filter(i => i.id !== investmentId));
        }
    };


    return (
        <div className="space-y-6">
            <AssetModal 
                isOpen={isAssetModalOpen}
                onClose={() => { setIsAssetModalOpen(false); setEditingAsset(null); }}
                onSave={handleSaveAsset}
                asset={editingAsset}
                branches={storeSettings.branches}
            />
            <CapitalModal 
                isOpen={isCapitalModalOpen}
                onClose={() => { setIsCapitalModalOpen(false); setEditingCapital(null); }}
                onSave={handleSaveCapital}
                investment={editingCapital}
                branches={storeSettings.branches}
            />

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý Tài sản & Vốn</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-center border dark:border-slate-700">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/50"><BuildingLibraryIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" /></div>
                    <div className="ml-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tổng giá trị tài sản</p>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(totalAssetValue)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-center border dark:border-slate-700">
                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/50"><BanknotesIcon className="w-7 h-7 text-green-600 dark:text-green-400" /></div>
                    <div className="ml-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tổng vốn đầu tư</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(totalCapitalValue)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700">
                <div className="border-b border-slate-200 dark:border-slate-700 flex justify-between items-center pr-4">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('assets')} className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'assets' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                            <BuildingLibraryIcon className="w-5 h-5"/> Tài sản cố định
                        </button>
                        <button onClick={() => setActiveTab('capital')} className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'capital' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                           <BanknotesIcon className="w-5 h-5"/> Vốn đầu tư
                        </button>
                    </nav>
                     <button 
                        onClick={() => activeTab === 'assets' ? setIsAssetModalOpen(true) : setIsCapitalModalOpen(true)} 
                        className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700">
                        <PlusIcon /> {activeTab === 'assets' ? 'Thêm tài sản' : 'Thêm vốn'}
                    </button>
                </div>
                <div className="overflow-x-auto">
                    {activeTab === 'assets' && (
                        <table className="w-full text-left min-w-max">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Tên tài sản</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Ngày mua</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Nguyên giá</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Chi nhánh</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {fixedAssets.map(asset => (
                                    <tr key={asset.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{asset.name}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{asset.purchaseDate}</td>
                                        <td className="p-3 text-right font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(asset.purchasePrice)}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{storeSettings.branches.find(b => b.id === asset.branchId)?.name || asset.branchId}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditingAsset(asset); setIsAssetModalOpen(true); }} className="p-1 text-sky-600 dark:text-sky-400"><PencilSquareIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteAsset(asset.id)} className="p-1 text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {activeTab === 'capital' && (
                         <table className="w-full text-left min-w-max">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Ngày</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Nội dung</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Số tiền</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Nguồn vốn</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Lãi suất</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Chi nhánh</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                             <tbody>
                                {capitalInvestments.map(inv => (
                                    <tr key={inv.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{inv.date}</td>
                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{inv.description}</td>
                                        <td className="p-3 text-right font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(inv.amount)}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{inv.source}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{inv.interestRate ? `${inv.interestRate}%/năm` : '-'}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{storeSettings.branches.find(b => b.id === inv.branchId)?.name || inv.branchId}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditingCapital(inv); setIsCapitalModalOpen(true); }} className="p-1 text-sky-600 dark:text-sky-400"><PencilSquareIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteCapital(inv.id)} className="p-1 text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {(activeTab === 'assets' && fixedAssets.length === 0) && <div className="text-center p-8 text-slate-500 dark:text-slate-400">Chưa có tài sản nào được ghi nhận.</div>}
                    {(activeTab === 'capital' && capitalInvestments.length === 0) && <div className="text-center p-8 text-slate-500 dark:text-slate-400">Chưa có vốn đầu tư nào được ghi nhận.</div>}
                </div>
            </div>
        </div>
    );
};

export default AssetManager;