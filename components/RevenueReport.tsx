import React, { useState, useMemo } from 'react';
import type { WorkOrder, InventoryTransaction, Part } from '../types';
import { ChartBarIcon, BanknotesIcon, ArchiveBoxIcon, ChartPieIcon, ArrowDownTrayIcon } from './common/Icons';
import Pagination from './common/Pagination';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Sub-component for Grouped Bar Chart
const GroupedBarChart: React.FC<{ data: { label: string; revenue: number; cost: number; profit: number }[] }> = ({ data }) => {
    const maxValue = useMemo(() => {
        if (data.length === 0) return 0;
        const maxValues = data.map(d => Math.max(d.revenue, d.cost));
        return Math.max(...maxValues, 1); // Avoid division by zero
    }, [data]);

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-80 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400">Không có dữ liệu để hiển thị.</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Tổng quan Doanh thu - Chi phí - Lợi nhuận</h3>
            <div className="flex justify-end space-x-4 mb-4 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center"><span className="w-3 h-3 bg-sky-500 mr-2 rounded-sm"></span>Doanh thu</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-amber-500 mr-2 rounded-sm"></span>Chi phí</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 mr-2 rounded-sm"></span>Lợi nhuận</div>
            </div>
            <div className="overflow-x-auto pb-8 -mb-4">
                <div className="flex items-end h-80 space-x-2" style={{ minWidth: `${data.length * 60}px` }}>
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                            <div className="absolute -top-14 hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10">
                                <div>Doanh thu: {formatCurrency(item.revenue)}</div>
                                <div>Chi phí: {formatCurrency(item.cost)}</div>
                                <div className="font-bold">Lợi nhuận: {formatCurrency(item.profit)}</div>
                            </div>
                            <div className="flex items-end h-full w-full justify-center space-x-[10%]">
                                <div className="w-full bg-sky-400 hover:bg-sky-500 transition-all duration-300 rounded-t" style={{ height: `${Math.max(0, (item.revenue / maxValue)) * 100}%` }} />
                                <div className="w-full bg-amber-400 hover:bg-amber-500 transition-all duration-300 rounded-t" style={{ height: `${Math.max(0, (item.cost / maxValue)) * 100}%` }} />
                                <div className="w-full bg-green-400 hover:bg-green-500 transition-all duration-300 rounded-t" style={{ height: `${Math.max(0, (item.profit / maxValue)) * 100}%` }} />
                            </div>
                            <span className="mt-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProfitBarChart: React.FC<{ data: { label: string; profit: number }[] }> = ({ data }) => {
    const maxValue = useMemo(() => {
        if (data.length === 0) return 0;
        const maxProfit = Math.max(...data.map(d => d.profit));
        return Math.max(maxProfit, 1);
    }, [data]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4">Xu hướng lợi nhuận ròng</h3>
            <div className="flex items-end h-60 space-x-2 border-b border-slate-200 dark:border-slate-700 pb-4">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                        <div className="absolute -top-8 hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10">
                            {formatCurrency(item.profit)}
                        </div>
                        <div className="w-3/5 bg-green-400 hover:bg-green-500 transition-all duration-300 rounded-t" style={{ height: `${Math.max(0, (item.profit / maxValue)) * 100}%` }} />
                        <span className="absolute -bottom-6 text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryBreakdown: React.FC<{ data: { category: string; revenue: number; percentage: number }[] }> = ({ data }) => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center"><ChartPieIcon className="w-6 h-6 mr-3 text-violet-600"/>Doanh thu theo Danh mục</h3>
            <div className="space-y-3">
                {data.length > 0 ? data.map(item => (
                    <div key={item.category}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{item.category}</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(item.revenue)} ({item.percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-violet-500 h-2.5 rounded-full" style={{ width: `${item.percentage}%` }}></div>
                        </div>
                    </div>
                )) : (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">Không có dữ liệu.</p>
                )}
            </div>
        </div>
    );
};


interface RevenueReportProps {
    workOrders: WorkOrder[];
    transactions: InventoryTransaction[];
    parts: Part[];
    currentBranchId: string;
}

const ITEMS_PER_PAGE = 20;

const RevenueReport: React.FC<RevenueReportProps> = ({ workOrders, transactions, parts, currentBranchId }) => {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
    
    // States for report data
    const [reportData, setReportData] = useState<{ label: string; revenue: number; cost: number; profit: number }[]>([]);
    const [productSalesDetails, setProductSalesDetails] = useState<{ partName: string; sku: string; quantity: number; revenue: number; }[]>([]);
    const [categoryRevenueDetails, setCategoryRevenueDetails] = useState<{ category: string; revenue: number; percentage: number; }[]>([]);
    const [productSortConfig, setProductSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const processedSales = useMemo(() => {
        const workOrderItems = workOrders
            .filter(wo => wo.status === 'Trả máy' && wo.branchId === currentBranchId && wo.partsUsed)
            .flatMap(wo => wo.partsUsed!.map(usedPart => {
                const partInfo = parts.find(p => p.id === usedPart.partId);
                return {
                    date: wo.creationDate,
                    revenue: usedPart.price * usedPart.quantity,
                    cost: (partInfo?.price || 0) * usedPart.quantity,
                    partId: usedPart.partId,
                    partName: usedPart.partName,
                    sku: usedPart.sku,
                    category: partInfo?.category || 'Chưa phân loại',
                    quantity: usedPart.quantity
                };
            }));

        const laborRevenue = workOrders
            .filter(wo => wo.status === 'Trả máy' && wo.branchId === currentBranchId && wo.laborCost > 0)
            .map(wo => ({
                date: wo.creationDate, revenue: wo.laborCost, cost: 0,
                partId: 'LABOR', partName: 'Tiền công sửa chữa', sku: 'DV-SC',
                category: 'Dịch vụ', quantity: 1
            }));

        const retailSaleItems = transactions
            .filter(tx => tx.type === 'Xuất kho' && tx.branchId === currentBranchId && tx.saleId)
            .map(tx => {
                const partInfo = parts.find(p => p.id === tx.partId);
                return {
                    date: tx.date, revenue: tx.totalPrice || 0,
                    cost: (partInfo?.price || 0) * tx.quantity,
                    partId: tx.partId, partName: tx.partName,
                    sku: partInfo?.sku || 'N/A', category: partInfo?.category || 'Chưa phân loại',
                    quantity: tx.quantity
                };
            });

        return [...workOrderItems, ...laborRevenue, ...retailSaleItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [workOrders, transactions, parts, currentBranchId]);

    const generateReport = () => {
        setCurrentPage(1);
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        const filteredSales = processedSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start && saleDate <= end;
        });

        // 1. Chart Data Aggregation
        const aggregated: { [key: string]: { revenue: number, cost: number } } = {};
        const getWeekNumber = (d: Date) => {
            d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
            return { year: d.getUTCFullYear(), week: weekNo };
        };

        filteredSales.forEach(sale => {
            const saleDate = new Date(sale.date);
            let key = '';
            if (period === 'day') key = saleDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit'});
            else if (period === 'week') { const { year, week } = getWeekNumber(saleDate); key = `${year}-W${week.toString().padStart(2, '0')}`; }
            else if (period === 'month') key = `${saleDate.getFullYear()}-${(saleDate.getMonth() + 1).toString().padStart(2, '0')}`;
            if (key) {
                if (!aggregated[key]) aggregated[key] = { revenue: 0, cost: 0 };
                aggregated[key].revenue += sale.revenue;
                aggregated[key].cost += sale.cost;
            }
        });
        setReportData(Object.keys(aggregated).sort().map(key => ({
            label: key, revenue: aggregated[key].revenue, cost: aggregated[key].cost,
            profit: aggregated[key].revenue - aggregated[key].cost,
        })));

        // 2. Product Sales Details
        const productSales: { [key: string]: { partName: string; sku: string; quantity: number; revenue: number; } } = {};
        filteredSales.filter(s => s.partId !== 'LABOR').forEach(sale => {
            if (!productSales[sale.partId]) productSales[sale.partId] = { partName: sale.partName, sku: sale.sku, quantity: 0, revenue: 0 };
            productSales[sale.partId].quantity += sale.quantity;
            productSales[sale.partId].revenue += sale.revenue;
        });
        setProductSalesDetails(Object.values(productSales).sort((a,b) => b.quantity - a.quantity));

        // 3. Category Revenue Details
        const categoryRevenues: { [key: string]: number } = {};
        let totalRevenueForCategories = 0;
        filteredSales.forEach(sale => {
            const category = sale.category || 'Chưa phân loại';
            categoryRevenues[category] = (categoryRevenues[category] || 0) + sale.revenue;
            totalRevenueForCategories += sale.revenue;
        });
        setCategoryRevenueDetails(totalRevenueForCategories > 0 ? Object.entries(categoryRevenues)
            .map(([category, revenue]) => ({ category, revenue, percentage: (revenue / totalRevenueForCategories) * 100 }))
            .sort((a,b) => b.revenue - a.revenue) : []);
    };

    const sortedProductSales = useMemo(() => {
        if (!productSortConfig) return productSalesDetails;
        return [...productSalesDetails].sort((a, b) => {
            const key = productSortConfig.key as keyof typeof a;
            if (a[key] < b[key]) return productSortConfig.direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return productSortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [productSalesDetails, productSortConfig]);
    
    const paginatedProductSales = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedProductSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedProductSales, currentPage]);

    const totalPages = Math.ceil(sortedProductSales.length / ITEMS_PER_PAGE);

    const exportToCSV = (type: 'summary' | 'products') => {
        let headers: string[], rows: (string|number)[][], filename: string;

        if (type === 'summary' && reportData.length > 0) {
            headers = ['Thoi gian', 'Doanh thu (VND)', 'Chi phi (VND)', 'Loi nhuan (VND)'];
            rows = reportData.map(item => [item.label, item.revenue, item.cost, item.profit]);
            filename = 'bao_cao_doanh_thu.csv';
        } else if (type === 'products' && productSalesDetails.length > 0) {
            headers = ['Ten san pham', 'SKU', 'So luong ban', 'Doanh thu (VND)'];
            rows = sortedProductSales.map(item => [item.partName, item.sku, item.quantity, item.revenue]);
            filename = 'bao_cao_ban_hang_san_pham.csv';
        } else {
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const requestProductSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (productSortConfig && productSortConfig.key === key && productSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setProductSortConfig({ key, direction });
    };

    const totalRevenueInPeriod = useMemo(() => reportData.reduce((sum, item) => sum + item.revenue, 0), [reportData]);
    const totalCostInPeriod = useMemo(() => reportData.reduce((sum, item) => sum + item.cost, 0), [reportData]);
    const totalProfitInPeriod = useMemo(() => reportData.reduce((sum, item) => sum + item.profit, 0), [reportData]);

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Từ ngày</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm dark:bg-slate-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đến ngày</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm dark:bg-slate-700 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" /></div>
                    <div className="md:col-span-2 lg:col-span-1"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Xem theo</label><div className="mt-1 flex rounded-md shadow-sm"><button onClick={() => setPeriod('day')} className={`px-4 py-2 text-sm font-medium rounded-l-md border border-slate-300 dark:border-slate-600 ${period === 'day' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>Ngày</button><button onClick={() => setPeriod('week')} className={`px-4 py-2 text-sm font-medium border-t border-b border-slate-300 dark:border-slate-600 ${period === 'week' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>Tuần</button><button onClick={() => setPeriod('month')} className={`px-4 py-2 text-sm font-medium rounded-r-md border border-slate-300 dark:border-slate-600 ${period === 'month' ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>Tháng</button></div></div>
                    <div className="lg:col-span-2"><button onClick={generateReport} className="w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition-colors">Xem báo cáo</button></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-sky-100 dark:bg-sky-900/50 p-5 rounded-lg border border-sky-200 dark:border-sky-800 flex items-start"><div className="p-3 rounded-full bg-white dark:bg-sky-900 mr-4"><BanknotesIcon className="w-6 h-6 text-sky-600 dark:text-sky-400"/></div><div><p className="text-sm font-medium text-sky-800 dark:text-sky-300">Tổng Doanh thu</p><p className="text-2xl font-bold text-sky-800 dark:text-sky-200">{formatCurrency(totalRevenueInPeriod)}</p></div></div>
                <div className="bg-amber-100 dark:bg-amber-900/50 p-5 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start"><div className="p-3 rounded-full bg-white dark:bg-amber-900 mr-4"><ArchiveBoxIcon className="w-6 h-6 text-amber-600 dark:text-amber-400"/></div><div><p className="text-sm font-medium text-amber-800 dark:text-amber-300">Tổng Chi phí</p><p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{formatCurrency(totalCostInPeriod)}</p></div></div>
                <div className="bg-green-100 dark:bg-green-900/50 p-5 rounded-lg border border-green-200 dark:border-green-800 flex items-start"><div className="p-3 rounded-full bg-white dark:bg-green-900 mr-4"><ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400"/></div><div><p className="text-sm font-medium text-green-800 dark:text-green-300">Tổng Lợi nhuận</p><p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(totalProfitInPeriod)}</p></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <GroupedBarChart data={reportData} />
                </div>
                <div>
                     <CategoryBreakdown data={categoryRevenueDetails} />
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-200">Chi tiết Bán hàng theo Sản phẩm</h3>
                    <button onClick={() => exportToCSV('products')} className="flex items-center text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2 px-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"><ArrowDownTrayIcon className="w-4 h-4 mr-2"/> Tải về</button>
                </div>
                
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                    {paginatedProductSales.length > 0 ? paginatedProductSales.map(item => (
                        <div key={item.sku} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.partName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.sku}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-lg text-sky-600 dark:text-sky-400">{formatCurrency(item.revenue)}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">SL: {item.quantity}</p>
                                </div>
                            </div>
                        </div>
                    )) : (
                         <div className="text-center p-8 text-slate-500 dark:text-slate-400">Không có dữ liệu bán hàng.</div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-slate-700">
                            <tr className="bg-slate-50 dark:bg-slate-700/50">
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300"><div onClick={() => requestProductSort('partName')} className="cursor-pointer">Sản phẩm</div></th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300"><div onClick={() => requestProductSort('sku')} className="cursor-pointer">SKU</div></th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center"><div onClick={() => requestProductSort('quantity')} className="cursor-pointer">Số lượng bán</div></th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right"><div onClick={() => requestProductSort('revenue')} className="cursor-pointer">Doanh thu</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProductSales.length > 0 ? paginatedProductSales.map(item => (
                                <tr key={item.sku} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{item.partName}</td>
                                    <td className="p-3 text-slate-600 dark:text-slate-400">{item.sku}</td>
                                    <td className="p-3 text-slate-800 dark:text-slate-200 font-medium text-center">{item.quantity}</td>
                                    <td className="p-3 text-slate-900 dark:text-slate-100 font-semibold text-right">{formatCurrency(item.revenue)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-slate-500 dark:text-slate-400">Không có dữ liệu bán hàng.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={sortedProductSales.length} />}
            </div>

        </div>
    );
};

export default RevenueReport;