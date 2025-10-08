import React, { useState, useMemo } from 'react';
import type { WorkOrder, InventoryTransaction, Part, StoreSettings, FixedAsset, CapitalInvestment } from '../types';
import { BanknotesIcon, ChartBarIcon, WrenchScrewdriverIcon, BuildingLibraryIcon, ArchiveBoxIcon, SparklesIcon, LoadingSpinner } from './common/Icons';
import { getBusinessAnalysis } from '../services/geminiService';


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
    const [analysis, setAnalysis] = useState<Record<string, { content: string; error?: string }>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const setDateRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - (days - 1));
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    };

    const processedSales = useMemo(() => {
        const workOrderItems = workOrders
            .filter(wo => wo.status === 'Trả máy' && wo.partsUsed)
            .flatMap(wo => wo.partsUsed!.map(usedPart => {
                const partInfo = parts.find(p => p.id === usedPart.partId);
                return {
                    date: wo.creationDate, revenue: usedPart.price * usedPart.quantity,
                    cost: (partInfo?.price || 0) * usedPart.quantity,
                    partId: usedPart.partId, partName: usedPart.partName,
                    quantity: usedPart.quantity, branchId: wo.branchId
                };
            }));

        const laborRevenue = workOrders
            .filter(wo => wo.status === 'Trả máy' && wo.laborCost > 0)
            .map(wo => ({
                date: wo.creationDate, revenue: wo.laborCost, cost: 0,
                partId: 'LABOR', partName: 'Tiền công sửa chữa',
                quantity: 1, branchId: wo.branchId
            }));

        const retailSaleItems = transactions
            .filter(tx => tx.type === 'Xuất kho' && tx.saleId)
            .map(tx => {
                const partInfo = parts.find(p => p.id === tx.partId);
                return {
                    date: tx.date, revenue: tx.totalPrice || 0,
                    cost: (partInfo?.price || 0) * tx.quantity,
                    partId: tx.partId, partName: tx.partName,
                    quantity: tx.quantity, branchId: tx.branchId
                };
            });

        return [...workOrderItems, ...laborRevenue, ...retailSaleItems];
    }, [workOrders, transactions, parts]);

    const reportData = useMemo(() => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        
        const filteredSales = processedSales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= start && saleDate <= end;
        });

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
            const dayKey = new Date(sale.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit'});
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

        return {
            totalRevenue, totalCost, totalProfit: totalRevenue - totalCost, totalServices,
            branchPerformance: Object.values(branchData).map(b => ({...b, profit: b.revenue - b.cost})),
            salesTrend,
        };
    }, [startDate, endDate, processedSales, workOrders, storeSettings]);
    
    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalysis({});
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        const analysisPromises = storeSettings.branches.map(async (branch) => {
            try {
                const branchSales = processedSales.filter(s => {
                    const saleDate = new Date(s.date);
                    return s.branchId === branch.id && saleDate >= start && saleDate <= end;
                });
                
                const { revenue, cost } = reportData.branchPerformance.find(b => b.name === branch.name) || { revenue: 0, cost: 0 };
                const workOrderCount = workOrders.filter(wo => {
                     const woDate = new Date(wo.creationDate);
                     return wo.branchId === branch.id && wo.status === 'Trả máy' && woDate >= start && woDate <= end;
                }).length;
                
                const productPerformance: { [key: string]: { name: string; revenue: number; quantity: number; profit: number } } = {};
                branchSales.forEach(sale => {
                    if (sale.partId !== 'LABOR') {
                        if (!productPerformance[sale.partId]) {
                            productPerformance[sale.partId] = { name: sale.partName, revenue: 0, quantity: 0, profit: 0 };
                        }
                        productPerformance[sale.partId].revenue += sale.revenue;
                        productPerformance[sale.partId].quantity += sale.quantity;
                        productPerformance[sale.partId].profit += (sale.revenue - sale.cost);
                    }
                });
                
                const performanceArray = Object.values(productPerformance);
                
                const soldPartIds = new Set(Object.keys(productPerformance));
                const slowMovingProducts = parts.filter(p => (p.stock[branch.id] || 0) > 0 && !soldPartIds.has(p.id))
                    .map(p => ({ name: p.name, stock: p.stock[branch.id] }))
                    .slice(0, 5);

                const dataForAI = {
                    branchName: branch.name,
                    period: `${startDate} to ${endDate}`,
                    financialSummary: { totalRevenue: revenue, totalCost: cost, totalProfit: revenue - cost },
                    operationalSummary: { totalWorkOrders: workOrderCount },
                    productPerformance: {
                        topSellingByRevenue: [...performanceArray].sort((a,b) => b.revenue - a.revenue).slice(0, 5).map(({ name, revenue }) => ({ name, revenue })),
                        topSellingByQuantity: [...performanceArray].sort((a,b) => b.quantity - a.quantity).slice(0, 5).map(({ name, quantity }) => ({ name, quantity })),
                        mostProfitableItems: [...performanceArray].sort((a,b) => b.profit - a.profit).slice(0, 5).map(({ name, profit }) => ({ name, profit })),
                        slowMovingProducts,
                    }
                };
                
                const analysisText = await getBusinessAnalysis(JSON.stringify(dataForAI, null, 2));
                return { branchId: branch.id, content: analysisText };
            } catch (error) {
                console.error(`Error analyzing branch ${branch.name}:`, error);
                return { branchId: branch.id, content: '', error: 'Không thể tạo phân tích cho chi nhánh này.' };
            }
        });

        const results = await Promise.all(analysisPromises);
        const newAnalysis: Record<string, { content: string; error?: string }> = {};
        results.forEach(res => { newAnalysis[res.branchId] = { content: res.content, error: res.error }; });
        setAnalysis(newAnalysis);
        setIsAnalyzing(false);
    };


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
                        <StatCard icon={<BanknotesIcon className="w-6 h-6 text-white"/>} title="Tổng Doanh thu" value={formatCurrency(reportData.totalRevenue)} color="bg-sky-500" />
                        <StatCard icon={<ChartBarIcon className="w-6 h-6 text-white"/>} title="Tổng Lợi nhuận" value={formatCurrency(reportData.totalProfit)} color="bg-green-500" />
                        <StatCard icon={<WrenchScrewdriverIcon className="w-6 h-6 text-white"/>} title="Lượt Dịch vụ" value={reportData.totalServices.toString()} color="bg-indigo-500" />
                        <StatCard icon={<BuildingLibraryIcon className="w-6 h-6 text-white"/>} title="Giá trị Tài sản & Tồn kho" value={formatCurrency(assetValue + inventoryValue)} color="bg-violet-500" />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <SalesTrendChart data={reportData.salesTrend} />
                        </div>
                        <div className="lg:col-span-1">
                            <BranchPerformanceChart data={reportData.branchPerformance} />
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700 text-center">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Phân tích Kinh doanh bằng AI</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">Sử dụng AI để phân tích dữ liệu trong khoảng thời gian đã chọn và đưa ra các đề xuất cải thiện cho từng chi nhánh.</p>
                        <button 
                            onClick={handleAnalyze} 
                            disabled={isAnalyzing}
                            className="mt-4 flex items-center justify-center mx-auto bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                        >
                            {isAnalyzing ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Đang phân tích...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-5 h-5 mr-2"/>
                                    Bắt đầu Phân tích
                                </>
                            )}
                        </button>
                    </div>

                    {isAnalyzing && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {storeSettings.branches.map(branch => (
                                <div key={branch.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{branch.name}</h3>
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mt-6"></div>
                                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {Object.keys(analysis).length > 0 && !isAnalyzing && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {storeSettings.branches.map(branch => (
                                <div key={branch.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Phân tích cho: {branch.name}</h3>
                                    {analysis[branch.id]?.error ? (
                                        <p className="text-red-500">{analysis[branch.id].error}</p>
                                    ) : (
                                        <div className="prose prose-sm prose-slate dark:prose-invert max-w-none"
                                             dangerouslySetInnerHTML={{ __html: analysis[branch.id]?.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExecutiveSummary;