import React, { useState, useMemo } from 'react';
import type { Part, InventoryTransaction, StoreSettings } from '../types';
import { ArchiveBoxIcon, ClockIcon, ExclamationTriangleIcon } from './common/Icons';
import Pagination from './common/Pagination';

// Enhanced Part type for the report
type ReportPart = Part & {
    lastSoldDate?: string;
    daysSinceLastSale?: number;
};

interface InventoryReportProps {
    parts: Part[];
    transactions: InventoryTransaction[];
    currentBranchId: string;
    storeSettings: StoreSettings;
}

type ReportCategory = 'low-stock' | 'expiring-soon' | 'slow-moving';

// Sorting type
type SortConfig = {
    key: string;
    direction: 'ascending' | 'descending';
} | null;

const ITEMS_PER_PAGE = 20;

// Fix: Changed icon prop type to React.ReactElement to ensure it's a clonable element, fixing the type error with React.cloneElement.
// Fix: Use React.ReactElement<any> to allow passing props like className without causing a TypeScript error.
const StatCard: React.FC<{ icon: React.ReactElement<any>; title: string; value: number; color: string; }> = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-center border border-slate-200/60 dark:border-slate-700">
        <div className={`p-4 rounded-full ${color}`}>
            {React.cloneElement(icon, { className: 'w-7 h-7 text-white' })}
        </div>
        <div className="ml-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const InventoryReport: React.FC<InventoryReportProps> = ({ parts, transactions, currentBranchId, storeSettings }) => {
    const [activeTab, setActiveTab] = useState<ReportCategory>('low-stock');
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);
    const [currentPage, setCurrentPage] = useState(1);

    React.useEffect(() => {
        setCurrentPage(1);
        setSortConfig(null);
    }, [activeTab]);

    const reportData = useMemo(() => {
        const today = new Date();

        // --- Calculate last sold date for all parts from the current branch's transactions ---
        const lastSoldMap = new Map<string, string>();
        [...transactions]
            .filter(t => t.type === 'Xuất kho' && t.branchId === currentBranchId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .forEach(t => {
                if (!lastSoldMap.has(t.partId)) {
                    lastSoldMap.set(t.partId, t.date);
                }
            });

        // --- Attach sale data to parts ---
        const partsWithSaleData: ReportPart[] = parts.map(part => {
            const lastSoldDateStr = lastSoldMap.get(part.id);
            if (lastSoldDateStr) {
                const lastSoldDate = new Date(lastSoldDateStr);
                const daysSinceLastSale = Math.floor((today.getTime() - lastSoldDate.getTime()) / (1000 * 60 * 60 * 24));
                return { ...part, lastSoldDate: lastSoldDateStr, daysSinceLastSale };
            }
            return part;
        });
        
        // --- Filter for each category ---
        const lowStockParts = parts.filter(p => 
            storeSettings.branches.some(branch => {
                const stock = p.stock[branch.id] || 0;
                return stock > 0 && stock < 5;
            })
        );
        
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const expiringSoonParts = parts.filter(p => 
            p.expiryDate && 
            new Date(p.expiryDate) <= thirtyDaysFromNow && 
            new Date(p.expiryDate) >= today &&
            // FIX: Cast stockCount to number to resolve "unknown" type issue, likely from a tsconfig misconfiguration for Object.values.
            Object.values(p.stock).some(stockCount => (stockCount as number) > 0)
        );
        
        const slowMovingParts = partsWithSaleData.filter(p => 
            (p.stock[currentBranchId] || 0) > 0 &&
            p.daysSinceLastSale && p.daysSinceLastSale > 90
        );

        return {
            'low-stock': lowStockParts,
            'expiring-soon': expiringSoonParts,
            'slow-moving': slowMovingParts,
        };
    }, [parts, transactions, currentBranchId, storeSettings.branches]);


    const sortedData = useMemo(() => {
        let sortableItems = [...reportData[activeTab]];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any, bValue: any;

                if (sortConfig.key.startsWith('stock_')) {
                    const branchId = sortConfig.key.substring(6);
                    aValue = a.stock[branchId] || 0;
                    bValue = b.stock[branchId] || 0;
                } else {
                    // FIX: Use `any` cast to access dynamic properties on union type.
                    // This is safe because `sortConfig.key` is only set for properties
                    // that exist on the items in the current active tab's data.
                    aValue = (a as any)[sortConfig.key];
                    bValue = (b as any)[sortConfig.key];
                }

                if (aValue === undefined || aValue === null) return 1;
                if (bValue === undefined || bValue === null) return -1;
                
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [reportData, activeTab, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedData, currentPage]);
    
    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return <span className="text-slate-400 dark:text-slate-500">↑↓</span>;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const tableHeaders = useMemo(() => {
        const baseHeaders: { key: string; label: string; visibleOn: ReportCategory[] }[] = [
            { key: 'name', label: 'Tên Phụ tùng', visibleOn: ['low-stock', 'expiring-soon', 'slow-moving'] },
            { key: 'sku', label: 'SKU', visibleOn: ['low-stock', 'expiring-soon', 'slow-moving'] },
        ];
    
        const branchHeaders = storeSettings.branches.map(branch => ({
            key: `stock_${branch.id}`,
            label: `Tồn kho (${branch.name})`,
            visibleOn: ['low-stock', 'expiring-soon', 'slow-moving'] as ReportCategory[],
        }));
    
        const dynamicHeaders: { key: string; label: string; visibleOn: ReportCategory[] }[] = [
            { key: 'expiryDate', label: 'Ngày hết hạn', visibleOn: ['expiring-soon'] },
            { key: 'lastSoldDate', label: 'Ngày bán cuối', visibleOn: ['slow-moving'] },
            { key: 'daysSinceLastSale', label: 'Số ngày chưa bán', visibleOn: ['slow-moving'] },
        ];
    
        return [...baseHeaders, ...branchHeaders, ...dynamicHeaders];
    }, [storeSettings.branches]);

    const visibleHeaders = tableHeaders.filter(h => h.visibleOn.includes(activeTab));
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<ExclamationTriangleIcon />} title="Sắp hết hàng" value={reportData['low-stock'].length} color="bg-amber-500" />
                <StatCard icon={<ClockIcon />} title="Sắp hết hạn" value={reportData['expiring-soon'].length} color="bg-red-500" />
                <StatCard icon={<ArchiveBoxIcon />} title="Tồn kho lâu" value={reportData['slow-moving'].length} color="bg-sky-500" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('low-stock')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'low-stock' ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            Hàng sắp hết ({reportData['low-stock'].length})
                        </button>
                        <button onClick={() => setActiveTab('expiring-soon')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'expiring-soon' ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            Hàng sắp hết hạn ({reportData['expiring-soon'].length})
                        </button>
                        <button onClick={() => setActiveTab('slow-moving')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'slow-moving' ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                            Hàng tồn kho lâu ({reportData['slow-moving'].length})
                        </button>
                    </nav>
                </div>
                <div className="p-4 sm:p-6">
                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                         {paginatedData.length > 0 ? paginatedData.map(part => (
                            <div key={part.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 space-y-3">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{part.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{part.sku}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-b border-slate-200 dark:border-slate-600 py-3">
                                    {storeSettings.branches.map(branch => {
                                        const stock = part.stock[branch.id] || 0;
                                        return (
                                            <div key={branch.id}>
                                                <span className="text-slate-500 dark:text-slate-400">{branch.name}: </span>
                                                <span className={`font-bold ${stock > 0 && stock < 5 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                    {stock}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div>
                                    {activeTab === 'expiring-soon' && part.expiryDate && (
                                        <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                                             <ExclamationTriangleIcon className="w-4 h-4 mr-2"/>
                                            <span className="font-medium">Hết hạn vào: {part.expiryDate}</span>
                                        </div>
                                    )}
                                    {/* FIX: Cast `part` to `ReportPart` to safely access `daysSinceLastSale`. This is safe because this block only renders for the 'slow-moving' tab. */}
                                    {activeTab === 'slow-moving' && (part as ReportPart).daysSinceLastSale !== undefined && (
                                         <div className="flex items-center text-sm">
                                             <ClockIcon className="w-4 h-4 mr-2 text-sky-600 dark:text-sky-400"/>
                                             <span className="text-slate-600 dark:text-slate-300">Chưa bán trong: </span>
                                             <span className="font-bold text-sky-600 dark:text-sky-400 ml-1">{(part as ReportPart).daysSinceLastSale} ngày</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                         )) : (
                            <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                                Không có sản phẩm nào trong danh mục này.
                            </div>
                         )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left min-w-max">
                            <thead className="border-b border-slate-200 dark:border-slate-700">
                                <tr className="bg-slate-50 dark:bg-slate-700/50">
                                    {visibleHeaders.map(header => (
                                        <th key={header.key} className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                                             <div onClick={() => requestSort(header.key)} className="flex items-center space-x-2 cursor-pointer select-none">
                                                <span>{header.label}</span>
                                                <span className="text-slate-500">{getSortIndicator(header.key)}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length > 0 ? paginatedData.map(part => (
                                    <tr key={part.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        {visibleHeaders.map(header => {
                                            if(header.key.startsWith('stock_')) {
                                                const branchId = header.key.substring(6);
                                                const stock = part.stock[branchId] || 0;
                                                return (
                                                    <td key={header.key} className={`p-4 font-medium ${stock > 0 && stock < 5 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-900 dark:text-slate-100'}`}>
                                                        {stock}
                                                    </td>
                                                )
                                            }
                                            switch (header.key) {
                                                case 'name': return <td key={header.key} className="p-4 text-slate-900 dark:text-slate-100 font-semibold">{part.name}</td>;
                                                case 'sku': return <td key={header.key} className="p-4 text-slate-600 dark:text-slate-300">{part.sku}</td>;
                                                case 'expiryDate': return <td key={header.key} className="p-4 text-red-600 dark:text-red-400 font-medium">{part.expiryDate}</td>;
                                                // FIX: Cast `part` to `ReportPart` to access properties that only exist on that type.
                                                // This is safe because these headers are only rendered for the 'slow-moving' tab.
                                                case 'lastSoldDate': return <td key={header.key} className="p-4 text-slate-700 dark:text-slate-200">{(part as ReportPart).lastSoldDate || 'Chưa bán'}</td>;
                                                case 'daysSinceLastSale': return <td key={header.key} className="p-4 text-sky-600 dark:text-sky-400 font-medium">{(part as ReportPart).daysSinceLastSale}</td>;
                                                default: return <td key={header.key}></td>;
                                            }
                                        })}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={visibleHeaders.length} className="text-center p-8 text-slate-500 dark:text-slate-400">
                                            Không có sản phẩm nào trong danh mục này.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {sortedData.length > 0 && (
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={ITEMS_PER_PAGE}
                            totalItems={sortedData.length}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryReport;
