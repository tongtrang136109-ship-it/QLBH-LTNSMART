import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { WrenchScrewdriverIcon, ArchiveBoxIcon, UsersIcon, BanknotesIcon, ChartBarIcon, ClockIcon, BellAlertIcon } from './common/Icons';
import type { WorkOrder, Customer, Part } from '../types';

interface StatCardProps {
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
    customers: Customer[];
    parts: Part[];
    currentBranchId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ workOrders, customers, parts, currentBranchId }) => {
  const stats = {
    dailyRevenue: 8500000,
    servicesToday: 12,
    newCustomers: 3,
  };

  const salesData = useMemo(() => {
        const branchWorkOrders = workOrders.filter(wo => wo.branchId === currentBranchId && wo.status === 'Trả máy');
        return branchWorkOrders.reduce((sum, wo) => sum + wo.total, 0);
    }, [workOrders, currentBranchId]);

    const lowStockCount = useMemo(() => {
        return parts.filter(p => (p.stock[currentBranchId] || 0) > 0 && (p.stock[currentBranchId] || 0) < 5).length;
    }, [parts, currentBranchId]);

  const recentActivities = [
    { id: 1, icon: <WrenchScrewdriverIcon className="w-5 h-5 text-sky-500"/>, text: "Hoàn thành sửa xe cho khách hàng Nguyễn Văn A.", time: "10 phút trước" },
    { id: 2, icon: <ArchiveBoxIcon className="w-5 h-5 text-green-500"/>, text: "Nhập thêm 20 bugi NGK.", time: "1 giờ trước" },
    { id: 3, icon: <UsersIcon className="w-5 h-5 text-violet-500"/>, text: "Khách hàng Trần Thị B đặt lịch thay nhớt.", time: "3 giờ trước" },
  ];

  const oilChangeReminders = useMemo(() => {
    const OIL_CHANGE_INTERVAL = 1500; // km
    const latestOdometerMap = new Map<string, number>();

    // Find the latest odometer reading for each customer (by phone number)
    workOrders.forEach(wo => {
        if (wo.customerPhone && wo.odometerReading) {
            const currentMax = latestOdometerMap.get(wo.customerPhone) || 0;
            if (wo.odometerReading > currentMax) {
                latestOdometerMap.set(wo.customerPhone, wo.odometerReading);
            }
        }
    });

    return customers
        .map(customer => {
            if (!customer.lastServiceOdometer || !customer.phone) return null;

            const latestOdometer = latestOdometerMap.get(customer.phone);
            if (!latestOdometer || latestOdometer <= customer.lastServiceOdometer) return null;

            const kmSinceChange = latestOdometer - customer.lastServiceOdometer;
            if (kmSinceChange >= OIL_CHANGE_INTERVAL) {
                return {
                    ...customer,
                    latestOdometer,
                    kmSinceChange,
                    kmOverdue: kmSinceChange - OIL_CHANGE_INTERVAL,
                };
            }
            return null;
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)
        .sort((a,b) => b.kmOverdue - a.kmOverdue);

  }, [customers, workOrders]);
  
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
            title="Tổng doanh thu DV (Chi nhánh)"
            value={`${salesData.toLocaleString('vi-VN')} ₫`}
            color="bg-violet-500"
            linkTo="/reports/revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-100 mb-4 flex items-center">
                <BellAlertIcon className="w-6 h-6 mr-3 text-orange-500"/>
                Khách hàng cần nhắc nhở
            </h2>
            {oilChangeReminders.length > 0 ? (
                <ul className="space-y-3 max-h-96 overflow-y-auto">
                    {oilChangeReminders.map(customer => (
                        <li key={customer.id} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{customer.name}</p>
                                    <a href={`tel:${customer.phone}`} className="text-sm text-sky-600 dark:text-sky-400 hover:underline">{customer.phone}</a>
                                </div>
                                <span className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-2.5 py-1 rounded-full">
                                    Quá {customer.kmOverdue.toLocaleString('vi-VN')} km
                                </span>
                            </div>
                            <div className="mt-2 pt-2 border-t border-orange-200 dark:border-orange-500/30 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                <p>Lần thay nhớt cuối: <strong>{customer.lastServiceDate}</strong> lúc <strong>{customer.lastServiceOdometer?.toLocaleString('vi-VN')} km</strong></p>
                                <p>Lần ghé gần nhất: <strong>{customer.latestOdometer.toLocaleString('vi-VN')} km</strong> (đã đi {customer.kmSinceChange.toLocaleString('vi-VN')} km)</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>Hiện không có khách hàng nào đến hạn thay nhớt.</p>
                </div>
            )}
        </div>
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700">
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
      </div>
    </div>
  );
};

export default Dashboard;