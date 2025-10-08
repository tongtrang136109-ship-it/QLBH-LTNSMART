import React, { useMemo } from 'react';
import type { FixedAsset, CapitalInvestment } from '../types';
import { BuildingLibraryIcon, BanknotesIcon } from './common/Icons';

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface AssetReportProps {
    fixedAssets: FixedAsset[];
    capitalInvestments: CapitalInvestment[];
}

const AssetReport: React.FC<AssetReportProps> = ({ fixedAssets, capitalInvestments }) => {
    const totalAssetValue = useMemo(() => fixedAssets.reduce((sum, asset) => sum + asset.purchasePrice, 0), [fixedAssets]);
    const totalCapitalValue = useMemo(() => capitalInvestments.reduce((sum, inv) => sum + inv.amount, 0), [capitalInvestments]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Báo cáo Tài sản & Vốn</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-center border dark:border-slate-700">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/50"><BuildingLibraryIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" /></div>
                    <div className="ml-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tổng giá trị tài sản (nguyên giá)</p>
                        <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{formatCurrency(totalAssetValue)}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-center border dark:border-slate-700">
                    <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/50"><BanknotesIcon className="w-7 h-7 text-green-600 dark:text-green-400" /></div>
                    <div className="ml-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tổng vốn đã đầu tư</p>
                        <p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatCurrency(totalCapitalValue)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700">
                <h2 className="text-xl font-semibold p-4 border-b dark:border-slate-700 text-slate-800 dark:text-slate-100">Chi tiết tài sản cố định</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-max">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Tên tài sản</th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Ngày mua</th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Nguyên giá</th>
                                <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Chi nhánh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fixedAssets.map(asset => (
                                <tr key={asset.id} className="border-t dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{asset.name}</td>
                                    <td className="p-3 text-slate-700 dark:text-slate-300">{asset.purchaseDate}</td>
                                    <td className="p-3 text-right font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(asset.purchasePrice)}</td>
                                    <td className="p-3 text-slate-700 dark:text-slate-300">{asset.branchId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {fixedAssets.length === 0 && <div className="text-center p-8 text-slate-500 dark:text-slate-400">Không có dữ liệu tài sản.</div>}
                </div>
            </div>
            
        </div>
    );
};

export default AssetReport;