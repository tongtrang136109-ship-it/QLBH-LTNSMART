import React, { useState, useMemo } from 'react';
import type { WorkOrder, InventoryTransaction, Part, StoreSettings, FixedAsset, CapitalInvestment } from '../types';
import { BanknotesIcon, ChartBarIcon, WrenchScrewdriverIcon, BuildingLibraryIcon, ArchiveBoxIcon } from './common/Icons';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- Sub-components for UI ---

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-start border border-slate-200/60 dark:border-slate-700">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const BranchPerformanceChart: React.FC<{ data: { name: string; revenue: number; profit: number }[] }> = ({ data }) => {
    const maxVal = useMemo(() => Math.max(1, ...data.map(d => d.revenue)), [data]);

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Hiệu suất theo Chi nhánh</h3>
            <div className="space-y-4">
                {data.map(branch => (
                    <div key={branch.name}>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{branch.name}</span>
                            <span className="font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(branch.revenue)}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 relative group">
                            <div className="bg-sky-500 h-4 rounded-full" style={{ width: `${(branch.revenue / maxVal) * 100}%` }} />
                            <div className="absolute top-0 left-0 h-4 bg-green-500 rounded-full" style={{ width: `${(branch.profit / maxVal) * 100}%` }}>
                                <div className="absolute -right-12 top-4 hidden group-hover:block bg-slate-900 text-white text-xs p-1 rounded">
                                    Lợi nhuận: {formatCurrency(branch.profit)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end space-x-4 mt-4 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center"><span className="w-3 h-3 bg-sky-500 mr-2 rounded-sm"></span>Doanh thu</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 mr-2 rounded-sm"></span>Lợi nhuận</div>
            </div>
        </div>
    );
};

const SalesTrendChart: React.FC<{ data: { label: string; revenue: number; profit: number }[] }> = ({ data }) => {
    const maxVal = useMemo(() => Math.max(1, ...data.map(d => d.revenue)), [data]);

    if (data.length === 0) {
        return <div className="flex items-center justify-center h-80 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-500 dark:text-slate-400">Không có dữ liệu để hiển thị.</div>;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Xu hướng Doanh thu & Lợi nhuận</h3>
            <div className="overflow-x-auto pb-8 -mb-4">
                <div className="flex items-end h-72 border-b border-l border-slate-200 dark:border-slate-700" style={{ minWidth: `${data.length * 50}px` }}>
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end group relative h-full px-1">
                            <div className="absolute -top-14 hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10">
                                <div>Doanh thu: {formatCurrency(item.revenue)}</div>
                                <div className="font-bold">Lợi nhuận: {formatCurrency(item.profit)}</div>
                            </div>
                            <div className="relative w-full h-full flex items-end justify-center">
                                <div className="w-3/5 bg-sky-200 dark:bg-sky-800/50 rounded-t" style={{ height: `${(item.revenue / maxVal) * 100}%` }} />
                                <div className="absolute bottom-0 w-3/5 bg-green-400 dark:bg-green-500 rounded-t" style={{ height: `${Math.max(0, (item.profit / maxVal)) * 100}%` }} />
                            </div>
                            <span className="mt-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AnalysisCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</h3>
        {children}
    </div>
);

const ListItem: React.FC<{ label: string; value: string; subValue?: string; }> = ({ label, value, subValue }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
        <span className="text-slate-700 dark:text-slate-300 truncate pr-4">{label}</span>
        <div className="text-right flex-shrink-0">
            <span className="font-semibold text-slate-800 dark:text-slate-100">{value}</span>
            {subValue && <span className="text-xs text-slate-500 dark:text-slate-400 block">{subValue}</span>}
        </div>
    </div>
);

const CategoryItem: React.FC<{ name: string; revenue: number; percentage: number }> = ({ name, revenue, percentage }) => (
    <div>
        <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-800 dark:text-slate-200">{name}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(revenue)}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }} title={`${percentage.toFixed(1)}%`} />
        </div>
    </div>
);

// --- Main Component ---
interface ExecutiveSummaryProps {
    workOrders: WorkOrder[];
    transactions: InventoryTransaction[];
    parts: Part[];
    storeSettings: StoreSettings;
    fixedAssets: FixedAsset[];
    capitalInvestments: CapitalInvestment[];
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ workOrders, transactions, parts, storeSettings, fixedAssets, capitalInvestments }) => {
    const today = new Date();
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        return d.toISOString().split('T')[0];
    });
    const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');

    const setDateRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - (days - 1));
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    };

    const processedData = useMemo(() => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        
        const allSales = [
            ...workOrders
                .filter(wo => wo.status === 'Trả máy' && wo.partsUsed)
                .flatMap(wo => wo.partsUsed!.map(usedPart => {
                    const partInfo = parts.find(p => p.id === usedPart.partId);
                    return {
                        date: wo.creationDate, revenue: usedPart.price * usedPart.quantity,
                        cost: (partInfo?.price || 0) * usedPart.quantity,
                        partId: usedPart.partId, partName: usedPart.partName,
                        quantity: usedPart.quantity, branchId: wo.branchId,
                        category: partInfo?.category || 'Chưa phân loại'
                    };
                })),
            ...workOrders
                .filter(wo => wo.status === 'Trả máy' && wo.laborCost > 0)
                .map(wo => ({
                    date: wo.creationDate, revenue: wo.laborCost, cost: 0,
                    partId: 'LABOR', partName: 'Tiền công sửa chữa',
                    quantity: 1, branchId: wo.branchId, category: 'Dịch vụ'
                })),
            ...transactions
                .filter(tx => tx.type === 'Xuất kho' && tx.saleId)
                .map(tx => {
                    const partInfo = parts.find(p => p.id === tx.partId);
                    return {
                        date: tx.date, revenue: tx.totalPrice || 0,
                        cost: (partInfo?.price || 0) * tx.quantity,
                        partId: tx.partId, partName: tx.partName,
                        quantity: tx.quantity, branchId: tx.branchId,
                        category: partInfo?.category || 'Chưa phân loại'
                    };
                })
        ];
        
        const filteredSales = allSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start && saleDate <= end;
        });

        // --- OVERVIEW DATA ---
        const branchData: { [key: string]: { name: string, revenue: number, cost: number, workOrders: number } } = {};
        storeSettings.branches.forEach(b => {
            branchData[b.id] = { name: b.name, revenue: 0, cost: 0, workOrders: 0 };
        });
        const dailyData: { [key: string]: { revenue: number, cost: number } } = {};

        filteredSales.forEach(sale => {
            if (branchData[sale.branchId]) {
                branchData[sale.branchId].revenue += sale.revenue;
                branchData[sale.branchId].cost += sale.cost;
            }
            const dayKey = new Date(sale.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            if (!dailyData[dayKey]) dailyData[dayKey] = { revenue: 0, cost: 0 };
            dailyData[dayKey].revenue += sale.revenue;
            dailyData[dayKey].cost += sale.cost;
        });

        workOrders.forEach(wo => {
            const woDate = new Date(wo.creationDate);
            if (wo.status === 'Trả máy' && woDate >= start && woDate <= end && branchData[wo.branchId]) {
                branchData[wo.branchId].workOrders++;
            }
        });
        
        const totalRevenue = Object.values(branchData).reduce((sum, b) => sum + b.revenue, 0);
        const totalCost = Object.values(branchData).reduce((sum, b) => sum + b.cost, 0);
        const totalServices = Object.values(branchData).reduce((sum, b) => sum + b.workOrders, 0);
        const salesTrend = Object.entries(dailyData).map(([label, data]) => ({
            label, ...data, profit: data.revenue - data.cost
        })).sort((a,b) => {
            const [dayA, monthA] = a.label.split('/');
            const [dayB, monthB] = b.label.split('/');
            return new Date(`${monthA}/${dayA}/2024`).getTime() - new Date(`${monthB}/${dayB}/2024`).getTime();
        });

        const overview = {
            totalRevenue, totalCost, totalProfit: totalRevenue - totalCost, totalServices,
            branchPerformance: Object.values(branchData).map(b => ({...b, profit: b.revenue - b.cost})),
            salesTrend,
        };

        // --- ANALYSIS DATA ---
        const analysis = storeSettings.branches.map(branch => {
            const branchSales = filteredSales.filter(s => s.branchId === branch.id);
            const productPerformance: { [key: string]: { name: string; revenue: number; quantity: number; profit: number } } = {};
            branchSales.forEach(sale => {
                if (sale.partId !== 'LABOR') {
                    if (!productPerformance[sale.partId]) productPerformance[sale.partId] = { name: sale.partName, revenue: 0, quantity: 0, profit: 0 };
                    productPerformance[sale.partId].revenue += sale.revenue;
                    productPerformance[sale.partId].quantity += sale.quantity;
                    productPerformance[sale.partId].profit += (sale.revenue - sale.cost);
                }
            });
            const performanceArray = Object.values(productPerformance);

            const categoryPerformance: { [key: string]: { revenue: number; profit: number } } = {};
            branchSales.forEach(sale => {
                const category = sale.category || 'Chưa phân loại';
                if (!categoryPerformance[category]) categoryPerformance[category] = { revenue: 0, profit: 0 };
                categoryPerformance[category].revenue += sale.revenue;
                categoryPerformance[category].profit += (sale.revenue - sale.cost);
            });
            const totalBranchRevenue = branchSales.reduce((sum, s) => sum + s.revenue, 0);

            return {
                branchId: branch.id,
                branchName: branch.name,
                topByQuantity: [...performanceArray].sort((a,b) => b.quantity - a.quantity).slice(0, 5),
                topByProfit: [...performanceArray].sort((a,b) => b.profit - a.profit).slice(0, 5),
                categoryBreakdown: Object.entries(categoryPerformance)
                    .map(([name, data]) => ({ name, ...data, percentage: totalBranchRevenue > 0 ? (data.revenue / totalBranchRevenue) * 100 : 0 }))
                    .sort((a,b) => b.revenue - a.revenue),
            };
        });

        return { overview, analysis };
    }, [startDate, endDate, workOrders, transactions, parts, storeSettings.branches]);

    const assetValue = useMemo(() => fixedAssets.reduce((sum, a) => sum + a.purchasePrice, 0), [fixedAssets]);
    const inventoryValue = useMemo(() => parts.reduce((sum, p) => {
        const totalStock = Object.values(p.stock).reduce((s, q) => s + q, 0);
        return sum + totalStock * p.price;
    }, 0), [parts]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Báo cáo Tổng hợp</h1>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex gap-2">
                    <button onClick={() => setDateRange(7)} className="px-3 py-1.5 text-sm font-medium border rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">7 ngày</button>
                    <button onClick={() => setDateRange(30)} className="px-3 py-1.5 text-sm font-medium border rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">30 ngày</button>
                    <button onClick={() => setDateRange(90)} className="px-3 py-1.5 text-sm font-medium border rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700">90 ngày</button>
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-1.5 border rounded-md dark:bg-slate-700 dark:border-slate-600 [color-scheme:light] dark:[color-scheme:dark]" />
                    <span>-</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-1.5 border rounded-md dark:bg-slate-700 dark:border-slate-600 [color-scheme:light] dark:[color-scheme:dark]" />
                </div>
            </div>
            
             <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>Tổng quan</button>
                    <button onClick={() => setActiveTab('analysis')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis' ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>Phân tích</button>
                </nav>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <StatCard icon={<BanknotesIcon className="w-6 h-6 text-white"/>} title="Tổng Doanh thu" value={formatCurrency(processedData.overview.totalRevenue)} color="bg-sky-500" />
                        <StatCard icon={<ChartBarIcon className="w-6 h-6 text-white"/>} title="Tổng Lợi nhuận" value={formatCurrency(processedData.overview.totalProfit)} color="bg-green-500" />
                        <StatCard icon={<WrenchScrewdriverIcon className="w-6 h-6 text-white"/>} title="Lượt Dịch vụ" value={processedData.overview.totalServices.toString()} color="bg-indigo-500" />
                        <StatCard icon={<BuildingLibraryIcon className="w-6 h-6 text-white"/>} title="Giá trị Tài sản & Tồn kho" value={formatCurrency(assetValue + inventoryValue)} color="bg-violet-500" />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <SalesTrendChart data={processedData.overview.salesTrend} />
                        </div>
                        <div className="lg:col-span-1">
                            <BranchPerformanceChart data={processedData.overview.branchPerformance} />
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {processedData.analysis.map(data => (
                            <div key={data.branchId} className="space-y-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">{data.branchName}</h2>
                                
                                <AnalysisCard title="Top 5 sản phẩm bán chạy (Số lượng)">
                                    {data.topByQuantity.length > 0 ? (
                                        <div>
                                            {data.topByQuantity.map(item => (
                                                <ListItem key={item.name} label={item.name} value={`${item.quantity} sp`} subValue={formatCurrency(item.revenue)} />
                                            ))}
                                        </div>
                                    ) : <p className="text-sm text-slate-500 dark:text-slate-400">Không có dữ liệu.</p>}
                                </AnalysisCard>

                                <AnalysisCard title="Top 5 sản phẩm lợi nhuận cao nhất">
                                     {data.topByProfit.length > 0 ? (
                                        <div>
                                            {data.topByProfit.map(item => (
                                                <ListItem key={item.name} label={item.name} value={formatCurrency(item.profit)} subValue={`${item.quantity} sp`} />
                                            ))}
                                        </div>
                                     ) : <p className="text-sm text-slate-500 dark:text-slate-400">Không có dữ liệu.</p>}
                                </AnalysisCard>

                                <AnalysisCard title="Phân tích doanh thu theo danh mục">
                                     {data.categoryBreakdown.length > 0 ? (
                                        <div className="space-y-3">
                                            {data.categoryBreakdown.map(item => (
                                                <CategoryItem key={item.name} name={item.name} revenue={item.revenue} percentage={item.percentage} />
                                            ))}
                                        </div>
                                     ) : <p className="text-sm text-slate-500 dark:text-slate-400">Không có dữ liệu.</p>}
                                </AnalysisCard>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExecutiveSummary;
