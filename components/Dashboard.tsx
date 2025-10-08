import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
// FIX: Remove unused icon imports that were causing errors.
import { WrenchScrewdriverIcon, ArchiveBoxIcon, UsersIcon, BanknotesIcon, ChartBarIcon, ClockIcon, DocumentTextIcon } from './common/Icons';
import type { WorkOrder, InventoryTransaction, Part, PaymentSource } from '../types';

interface StatCardProps {
    // Fix: Changed icon prop type to React.ReactElement to ensure it's a clonable element, fixing the type error with React.cloneElement.
    // Fix: Use React.ReactElement<any> to allow passing props like className without causing a TypeScript error.
    icon: React.ReactElement<any>;
    title: string;
    value: string;
    color: string;
    linkTo?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, linkTo }) => {
    const content = (
         <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm flex items-center h-full border border-slate-200/60 dark:border-slate-700">
            <div className={`p-4 rounded-full ${color}`}>
                {/* FIX: Remove type assertion as the prop type is now correct. */}
                {React.cloneElement(icon, { className: 'w-7 h-7 text-white' })}
            </div>
            <div className="ml-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            </div>
        </div>
    );
    
    if (linkTo) {
        return (
            <Link to={linkTo} className="hover:opacity-90 transition-opacity duration-200">
                {content}
            </Link>
        )
    }
    return content;
};


interface DashboardProps {
    workOrders: WorkOrder[];
    transactions: InventoryTransaction[];
    parts: Part[];
    currentBranchId: string;
    paymentSources: PaymentSource[];
}

const Dashboard: React.FC<DashboardProps> = ({ workOrders, transactions, parts, currentBranchId, paymentSources }) => {
  // Mock data for demonstration
  const stats = {
    dailyRevenue: 8500000,
    servicesToday: 12,
    newCustomers: 3,
  };

  const salesData = useMemo(() => {
        const workOrderSales = workOrders
            .filter(wo => wo.status === 'Trả máy' && wo.branchId === currentBranchId)
            .map(wo => ({ total: wo.total }));

        const retailSales = transactions
            .filter(tx => tx.type === 'Xuất kho' && tx.branchId === currentBranchId)
            .map(tx => ({ total: tx.totalPrice || 0 }));
            
        return [...workOrderSales, ...retailSales];
    }, [workOrders, transactions, currentBranchId]);

    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.total, 0);

    const lowStockCount = useMemo(() => {
        return parts.filter(p => (p.stock[currentBranchId] || 0) > 0 && (p.stock[currentBranchId] || 0) < 5).length;
    }, [parts, currentBranchId]);

  const recentActivities = [
    { id: 1, icon: <WrenchScrewdriverIcon className="w-5 h-5 text-sky-500"/>, text: "Hoàn thành sửa xe cho khách hàng Nguyễn Văn A.", time: "10 phút trước" },
    { id: 2, icon: <ArchiveBoxIcon className="w-5 h-5 text-green-500"/>, text: "Nhập thêm 20 bugi NGK.", time: "1 giờ trước" },
    { id: 3, icon: <UsersIcon className="w-5 h-5 text-violet-500"/>, text: "Khách hàng Trần Thị B đặt lịch thay nhớt.", time: "3 giờ trước" },
    { id: 4, icon: <DocumentTextIcon className="w-5 h-5 text-slate-500"/>, text: "Thanh toán đơn hàng #1024.", time: "5 giờ trước" },
  ];
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Bảng điều khiển</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            icon={<BanknotesIcon />} 
            title="Doanh thu hôm nay" 
            value={`${stats.dailyRevenue.toLocaleString('vi-VN')} ₫`}
            color="bg-sky-500"
        />
        <StatCard 
            icon={<UsersIcon />} 
            title="Lượt khách hôm nay" 
            value={stats.servicesToday.toString()}
            color="bg-green-500"
        />
        <StatCard 
            icon={<ArchiveBoxIcon />} 
            title="Phụ tùng sắp hết" 
            value={lowStockCount.toString()}
            color="bg-amber-500"
            linkTo="/inventory"
        />
        <StatCard 
            icon={<ChartBarIcon />}
            title="Tổng doanh thu (Chi nhánh)"
            value={`${totalRevenue.toLocaleString('vi-VN')} ₫`}
            color="bg-violet-500"
            linkTo="/reports/revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-100 mb-4">Hoạt động gần đây</h2>
            <ul className="space-y-4">
                {recentActivities.map(activity => (
                    <li key={activity.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1 bg-slate-100 dark:bg-slate-700 p-2 rounded-full">{activity.icon}</div>
                        <div>
                            <p className="text-slate-800 dark:text-slate-200">{activity.text}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 flex items-center">
                                <ClockIcon className="w-3 h-3 mr-1.5"/>
                                {activity.time}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-100 mb-4">Tình hình tài chính</h2>
                <ul className="space-y-3">
                    {paymentSources.map(source => (
                        <li key={source.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{source.name}</span>
                            <span className="font-bold text-lg text-green-600 dark:text-green-400">{(source.balance[currentBranchId] || 0).toLocaleString('vi-VN')} ₫</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                <h2 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-100 mb-4">Công việc cần chú ý</h2>
                <ul className="space-y-3">
                    <li className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <span className="text-slate-700 dark:text-slate-300">Kiểm tra định kỳ xe SH của anh Long</span>
                        <span className="text-sm font-medium text-red-500 bg-red-100 dark:bg-red-500/20 dark:text-red-300 px-2.5 py-1 rounded-full">Sắp tới hạn</span>
                    </li>
                    <li className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <span className="text-slate-700 dark:text-slate-300">Gọi điện xác nhận lịch hẹn với chị Mai</span>
                        <span className="text-sm font-medium text-sky-600 bg-sky-100 dark:bg-sky-500/20 dark:text-sky-300 px-2.5 py-1 rounded-full">Hôm nay</span>
                    </li>
                     <li className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <span className="text-slate-700 dark:text-slate-300">Đặt hàng dầu nhớt Motul</span>
                        <span className="text-sm font-medium text-amber-600 bg-amber-100 dark:bg-amber-500/20 dark:text-amber-300 px-2.5 py-1 rounded-full">Cần thực hiện</span>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;