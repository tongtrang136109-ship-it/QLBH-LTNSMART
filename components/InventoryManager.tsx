import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Part, InventoryTransaction, User, StoreSettings } from '../types';
import { PlusIcon, PencilSquareIcon, ArchiveBoxIcon, DocumentTextIcon, MinusIcon, TrashIcon, EllipsisVerticalIcon, ExclamationTriangleIcon, Cog6ToothIcon, ArrowsRightLeftIcon, BanknotesIcon, ChevronDownIcon, CloudArrowUpIcon, ArrowUturnLeftIcon, ClockIcon, Squares2X2Icon, ArrowDownTrayIcon } from './common/Icons';
import Pagination from './common/Pagination';

// Helper to format currency
const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// --- Dữ liệu mẫu phụ tùng Honda Việt Nam (ĐÃ MỞ RỘNG TOÀN DIỆN VÀ THÊM GIÁ) ---
const hondaPartsData: (Omit<Part, 'id' | 'stock'> & { model: string[] })[] = [
    // === Phụ tùng Tiêu hao & Bảo dưỡng ===
    { name: 'Nhớt Honda chính hãng (0.8L, MA SL 10W30)', sku: 'MA-SL-10W30-0.8', price: 85000, sellingPrice: 105000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Wave Alpha', 'Wave RSX', 'Future 125', 'Future Neo', 'Future X', 'Dream'] },
    { name: 'Nhớt Honda chính hãng (1L, MA SL 10W30)', sku: 'MA-SL-10W30-1.0', price: 100000, sellingPrice: 125000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Winner/Winner X'] },
    { name: 'Nhớt hộp số (120ml)', sku: 'GEAR-OIL-120ML', price: 30000, sellingPrice: 40000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Air Blade 125/150', 'Lead/SH Mode', 'Vision 2021+', 'SH', 'Vario', 'Click', 'PCX'] },
    { name: 'Nước làm mát Honda chính hãng (1L)', sku: '08CLAG010S0', price: 80000, sellingPrice: 100000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Air Blade 125/150', 'Winner/Winner X', 'Lead/SH Mode', 'SH', 'Vario', 'PCX'] },
    { name: 'Ắc quy GS GTZ5S-E (Wave, Future)', sku: '31500-KWW-A01', price: 250000, sellingPrice: 310000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Wave Alpha', 'Wave RSX', 'Future 125', 'Future Neo', 'Future X'] },
    { name: 'Ắc quy GS GTZ6V (Xe ga)', sku: '31500-KZR-602', price: 320000, sellingPrice: 380000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Air Blade 125/150', 'Lead/SH Mode', 'Vision 2021+', 'SH', 'Vario', 'Click', 'PCX'] },
    { name: 'Bugi NGK CPR6EA-9 (Wave RSX, Future 125)', sku: '31916-KRM-841', price: 45000, sellingPrice: 65000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Wave RSX', 'Future 125', 'Future Neo', 'Future X'] },
    { name: 'Bugi NGK MR8K-9 (Air Blade 125/150)', sku: '31926-K12-V01', price: 90000, sellingPrice: 120000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Air Blade 125/150'] },
    { name: 'Bugi NGK LMAR8L-9 (SH 125/150)', sku: '31908-K59-A71', price: 110000, sellingPrice: 150000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['SH'] },
    { name: 'Bugi NGK CPR8EA-9 (Winner/Winner X)', sku: '31917-K56-N01', price: 55000, sellingPrice: 75000, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Winner/Winner X'] },
    { name: 'Bình ắc quy Vision', sku: '31500-K44-D01', price: 420000, sellingPrice: 499936, category: 'Phụ tùng Tiêu hao & Bảo dưỡng', model: ['Vision 2021+'] },

    // === Phụ tùng Lọc gió & Bôi trơn ===
    { name: 'Lọc gió (Wave Alpha 110, RSX 110)', sku: '17210-KWW-640', price: 60000, sellingPrice: 80000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Wave Alpha', 'Wave RSX'] },
    { name: 'Lọc gió (Future 125, Future X, Neo)', sku: '17210-KTL-740', price: 75000, sellingPrice: 95000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Future 125', 'Future Neo', 'Future X'] },
    { name: 'Lọc gió (Air Blade 125/150)', sku: '17210-K12-900', price: 120000, sellingPrice: 150000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Air Blade 125/150'] },
    { name: 'Lọc gió (Winner/Winner X)', sku: '17210-K56-N00', price: 90000, sellingPrice: 115000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Winner/Winner X'] },
    { name: 'Lọc gió (Lead 125/SH Mode)', sku: '17210-K1N-V00', price: 130000, sellingPrice: 165000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Lead/SH Mode'] },
    { name: 'Lọc gió (Vision 2021+)', sku: '17210-K2C-V00', price: 110000, sellingPrice: 140000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Vision 2021+'] },
    { name: 'Lọc gió (SH 125/150i)', sku: '17210-K59-A70', price: 180000, sellingPrice: 220000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['SH'] },
    { name: 'Lọc gió (Vario/Click/PCX)', sku: '17210-K59-A70', price: 140000, sellingPrice: 180000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Vario', 'Click', 'PCX'] },
    { name: 'Lọc nhớt (Lưới lọc) (Wave, Future)', sku: '15421-KSP-910', price: 25000, sellingPrice: 35000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Wave Alpha', 'Wave RSX', 'Future 125', 'Future Neo', 'Future X'] },
    { name: 'Lọc nhớt (Lưới lọc) (Xe ga)', sku: '15421-KPL-900', price: 30000, sellingPrice: 45000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Air Blade 125/150', 'Lead/SH Mode', 'Vision 2021+', 'SH'] },
    { name: 'Lọc nhớt (Lõi lọc giấy) (Winner/Winner X)', sku: '15412-KSP-910', price: 45000, sellingPrice: 60000, category: 'Phụ tùng Lọc gió & Bôi trơn', model: ['Winner/Winner X'] },

    // === Phụ tùng Hệ thống truyền động (NSD, Dây curoa, Bi nồi) ===
    { name: 'Nhông sên dĩa (Wave RSX, Future 125)', sku: '06406-KTL-750', price: 290000, sellingPrice: 360000, category: 'Phụ tùng Hệ thống truyền động', model: ['Wave RSX', 'Future 125'] },
    { name: 'Nhông sên dĩa (Winner/Winner X)', sku: '06406-K56-V01', price: 450000, sellingPrice: 550000, category: 'Phụ tùng Hệ thống truyền động', model: ['Winner/Winner X'] },
    { name: 'Nhông sên dĩa (Wave Alpha 110)', sku: '06406-KWW-640', price: 250000, sellingPrice: 310000, category: 'Phụ tùng Hệ thống truyền động', model: ['Wave Alpha'] },
    { name: 'Dây curoa (Air Blade 125)', sku: '23100-KZR-601', price: 380000, sellingPrice: 450000, category: 'Phụ tùng Hệ thống truyền động', model: ['Air Blade 125/150'] },
    { name: 'Dây curoa (Air Blade 150)', sku: '23100-K0S-V01', price: 420000, sellingPrice: 500000, category: 'Phụ tùng Hệ thống truyền động', model: ['Air Blade 125/150'] },
    { name: 'Dây curoa (Lead 125/SH Mode)', sku: '23100-K1N-V01', price: 400000, sellingPrice: 480000, category: 'Phụ tùng Hệ thống truyền động', model: ['Lead/SH Mode'] },
    { name: 'Dây curoa (Vision 110)', sku: '23100-K44-V01', price: 350000, sellingPrice: 420000, category: 'Phụ tùng Hệ thống truyền động', model: ['Vision 2021+'] },
    { name: 'Dây curoa (SH 125/150i)', sku: '23100-K59-A71', price: 550000, sellingPrice: 650000, category: 'Phụ tùng Hệ thống truyền động', model: ['SH'] },
    { name: 'Dây curoa Bando (Vario/Click/AB)', sku: '23100-K35-V01', price: 350000, sellingPrice: 425000, category: 'Phụ tùng Hệ thống truyền động', model: ['Vario', 'Click', 'Air Blade 125/150'] },
    { name: 'Bộ bi nồi (Air Blade 125)', sku: '22123-KZR-600', price: 150000, sellingPrice: 190000, category: 'Phụ tùng Hệ thống truyền động', model: ['Air Blade 125/150'] },
    { name: 'Bộ bi nồi (Lead 125/SH Mode)', sku: '22123-K1N-V00', price: 160000, sellingPrice: 200000, category: 'Phụ tùng Hệ thống truyền động', model: ['Lead/SH Mode'] },
    { name: 'Bộ bi nồi (Vision 110)', sku: '22123-K44-V00', price: 140000, sellingPrice: 180000, category: 'Phụ tùng Hệ thống truyền động', model: ['Vision 2021+'] },
    { name: 'Bộ bi nồi (SH 125/150i)', sku: '22123-K59-A70', price: 220000, sellingPrice: 280000, category: 'Phụ tùng Hệ thống truyền động', model: ['SH'] },
    { name: 'Bố 3 càng (AB 125, Vision)', sku: '22535-K12-900', price: 350000, sellingPrice: 420000, category: 'Phụ tùng Hệ thống truyền động', model: ['Air Blade 125/150', 'Vision 2021+'] },
    { name: 'Bố 3 càng (Lead 125, SH Mode)', sku: '22535-K1N-V00', price: 380000, sellingPrice: 450000, category: 'Phụ tùng Hệ thống truyền động', model: ['Lead/SH Mode'] },
    { name: 'Nắp hộp xích trên Future', sku: '40510-KFL-890ZA', price: 170000, sellingPrice: 212258, category: 'Phụ tùng Hệ thống truyền động', model: ['Future 125', 'Future Neo', 'Future X'] },
    { name: 'Chén bi (Vario/Click/AB)', sku: '22110-K35-V00', price: 95000, sellingPrice: 120432, category: 'Phụ tùng Hệ thống truyền động', model: ['Vario', 'Click', 'Air Blade 125/150'] },
    { name: 'Cánh quạt (Vario/Click/AB)', sku: '22102-K35-V00', price: 85000, sellingPrice: 104272, category: 'Phụ tùng Hệ thống truyền động', model: ['Vario', 'Click', 'Air Blade 125/150'] },

    // === Phụ tùng Hệ thống phanh (Heo dầu, Má phanh, Đĩa phanh) ===
    { name: 'Má phanh đĩa trước (Wave RSX, Future)', sku: '06455-KWB-601', price: 80000, sellingPrice: 110000, category: 'Phụ tùng Hệ thống phanh', model: ['Wave RSX', 'Future 125', 'Future Neo', 'Future X'] },
    { name: 'Má phanh đĩa trước (Air Blade, Lead)', sku: '06455-KVG-V01', price: 90000, sellingPrice: 125000, category: 'Phụ tùng Hệ thống phanh', model: ['Air Blade 125/150', 'Lead/SH Mode'] },
    { name: 'Má phanh đĩa trước (Winner/SH)', sku: '06455-K56-N01', price: 120000, sellingPrice: 160000, category: 'Phụ tùng Hệ thống phanh', model: ['Winner/Winner X', 'SH'] },
    { name: 'Má phanh đĩa trước (Vision CBS)', sku: '06455-K81-N21', price: 85000, sellingPrice: 115000, category: 'Phụ tùng Hệ thống phanh', model: ['Vision 2021+'] },
    { name: 'Bố thắng đĩa trước (Vario/Click/SH/SH Mode/PCX)', sku: '06455-K59-A71', price: 210000, sellingPrice: 260344, category: 'Phụ tùng Hệ thống phanh', model: ['Vario', 'Click', 'SH', 'SH Mode', 'PCX'] },
    { name: 'Má phanh đĩa sau (Winner/Winner X, SH)', sku: '06435-K56-N01', price: 110000, sellingPrice: 150000, category: 'Phụ tùng Hệ thống phanh', model: ['Winner/Winner X', 'SH'] },
    { name: 'Má phanh sau (đùm) (Wave, Future, Vision)', sku: '06430-KFM-900', price: 70000, sellingPrice: 95000, category: 'Phụ tùng Hệ thống phanh', model: ['Wave Alpha', 'Wave RSX', 'Future 125', 'Vision 2021+'] },
    { name: 'Bố thắng đùm sau (Vario/Click)', sku: '43151-K59-A71', price: 140000, sellingPrice: 171940, category: 'Phụ tùng Hệ thống phanh', model: ['Vario', 'Click'] },
    { name: 'Đĩa phanh trước (Wave RSX, Future 125)', sku: '45251-KTL-750', price: 300000, sellingPrice: 380000, category: 'Phụ tùng Hệ thống phanh', model: ['Wave RSX', 'Future 125'] },
    { name: 'Đĩa phanh trước (Winner/Winner X)', sku: '45251-K56-N01', price: 550000, sellingPrice: 650000, category: 'Phụ tùng Hệ thống phanh', model: ['Winner/Winner X'] },
    { name: 'Đĩa phanh trước (Air Blade)', sku: '45251-KVG-901', price: 400000, sellingPrice: 480000, category: 'Phụ tùng Hệ thống phanh', model: ['Air Blade 125/150'] },
    { name: 'Đĩa phanh trước (Vario/Click)', sku: '45251-K59-A71', price: 380000, sellingPrice: 460000, category: 'Phụ tùng Hệ thống phanh', model: ['Vario', 'Click', 'PCX'] },
    { name: 'Cụm ngàm phanh trước bên trái Vario', sku: '45150-K2S-N01', price: 1450000, sellingPrice: 1879696, category: 'Phụ tùng Hệ thống phanh', model: ['Vario', 'Click'] },

    // === Phụ tùng Động cơ & Đầu bò ===
    { name: 'Gioăng đầu xylanh Future', sku: '12251-KFL-851', price: 25000, sellingPrice: 31912, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Future 125', 'Future Neo', 'Future X'] },
    { name: 'Nắp máy trái Future', sku: '11341-KYZ-900', price: 250000, sellingPrice: 309991, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Future 125'] },
    { name: 'Piston + bạc (Wave Alpha 110)', sku: '13101-KWW-740', price: 220000, sellingPrice: 280000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Wave Alpha'] },
    { name: 'Piston + bạc (Winner/Winner X)', sku: '13101-K56-N00', price: 350000, sellingPrice: 420000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Winner/Winner X'] },
    { name: 'Xupap hút (Wave, Future)', sku: '14711-KWW-740', price: 90000, sellingPrice: 120000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Xupap xả (Wave, Future)', sku: '14721-KWW-740', price: 80000, sellingPrice: 110000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Cây cam (Wave Alpha 110)', sku: '14100-KWW-640', price: 300000, sellingPrice: 380000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Wave Alpha'] },
    { name: 'Cây cam (Air Blade 125)', sku: '14100-KZR-600', price: 450000, sellingPrice: 550000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Air Blade 125/150'] },
    { name: 'Két nước Vario/Click', sku: '19010-K59-A11', price: 550000, sellingPrice: 680000, category: 'Phụ tùng Động cơ & Đầu bò', model: ['Vario', 'Click'] },

    // === Phụ tùng Hệ thống điện (IC, Sạc, Mobin, Khóa) ===
    { name: 'Cụm khóa điện Vision', sku: '35100-K2C-V01', price: 680000, sellingPrice: 844876, category: 'Phụ tùng Hệ thống điện', model: ['Vision 2021+'] },
    { name: 'Cụm khóa Smartkey SH 125/150i', sku: '35111-K0R-V00', price: 900000, sellingPrice: 1100000, category: 'Phụ tùng Hệ thống điện', model: ['SH'] },
    { name: 'IC/ECM (Wave RSX Fi)', sku: '38770-K03-H11', price: 700000, sellingPrice: 850000, category: 'Phụ tùng Hệ thống điện', model: ['Wave RSX'] },
    { name: 'IC/ECM (Air Blade 125)', sku: '38770-KZR-601', price: 1200000, sellingPrice: 1500000, category: 'Phụ tùng Hệ thống điện', model: ['Air Blade 125/150'] },
    { name: 'IC/ECM (Winner X)', sku: '38770-K56-V02', price: 1100000, sellingPrice: 1350000, category: 'Phụ tùng Hệ thống điện', model: ['Winner/Winner X'] },
    { name: 'Sạc (Wave, Future)', sku: '31600-KWW-641', price: 150000, sellingPrice: 200000, category: 'Phụ tùng Hệ thống điện', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Sạc (Air Blade 125, SH)', sku: '31600-KZR-601', price: 400000, sellingPrice: 500000, category: 'Phụ tùng Hệ thống điện', model: ['Air Blade 125/150', 'SH'] },
    { name: 'Mobin sườn (Wave, Future)', sku: '30510-KWW-641', price: 180000, sellingPrice: 230000, category: 'Phụ tùng Hệ thống điện', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Cảm biến nhiệt độ ECT (Xe ga)', sku: '37870-KZR-601', price: 130000, sellingPrice: 170000, category: 'Phụ tùng Hệ thống điện', model: ['Air Blade 125/150', 'Lead/SH Mode', 'Vision 2021+', 'SH'] },
    { name: 'Dây điện chính Vision', sku: '32100-K2C-D01', price: 2100000, sellingPrice: 2606984, category: 'Phụ tùng Hệ thống điện', model: ['Vision 2021+'] },
    { name: 'Cụm đèn pha LED Air Blade 125/150', sku: '33110-K1F-V11', price: 1500000, sellingPrice: 1750000, category: 'Phụ tùng Hệ thống điện', model: ['Air Blade 125/150'] },
    { name: 'Cùm công tắc trái Winner X (ABS)', sku: '35200-K56-V51', price: 380000, sellingPrice: 450000, category: 'Phụ tùng Hệ thống điện', model: ['Winner/Winner X'] },
    { name: 'Cụm đèn hậu Vario/Click', sku: '33701-K59-A71', price: 600000, sellingPrice: 757949, category: 'Phụ tùng Hệ thống điện', model: ['Vario', 'Click'] },

    // === Phụ tùng Dàn nhựa & Khung sườn ===
    { name: 'Tem sản phẩm Vision', sku: '87501-K2C-V91', price: 8000, sellingPrice: 11231, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp xi nhan trước Vision (Đỏ)', sku: 'NEXAC-K44-WKC03', price: 130000, sellingPrice: 169539, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp xi nhan trước Vision (Chrome)', sku: 'NEXAC-K44-WKC02', price: 130000, sellingPrice: 169539, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp ống xả Vision (Carbon)', sku: 'NEXAC-K44-MFC04', price: 200000, sellingPrice: 251167, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp đèn pha Vision (Đỏ)', sku: 'NEXAC-K44-HLC03', price: 120000, sellingPrice: 150702, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp thân trước Vision (Chrome)', sku: 'NEXAC-K44-FRC02', price: 380000, sellingPrice: 470938, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Thảm lót chân Vision (Carbon)', sku: 'NEXAC-K44-FLP04', price: 480000, sellingPrice: 596522, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp bầu lọc gió Vision (Carbon)', sku: 'NEXAC-K44-ESP04', price: 200000, sellingPrice: 251167, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp chân bùn sau Vision (Đỏ mờ)', sku: 'UNIAC-K44-RFC06', price: 60000, sellingPrice: 74827, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp két tản nhiệt Vision (Carbon)', sku: 'UNIAC-K44-RDC04', price: 75000, sellingPrice: 92095, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Ốp pô Vision (Đỏ mờ)', sku: 'UNIAC-K44-MFC06', price: 130000, sellingPrice: 161165, category: 'Phụ tùng Dàn nhựa & Khung sườn', model: ['Vision 2021+'] },
    { name: 'Dàn áo Air Blade 150 (Đen mờ)', sku: '83500-K1F-V10ZA', price: 4200000, sellingPrice: 4800000, category: 'Dàn nhựa & Khung sườn', model: ['Air Blade 125/150'] },
    { name: 'Mặt nạ trước Vario/Click (Đỏ)', sku: '64301-K59-A70ZC', price: 250000, sellingPrice: 310000, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp sườn sau SH Mode (Trắng)', sku: '83600-K1N-V00ZC', price: 450000, sellingPrice: 550000, category: 'Dàn nhựa & Khung sườn', model: ['Lead/SH Mode'] },
    { name: 'Yên xe Wave Alpha', sku: '77200-KWW-640', price: 280000, sellingPrice: 350000, category: 'Dàn nhựa & Khung sườn', model: ['Wave Alpha'] },
    { name: 'Gác chân sau Future 125', sku: '50715-K73-T60', price: 180000, sellingPrice: 220000, category: 'Dàn nhựa & Khung sườn', model: ['Future 125'] },
    { name: 'Bộ mỏ bùn Vario', sku: '57110-K2S-N12', price: 2600000, sellingPrice: 3285289, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Tem PGM-FI Future', sku: '86646-K73-VE0ZC', price: 14000, sellingPrice: 18235, category: 'Dàn nhựa & Khung sườn', model: ['Future 125', 'Future Neo', 'Future X'] },
    { name: 'Gù tay lái phải (Vario/Click/AB/PCX/SH/Winner)', sku: '53166-K46-N20', price: 40000, sellingPrice: 50229, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click', 'Air Blade 125/150', 'PCX', 'SH', 'Winner/Winner X'] },
    { name: 'Gù tay lái trái (Vario/Click/AB/PCX/SH/Winner)', sku: '53165-K46-N20', price: 40000, sellingPrice: 50229, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click', 'Air Blade 125/150', 'PCX', 'SH', 'Winner/Winner X'] },
    { name: 'Móc treo đồ (Vario/Click)', sku: '81250-K59-A70', price: 35000, sellingPrice: 42973, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Nẹp sườn trái (Vario/Click)', sku: '64308-K59-A70', price: 20000, sellingPrice: 25117, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Nẹp sườn phải (Vario/Click)', sku: '64309-K59-A70', price: 20000, sellingPrice: 25117, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp pô (Vario/Click)', sku: '18318-K59-A70', price: 145000, sellingPrice: 181254, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp đồng hồ trước (Vario/Click)', sku: '81131-K59-A70', price: 80000, sellingPrice: 101906, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp sườn trái (Vario/Click)', sku: '83750-K59-A70ZA', price: 210000, sellingPrice: 260344, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Ốp sườn phải (Vario/Click)', sku: '83650-K59-A70ZA', price: 210000, sellingPrice: 260344, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Yếm trái (Vario/Click)', sku: '64340-K59-A70ZB', price: 140000, sellingPrice: 171940, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Yếm phải (Vario/Click)', sku: '64335-K59-A70ZB', price: 140000, sellingPrice: 171940, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },
    { name: 'Dè trước (Vario/Click)', sku: '61100-K59-A70ZB', price: 250000, sellingPrice: 310078, category: 'Dàn nhựa & Khung sườn', model: ['Vario', 'Click'] },

    // === Bánh xe & Lốp ===
    { name: 'Lốp trước IRC (Wave, Future)', sku: '44711-KWW-641', price: 250000, sellingPrice: 320000, category: 'Bánh xe & Lốp', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Lốp sau IRC (Wave, Future)', sku: '42711-KWW-641', price: 300000, sellingPrice: 380000, category: 'Bánh xe & Lốp', model: ['Wave Alpha', 'Wave RSX', 'Future 125'] },
    { name: 'Lốp trước IRC (Air Blade, Vision)', sku: '44711-KVG-901', price: 350000, sellingPrice: 430000, category: 'Bánh xe & Lốp', model: ['Air Blade 125/150', 'Vision 2021+'] },
    { name: 'Lốp sau IRC (Air Blade, Vision)', sku: '42711-KVG-901', price: 400000, sellingPrice: 480000, category: 'Bánh xe & Lốp', model: ['Air Blade 125/150', 'Vision 2021+'] },
    { name: 'Lốp trước IRC (Winner/Winner X)', sku: '44711-K56-N01', price: 450000, sellingPrice: 550000, category: 'Bánh xe & Lốp', model: ['Winner/Winner X'] },
    { name: 'Mâm (vành) trước Winner X', sku: '44650-K56-V50', price: 1300000, sellingPrice: 1550000, category: 'Bánh xe & Lốp', model: ['Winner/Winner X'] },
    { name: 'Mâm (vành) sau SH 150i ABS', sku: '42650-K0R-V00', price: 2200000, sellingPrice: 2600000, category: 'Bánh xe & Lốp', model: ['SH'] },

    // === Linh kiện nhỏ & Bu lông, Ốc vít ===
    { name: 'Vít 5x12', sku: '938910501207', price: 3000, sellingPrice: 4628, category: 'Linh kiện nhỏ', model: ['Future 125', 'Wave Alpha', 'Vision 2021+', 'Dream'] },
    { name: 'Bu lông 6x20', sku: '90118KY1000', price: 5000, sellingPrice: 7739, category: 'Linh kiện nhỏ', model: ['Future 125', 'Wave Alpha', 'Dream'] },
    { name: 'Vít có đệm 5-10', sku: '93891-050-1007', price: 3500, sellingPrice: 4628, category: 'Linh kiện nhỏ', model: ['Vision 2021+'] },
    { name: 'Vít 4x20', sku: '93891-040-2007', price: 3000, sellingPrice: 4628, category: 'Linh kiện nhỏ', model: ['Future 125', 'Wave Alpha', 'Dream'] },
];

const LOOKUP_ITEMS_PER_PAGE = 50;
const INVENTORY_ITEMS_PER_PAGE = 15;
const CATALOG_ITEMS_PER_PAGE = 12;
const HISTORY_ITEMS_PER_PAGE = 25;

// Fix: Add helper function to generate deterministic colors for product categories
// --- Category Color Helper ---
const categoryColors = [
    'border-t-red-500',
    'border-t-orange-500',
    'border-t-amber-500',
    'border-t-yellow-500',
    'border-t-lime-500',
    'border-t-green-500',
    'border-t-emerald-500',
    'border-t-teal-500',
    'border-t-cyan-500',
    'border-t-sky-500',
    'border-t-blue-500',
    'border-t-indigo-500',
    'border-t-violet-500',
    'border-t-purple-500',
    'border-t-fuchsia-500',
    'border-t-pink-500',
    'border-t-rose-500',
];

const getCategoryColor = (category?: string): string => {
    if (!category) {
        return 'border-t-slate-400';
    }
    // Simple hash function to get a deterministic color
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % categoryColors.length);
    return categoryColors[index];
};


// --- Modals (re-using from previous implementation, ensure they are here and correct) ---
// PartModal, TransactionModal, HistoryModal, TransferStockModal, CategorySettingsModal
const PartModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (part: Part) => void;
    part: Part | null;
    parts: Part[];
    allCategories: string[];
    onAddCategory: (categoryName: string) => void;
    currentBranchId: string;
}> = ({ isOpen, onClose, onSave, part, parts, allCategories, onAddCategory, currentBranchId }) => {
    const [formData, setFormData] = useState<Omit<Part, 'id'>>(() =>
        part ? { ...part } : { name: '', sku: '', stock: {}, price: 0, sellingPrice: 0, category: '' }
    );
    const [userModifiedSku, setUserModifiedSku] = useState(false);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (part) { // Editing existing part or creating from reference
                setFormData({ ...part });
                // If part has a real ID, it's an edit. If ID is falsy (''), it's from reference.
                // In both cases, the SKU is considered user-defined.
                setUserModifiedSku(true); 
            } else { // Adding brand new part from scratch
                setFormData({ name: '', sku: '', stock: {}, price: 0, sellingPrice: 0, category: '' });
                setUserModifiedSku(false);
            }
             setIsAddingNewCategory(false);
             setNewCategoryName('');
        }
    }, [part, isOpen]);

    const generateSkuFromName = (name: string): string => {
        if (!name || name.trim() === '') return '';

        const cleanedName = name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D")
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .trim()
            .toUpperCase();

        const words = cleanedName.split(/\s+/).filter(Boolean);
        if (words.length === 0) return '';
        
        const initials = words.slice(0, 3).map(word => word[0]).join('');
        const randomPart = Math.floor(1000 + Math.random() * 9000);

        return `${initials}-${randomPart}`;
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
    
        if (name === 'sku') {
            setUserModifiedSku(true);
        }
    
        const isNumber = type === 'number';
        const processedValue = isNumber ? parseFloat(value) || 0 : value;
    
        if (name === 'name' && !userModifiedSku) {
            const generatedSku = generateSkuFromName(value as string);
            setFormData(prev => ({
                ...prev,
                name: value as string,
                sku: generatedSku
            }));
        } else if (name === 'quantity') {
            setFormData(prev => ({
                ...prev,
                stock: {
                    ...prev.stock,
                    [currentBranchId]: processedValue as number,
                }
            }));
        } else if (name === 'price') {
            const purchasePrice = processedValue as number;
            setFormData(prev => ({
                ...prev,
                price: purchasePrice,
                sellingPrice: Math.round((purchasePrice * 1.3) / 1000) * 1000 // Suggest selling price with ~30% margin
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: processedValue
            }));
        }
    };
    
    const handleAddNewCategory = () => {
        const trimmedCategory = newCategoryName.trim();
        if (trimmedCategory && !allCategories.includes(trimmedCategory)) {
            onAddCategory(trimmedCategory);
            setFormData(prev => ({...prev, category: trimmedCategory}));
        }
        setNewCategoryName('');
        setIsAddingNewCategory(false);
    };

    const buildPartData = (): Part => {
        let finalSku = formData.sku;
        if (!finalSku && formData.name) {
            finalSku = generateSkuFromName(formData.name);
        }
        return {
            id: part?.id || `P${String(Math.floor(Math.random() * 9000) + 1000)}`,
            ...formData,
            sku: finalSku,
        };
    };

    const handleJustSave = () => {
        const finalPart = buildPartData();
        onSave(finalPart);
    };

    const handleSaveAndClose = () => {
        const finalPart = buildPartData();
        onSave(finalPart);
        onClose();
    };

    if (!isOpen) return null;
    
    const currentStock = formData.stock?.[currentBranchId] ?? 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={(e) => e.preventDefault()}>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">{part?.id ? 'Chỉnh sửa Phụ tùng' : 'Thêm Phụ tùng mới'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="part-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tên phụ tùng</label>
                                <input id="part-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Bugi NGK Iridium" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required />
                            </div>
                            <div>
                                <label htmlFor="part-sku" className="block text-sm font-medium text-slate-700 dark:text-slate-300">SKU</label>
                                <input id="part-sku" type="text" name="sku" value={formData.sku} onChange={handleChange} placeholder="Tự động tạo hoặc nhập thủ công" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Danh mục sản phẩm</label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <select
                                        name="category"
                                        value={formData.category || ''}
                                        onChange={handleChange}
                                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                                    >
                                        <option value="">-- Chọn danh mục --</option>
                                        {allCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button type="button" onClick={() => setIsAddingNewCategory(!isAddingNewCategory)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 flex-shrink-0">
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
                                            className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                                            autoFocus
                                        />
                                        <button type="button" onClick={handleAddNewCategory} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700">Lưu</button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="part-quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng tồn kho (Chi nhánh hiện tại)</label>
                                <input id="part-quantity" type="number" name="quantity" value={currentStock} onChange={handleChange} placeholder="0" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="part-price" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Giá nhập</label>
                                    <input id="part-price" type="number" name="price" value={formData.price} onChange={handleChange} placeholder="80000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required />
                                </div>
                                <div>
                                    <label htmlFor="part-sellingPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Giá bán</label>
                                    <input id="part-sellingPrice" type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} placeholder="110000" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" required />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 flex justify-end space-x-3 border-t dark:border-slate-700">
                        <button type="button" onClick={onClose} className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                            Trở về
                        </button>
                        {part?.id ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleJustSave}
                                    className="bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700"
                                >
                                    Lưu thay đổi
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAndClose}
                                    className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700"
                                >
                                    Lưu & Đóng
                                </button>
                            </>
                        ) : (
                             <button
                                type="button"
                                onClick={handleSaveAndClose}
                                className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700"
                            >
                                Lưu Phụ tùng
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

const TransactionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<InventoryTransaction, 'id'|'date'|'totalPrice'>) => void;
    parts: Part[];
    type: 'Nhập kho' | 'Xuất kho';
    currentBranchId: string;
}> = ({ isOpen, onClose, onSave, parts, type, currentBranchId }) => {
    const [partId, setPartId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [unitPrice, setUnitPrice] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (isOpen) {
            setPartId('');
            setQuantity(1);
            setNotes('');
            setUnitPrice(undefined);
        }
    }, [isOpen]);
    
    const selectedPart = parts.find(p => p.id === partId);
    const maxQuantity = type === 'Xuất kho' ? selectedPart?.stock[currentBranchId] || 0 : Infinity;

    const handleSubmit = () => {
        if (!partId || quantity <= 0 || (type === 'Xuất kho' && quantity > maxQuantity)) return;
        
        const part = parts.find(p => p.id === partId);
        if (!part) return;

        onSave({
            partId,
            partName: part.name,
            quantity,
            notes,
            unitPrice,
            type,
            branchId: currentBranchId,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">{type === 'Nhập kho' ? 'Tạo Phiếu Nhập Kho' : 'Tạo Phiếu Xuất Kho'}</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phụ tùng</label>
                            <select value={partId} onChange={e => {
                                setPartId(e.target.value);
                                const selected = parts.find(p => p.id === e.target.value);
                                if (type === 'Nhập kho' && selected) {
                                    setUnitPrice(selected.price);
                                }
                            }} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100">
                                <option value="">-- Chọn phụ tùng --</option>
                                {parts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) - Tồn: {p.stock[currentBranchId] || 0}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" max={type === 'Xuất kho' ? maxQuantity : undefined} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                            {type === 'Xuất kho' && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tồn kho hiện tại: {maxQuantity}</p>}
                        </div>
                        {type === 'Nhập kho' && (
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đơn giá nhập</label>
                                <input type="number" value={unitPrice ?? ''} onChange={e => setUnitPrice(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ghi chú</label>
                            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Nhập hàng từ nhà cung cấp A" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"/>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 flex justify-end space-x-3 border-t dark:border-slate-700">
                    <button type="button" onClick={onClose} className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                        <ArrowUturnLeftIcon className="w-5 h-5" />
                        Trở về
                    </button>
                    <button type="button" onClick={handleSubmit} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700">Lưu</button>
                </div>
            </div>
        </div>
    )
}

const HistoryModal: React.FC<{
    part: Part | null;
    transactions: InventoryTransaction[];
    onClose: () => void;
    storeSettings: StoreSettings;
}> = ({ part, transactions, onClose, storeSettings }) => {
    const partTransactions = useMemo(() => {
        if (!part) return [];
        return transactions.filter(t => t.partId === part.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [part, transactions]);

    if (!part) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Lịch sử giao dịch: {part.name}</h2>
                </div>
                <div className="p-6 overflow-y-auto">
                    {partTransactions.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400">Không có giao dịch nào cho phụ tùng này.</p>
                    ) : (
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                            <tr>
                                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Ngày</th>
                                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Loại</th>
                                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Số lượng</th>
                                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Chi nhánh</th>
                                <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partTransactions.map(tx => (
                                <tr key={tx.id} className="border-b dark:border-slate-700">
                                    <td className="p-2 text-slate-800 dark:text-slate-200">{tx.date}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tx.type === 'Nhập kho' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{tx.quantity}</td>
                                    <td className="p-2 text-slate-800 dark:text-slate-200">{storeSettings.branches.find(b => b.id === tx.branchId)?.name || tx.branchId}</td>
                                    <td className="p-2 text-sm text-slate-600 dark:text-slate-400">{tx.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    )}
                </div>
                 <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 mt-auto border-t dark:border-slate-700">
                    <button type="button" onClick={onClose} className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    )
}

const TransferStockModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (transfer: { partId: string; fromBranchId: string; toBranchId: string; quantity: number; notes: string }) => void;
    parts: Part[];
    branches: { id: string; name: string }[];
    currentBranchId: string;
}> = ({ isOpen, onClose, onSave, parts, branches, currentBranchId }) => {
    const [partId, setPartId] = useState('');
    const [fromBranchId, setFromBranchId] = useState(currentBranchId);
    const [toBranchId, setToBranchId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    
    useEffect(() => {
        if (isOpen) {
            setPartId('');
            setFromBranchId(currentBranchId);
            setToBranchId('');
            setQuantity(1);
            setNotes('');
        }
    }, [isOpen, currentBranchId]);

    const selectedPart = parts.find(p => p.id === partId);
    const maxQuantity = selectedPart?.stock[fromBranchId] || 0;
    const isFormInvalid = !partId || !fromBranchId || !toBranchId || fromBranchId === toBranchId || quantity <= 0 || quantity > maxQuantity;

    const handleSubmit = () => {
        if (isFormInvalid) return;
        onSave({ partId, fromBranchId, toBranchId, quantity, notes });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
                 <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Tạo Phiếu Chuyển Kho</h2>
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phụ tùng</label>
                            <select value={partId} onChange={e => setPartId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100">
                                <option value="">-- Chọn phụ tùng --</option>
                                {parts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                        </div>

                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Từ chi nhánh</label>
                                <select value={fromBranchId} onChange={e => setFromBranchId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100">
                                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Đến chi nhánh</label>
                                <select value={toBranchId} onChange={e => setToBranchId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" disabled={!fromBranchId}>
                                    <option value="">-- Chọn --</option>
                                    {branches.filter(b => b.id !== fromBranchId).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng chuyển</label>
                            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" max={maxQuantity} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tồn kho tại chi nhánh nguồn: {maxQuantity}</p>
                            {quantity > maxQuantity && <p className="text-red-500 text-xs mt-1">Số lượng vượt quá tồn kho!</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ghi chú</label>
                            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Điều chuyển hàng cuối tháng" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"/>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 flex justify-end space-x-3 border-t dark:border-slate-700">
                    <button type="button" onClick={onClose} className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                        <ArrowUturnLeftIcon className="w-5 h-5" />
                        Trở về
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={isFormInvalid} className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed">
                        Tạo phiếu
                    </button>
                </div>
            </div>
        </div>
    )
}

const CategorySettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    onAdd: (name: string) => void;
    onEdit: (oldName: string, newName: string) => void;
    onDelete: (name: string) => void;
}> = ({ isOpen, onClose, categories, onAdd, onEdit, onDelete }) => {
    const [editingCategories, setEditingCategories] = useState<string[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setEditingCategories([...categories]);
            setNewCategoryName('');
        }
    }, [isOpen, categories]);

    const handleNameChange = (index: number, newName: string) => {
        const updated = [...editingCategories];
        updated[index] = newName;
        setEditingCategories(updated);
    };

    const handleSaveChanges = () => {
        // Find renamed categories
        for (let i = 0; i < categories.length; i++) {
            if (categories[i] !== editingCategories[i]) {
                onEdit(categories[i], editingCategories[i]);
            }
        }
        onClose();
    };
    
    const handleAddNewCategory = () => {
        const trimmedName = newCategoryName.trim();
        if (trimmedName && !editingCategories.includes(trimmedName)) {
            onAdd(trimmedName);
            setEditingCategories(prev => [...prev, trimmedName]);
            setNewCategoryName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b dark:border-slate-700">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cài đặt Danh mục sản phẩm</h2>
                </div>
                <div className="p-6 overflow-y-auto space-y-3">
                    {editingCategories.map((cat, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={cat}
                                onChange={e => handleNameChange(index, e.target.value)}
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${categories[index]}"? Các sản phẩm thuộc danh mục này sẽ được chuyển về "Chưa phân loại".`)) {
                                        onDelete(categories[index]);
                                    }
                                }}
                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md flex-shrink-0"
                                title="Xóa danh mục"
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                    <div className="pt-4 border-t dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Thêm danh mục mới</p>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                placeholder="Tên danh mục mới..."
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                                onKeyDown={e => { if (e.key === 'Enter') handleAddNewCategory(); }}
                            />
                            <button type="button" onClick={handleAddNewCategory} className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 flex-shrink-0">Thêm</button>
                        </div>
                    </div>
                </div>
                 <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 mt-auto border-t dark:border-slate-700 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
                        <ArrowUturnLeftIcon className="w-5 h-5" />
                        Trở về
                    </button>
                    <button type="button" onClick={handleSaveChanges} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
};

// Fix: Add UploadModal component to handle CSV file imports.
const UploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    setParts: React.Dispatch<React.SetStateAction<Part[]>>;
    currentBranchId: string;
}> = ({ isOpen, onClose, setParts, currentBranchId }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleImport = () => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                setError('Could not read file.');
                return;
            }

            try {
                const rows = text.split('\n').slice(1); // Skip header row
                const newParts: Part[] = rows.map(row => {
                    const columns = row.split(',');
                    if (columns.length < 6) return null;
                    const [name, sku, category, price, sellingPrice, stock] = columns;
                    // FIX: Explicitly type the new part object to ensure type compatibility with the filter's type predicate. This resolves the error where the inferred type from the object literal (with a required 'category') was not compatible with the 'Part' type (with an optional 'category') as required by the type guard `p is Part`.
                    const part: Part = {
                        id: `P${Date.now()}-${sku}`,
                        name: name.trim(),
                        sku: sku.trim(),
                        category: category.trim(),
                        price: parseFloat(price),
                        sellingPrice: parseFloat(sellingPrice),
                        stock: { [currentBranchId]: parseInt(stock) || 0 }
                    };
                    return part;
                }).filter((p): p is Part => p !== null);

                setParts(prevParts => {
                    const updatedParts = [...prevParts];
                    newParts.forEach(newPart => {
                        const existingIndex = updatedParts.findIndex(p => p.sku === newPart.sku);
                        if (existingIndex !== -1) {
                            // Update existing part
                            updatedParts[existingIndex] = {
                                ...updatedParts[existingIndex],
                                ...newPart,
                                id: updatedParts[existingIndex].id, // keep original id
                                stock: {
                                    ...updatedParts[existingIndex].stock,
                                    ...newPart.stock
                                }
                            };
                        } else {
                            // Add new part
                            updatedParts.push(newPart);
                        }
                    });
                    return updatedParts;
                });

                onClose();

            } catch (err) {
                setError('Error parsing CSV file. Please check the format.');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tải lên danh sách sản phẩm</h3>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Tải lên tệp CSV với các cột: `name`, `sku`, `category`, `price`, `sellingPrice`, `stock`.
                    </p>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"/>
                    {file && <p className="text-sm text-slate-500">Selected file: {file.name}</p>}
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 flex justify-end space-x-3 border-t dark:border-slate-700">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">Hủy</button>
                    <button onClick={handleImport} disabled={!file} className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 disabled:bg-sky-300">Nhập</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
interface InventoryManagerProps {
    currentUser: User;
    parts: Part[];
    setParts: React.Dispatch<React.SetStateAction<Part[]>>;
    transactions: InventoryTransaction[];
    setTransactions: React.Dispatch<React.SetStateAction<InventoryTransaction[]>>;
    currentBranchId: string;
    storeSettings: StoreSettings;
}

type ActiveTab = 'inventory' | 'catalog' | 'lookup' | 'history';

const InventoryManager: React.FC<InventoryManagerProps> = ({ currentUser, parts, setParts, transactions, setTransactions, currentBranchId, storeSettings }) => {
    // General State
    const [activeTab, setActiveTab] = useState<ActiveTab>('inventory');
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'Nhập kho' | 'Xuất kho'>('Nhập kho');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // Tab-specific State
    const [inventorySearch, setInventorySearch] = useState('');
    const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
    const [inventoryPage, setInventoryPage] = useState(1);
    const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set());
    
    const [catalogSearch, setCatalogSearch] = useState('');
    const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('all');
    const [catalogPage, setCatalogPage] = useState(1);

    const [lookupModelFilter, setLookupModelFilter] = useState('all');
    const [lookupPage, setLookupPage] = useState(1);
    
    const [historySearch, setHistorySearch] = useState('');
    const [historyPage, setHistoryPage] = useState(1);

    const allCategories = useMemo(() => Array.from(new Set(parts.map(p => p.category).filter((c): c is string => !!c))).sort(), [parts]);
    const allHondaModels = useMemo(() => Array.from(new Set(hondaPartsData.flatMap(p => p.model))).sort(), []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveActionMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    useEffect(() => {
        // Reset page and selection when filters change
        setInventoryPage(1);
        setSelectedPartIds(new Set());
    }, [inventorySearch, inventoryCategoryFilter, activeTab]);
    
    useEffect(() => {
        setCatalogPage(1);
    }, [catalogSearch, catalogCategoryFilter]);
    
    useEffect(() => {
        setLookupPage(1);
    }, [lookupModelFilter]);

     useEffect(() => {
        setHistoryPage(1);
    }, [historySearch]);

    // --- Handlers ---
    const handleSavePart = (part: Part) => {
        setParts(prev => {
            const exists = prev.some(p => p.id === part.id);
            return exists ? prev.map(p => (p.id === part.id ? part : p)) : [part, ...prev];
        });
    };

    const handleDeletePart = (partId: string) => {
        if (window.confirm("Bạn có chắc muốn xóa phụ tùng này? Hành động này không thể hoàn tác.")) {
            setParts(prev => prev.filter(p => p.id !== partId));
        }
    };
    
    const handleSelectPartFromLookup = (lookupPart: Omit<Part, 'id' | 'stock'>) => {
        const newPartForModal: Part = {
            id: '', // Signal to PartModal that this is a new part
            stock: {},
            ...lookupPart
        };
        setSelectedPart(newPartForModal);
        setIsPartModalOpen(true);
    };

    const handleSaveTransaction = (transaction: Omit<InventoryTransaction, 'id' | 'date' | 'totalPrice'>) => {
        const newTransaction: InventoryTransaction = {
            id: `T-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            totalPrice: (transaction.unitPrice || 0) * transaction.quantity,
            ...transaction
        };
        setTransactions(prev => [newTransaction, ...prev]);

        setParts(prevParts => prevParts.map(p => {
            if (p.id === newTransaction.partId) {
                const newStock = { ...p.stock };
                const currentStock = newStock[newTransaction.branchId] || 0;
                newStock[newTransaction.branchId] = newTransaction.type === 'Nhập kho'
                    ? currentStock + newTransaction.quantity
                    : currentStock - newTransaction.quantity;
                
                const updatedPart = { ...p, stock: newStock };
                if (newTransaction.type === 'Nhập kho' && newTransaction.unitPrice) {
                    updatedPart.price = newTransaction.unitPrice;
                }
                return updatedPart;
            }
            return p;
        }));
        setIsTransactionModalOpen(false);
    };

    const handleSaveTransfer = (transfer: { partId: string; fromBranchId: string; toBranchId: string; quantity: number; notes: string }) => {
        const transferId = `TR-${Date.now()}`;
        
        const part = parts.find(p => p.id === transfer.partId);
        if(!part) return;

        const exportTx: InventoryTransaction = { id: `T-EXP-${transferId}`, type: 'Xuất kho', partId: transfer.partId, partName: part.name, quantity: transfer.quantity, date: new Date().toISOString().split('T')[0], notes: `Chuyển đến ${storeSettings.branches.find(b => b.id === transfer.toBranchId)?.name}. ${transfer.notes}`, unitPrice: part.price, totalPrice: part.price * transfer.quantity, branchId: transfer.fromBranchId, transferId };
        const importTx: InventoryTransaction = { id: `T-IMP-${transferId}`, type: 'Nhập kho', partId: transfer.partId, partName: part.name, quantity: transfer.quantity, date: new Date().toISOString().split('T')[0], notes: `Nhận từ ${storeSettings.branches.find(b => b.id === transfer.fromBranchId)?.name}. ${transfer.notes}`, unitPrice: part.price, totalPrice: part.price * transfer.quantity, branchId: transfer.toBranchId, transferId };

        setTransactions(prev => [exportTx, importTx, ...prev]);

        setParts(prevParts => prevParts.map(p => {
            if (p.id === transfer.partId) {
                const newStock = { ...p.stock };
                newStock[transfer.fromBranchId] = (newStock[transfer.fromBranchId] || 0) - transfer.quantity;
                newStock[transfer.toBranchId] = (newStock[transfer.toBranchId] || 0) + transfer.quantity;
                return { ...p, stock: newStock };
            }
            return p;
        }));
        setIsTransferModalOpen(false);
    };

    const handleCategoryAction = (action: 'add' | 'edit' | 'delete', payload: any) => {
        switch(action) {
            case 'add':
                // The onAdd in PartModal will already handle this via callback
                break;
            case 'edit':
                setParts(prev => prev.map(p => p.category === payload.oldName ? { ...p, category: payload.newName } : p));
                break;
            case 'delete':
                setParts(prev => prev.map(p => p.category === payload.name ? { ...p, category: 'Chưa phân loại' } : p));
                break;
        }
    };

    const handleSelectInventoryPart = (partId: string) => {
        setSelectedPartIds(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(partId)) {
                newSelection.delete(partId);
            } else {
                newSelection.add(partId);
            }
            return newSelection;
        });
    };

    const handleSelectAllInventory = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allVisibleIds = paginatedInventoryParts.map(p => p.id);
            setSelectedPartIds(new Set(allVisibleIds));
        } else {
            setSelectedPartIds(new Set());
        }
    };

    const handleDeleteSelectedParts = () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedPartIds.size} phụ tùng đã chọn không? Hành động này sẽ xóa hoàn toàn chúng khỏi kho và không thể hoàn tác.`)) {
            setParts(prev => prev.filter(p => !selectedPartIds.has(p.id)));
            setSelectedPartIds(new Set());
        }
    };
    
    const TabButton: React.FC<{ tabId: ActiveTab; icon: React.ReactNode; label: string; }> = ({ tabId, icon, label }) => (
        <button onClick={() => setActiveTab(tabId)} className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tabId ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}>
            {icon} {label}
        </button>
    );

    // --- Memos for Filtered Data ---
    const filteredInventoryParts = useMemo(() => {
        return parts.filter(p => {
            const searchMatch = p.name.toLowerCase().includes(inventorySearch.toLowerCase()) || p.sku.toLowerCase().includes(inventorySearch.toLowerCase());
            const categoryMatch = inventoryCategoryFilter === 'all' || p.category === inventoryCategoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [parts, inventorySearch, inventoryCategoryFilter]);

    const paginatedInventoryParts = useMemo(() => {
        const startIndex = (inventoryPage - 1) * INVENTORY_ITEMS_PER_PAGE;
        return filteredInventoryParts.slice(startIndex, startIndex + INVENTORY_ITEMS_PER_PAGE);
    }, [filteredInventoryParts, inventoryPage]);
    
    const areAllInventorySelected = paginatedInventoryParts.length > 0 && paginatedInventoryParts.every(p => selectedPartIds.has(p.id));

    const filteredCatalogParts = useMemo(() => {
        return parts.filter(p => {
            const searchMatch = p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
            const categoryMatch = catalogCategoryFilter === 'all' || p.category === catalogCategoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [parts, catalogSearch, catalogCategoryFilter]);

    const paginatedCatalogParts = useMemo(() => {
        const startIndex = (catalogPage - 1) * CATALOG_ITEMS_PER_PAGE;
        return filteredCatalogParts.slice(startIndex, startIndex + CATALOG_ITEMS_PER_PAGE);
    }, [filteredCatalogParts, catalogPage]);
    
    const filteredLookupParts = useMemo(() => {
        if (lookupModelFilter === 'all') return hondaPartsData;
        return hondaPartsData.filter(p => p.model.includes(lookupModelFilter));
    }, [lookupModelFilter]);
    
    const paginatedLookupParts = useMemo(() => {
         const startIndex = (lookupPage - 1) * LOOKUP_ITEMS_PER_PAGE;
        return filteredLookupParts.slice(startIndex, startIndex + LOOKUP_ITEMS_PER_PAGE);
    }, [filteredLookupParts, lookupPage]);

    const filteredHistory = useMemo(() => {
        return transactions.filter(tx => 
            tx.partName.toLowerCase().includes(historySearch.toLowerCase()) ||
            tx.id.toLowerCase().includes(historySearch.toLowerCase()) ||
            tx.notes.toLowerCase().includes(historySearch.toLowerCase())
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, historySearch]);
    
     const paginatedHistory = useMemo(() => {
         const startIndex = (historyPage - 1) * HISTORY_ITEMS_PER_PAGE;
        return filteredHistory.slice(startIndex, startIndex + HISTORY_ITEMS_PER_PAGE);
    }, [filteredHistory, historyPage]);
    
    const inventorySummary = useMemo(() => {
        return parts.reduce((acc, part) => {
            const totalStock = Object.values(part.stock).reduce((sum, count) => sum + count, 0);
            acc.totalQuantity += totalStock;
            acc.totalValue += totalStock * part.price;
            return acc;
        }, { totalQuantity: 0, totalValue: 0 });
    }, [parts]);


    return (
        <div className="space-y-6">
             {/* Modals */}
             <PartModal isOpen={isPartModalOpen} onClose={() => setIsPartModalOpen(false)} onSave={handleSavePart} part={selectedPart} parts={parts} allCategories={allCategories} onAddCategory={(name) => handleCategoryAction('add', { name })} currentBranchId={currentBranchId} />
             <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onSave={handleSaveTransaction} parts={parts} type={transactionType} currentBranchId={currentBranchId} />
             <HistoryModal part={selectedPart} transactions={transactions} onClose={() => { setIsHistoryModalOpen(false); setSelectedPart(null); }} storeSettings={storeSettings} />
             <TransferStockModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} onSave={handleSaveTransfer} parts={parts} branches={storeSettings.branches} currentBranchId={currentBranchId} />
             <CategorySettingsModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={allCategories} onAdd={(name) => handleCategoryAction('add', { name })} onEdit={(oldName, newName) => handleCategoryAction('edit', { oldName, newName })} onDelete={(name) => handleCategoryAction('delete', { name })} />
             <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} setParts={setParts} currentBranchId={currentBranchId} />

            {/* Header and Actions (now conditional per tab) */}
            {activeTab === 'inventory' && (
                <div className="flex flex-col sm:flex-row justify-end sm:items-center gap-2 flex-wrap">
                    {selectedPartIds.size > 0 ? (
                        <button 
                            onClick={handleDeleteSelectedParts} 
                            className="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-red-700 text-sm"
                        >
                            <TrashIcon className="w-5 h-5"/>
                            Xóa ({selectedPartIds.size}) mục đã chọn
                        </button>
                    ) : (
                        <>
                            <Link to="/inventory/goods-receipt/new" className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-green-700 text-sm"><PlusIcon/> Tạo phiếu nhập</Link>
                            <button onClick={() => { setTransactionType('Xuất kho'); setIsTransactionModalOpen(true); }} className="flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-red-600 text-sm"><MinusIcon/> Xuất Kho</button>
                            <button onClick={() => setIsTransferModalOpen(true)} className="flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-orange-600 text-sm"><ArrowsRightLeftIcon/> Chuyển kho</button>
                            <button onClick={() => { setSelectedPart(null); setIsPartModalOpen(true); }} className="flex items-center justify-center gap-2 bg-sky-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-sky-700 text-sm"><PlusIcon/> Thêm Mới</button>
                        </>
                    )}
                </div>
            )}
            {activeTab === 'catalog' && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Danh mục sản phẩm</h1>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setIsCategoryModalOpen(true)} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600" title="Cài đặt danh mục"><Cog6ToothIcon className="w-5 h-5 text-slate-700 dark:text-slate-200"/></button>
                        <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-green-700 text-sm"><CloudArrowUpIcon/> Tải lên</button>
                        <button onClick={() => { setSelectedPart(null); setIsPartModalOpen(true); }} className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-sky-700 text-sm"><PlusIcon/> Thêm Phụ tùng</button>
                     </div>
                </div>
            )}
             
             {/* Tab Navigation */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton tabId="inventory" icon={<ArchiveBoxIcon className="w-5 h-5" />} label="Tồn kho" />
                    <TabButton tabId="catalog" icon={<Squares2X2Icon className="w-5 h-5" />} label="Danh mục sản phẩm" />
                    <TabButton tabId="lookup" icon={<DocumentTextIcon className="w-5 h-5" />} label="Tra cứu Phụ tùng" />
                    <TabButton tabId="history" icon={<ClockIcon className="w-5 h-5" />} label="Lịch sử" />
                </nav>
            </div>
            
            {/* --- TAB CONTENT --- */}

            {/* 1. TỒN KHO */}
            {activeTab === 'inventory' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Tìm kiếm theo tên hoặc SKU..." value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} className="md:col-span-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-slate-100" />
                        <select value={currentBranchId} disabled className="md:col-span-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-100 dark:bg-slate-800 dark:text-slate-400 cursor-not-allowed">
                             {storeSettings.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                         <select value={inventoryCategoryFilter} onChange={e => setInventoryCategoryFilter(e.target.value)} className="md:col-span-1 w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-slate-100">
                             <option value="all">Tất cả danh mục</option>
                             {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg flex items-center gap-4 border border-blue-200 dark:border-blue-800">
                            <div className="bg-blue-500 p-3 rounded-full text-white"><ArchiveBoxIcon className="w-6 h-6"/></div>
                            <div>
                                <p className="text-sm text-blue-800 dark:text-blue-300">Tổng SL tồn</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{inventorySummary.totalQuantity}</p>
                            </div>
                        </div>
                         <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg flex items-center gap-4 border border-green-200 dark:border-green-800">
                            <div className="bg-green-500 p-3 rounded-full text-white"><BanknotesIcon className="w-6 h-6"/></div>
                            <div>
                                <p className="text-sm text-green-800 dark:text-green-300">Giá trị tồn kho</p>
                                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{formatCurrency(inventorySummary.totalValue)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
                        <table className="w-full text-left">
                           <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-sm">
                                <tr>
                                    <th className="p-3">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                            onChange={handleSelectAllInventory}
                                            checked={areAllInventorySelected}
                                            aria-label="Select all items on this page"
                                        />
                                    </th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Tên Phụ tùng</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">SKU</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Tồn kho (hiện tại)</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Tổng tồn kho</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Giá nhập</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Giá bán</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Hành động</th>
                                </tr>
                            </thead>
                             <tbody>
                                {paginatedInventoryParts.map(part => {
                                    const currentStock = part.stock[currentBranchId] || 0;
                                    const totalStock = Object.values(part.stock).reduce((sum, count) => sum + count, 0);
                                    return (
                                     <tr key={part.id} className={`border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${selectedPartIds.has(part.id) ? 'bg-sky-50 dark:bg-sky-900/20' : ''}`}>
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                                checked={selectedPartIds.has(part.id)}
                                                onChange={() => handleSelectInventoryPart(part.id)}
                                                aria-label={`Select ${part.name}`}
                                            />
                                        </td>
                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{part.name}</td>
                                        <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{part.sku}</td>
                                        <td className={`p-3 text-center font-bold ${currentStock <= 3 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>{currentStock}</td>
                                        <td className="p-3 text-center text-slate-600 dark:text-slate-300">{totalStock}</td>
                                        <td className="p-3 text-right text-slate-600 dark:text-slate-300">{formatCurrency(part.price)}</td>
                                        <td className="p-3 text-right font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(part.sellingPrice)}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => { setSelectedPart(part); setIsPartModalOpen(true); }} title="Chỉnh sửa"><PencilSquareIcon className="w-5 h-5 text-sky-600 dark:text-sky-400 hover:opacity-70"/></button>
                                                <button onClick={() => { setSelectedPart(part); setIsHistoryModalOpen(true); }} title="Lịch sử"><ClockIcon className="w-5 h-5 text-slate-500 hover:opacity-70"/></button>
                                                <button onClick={() => handleDeletePart(part.id)} title="Xóa"><TrashIcon className="w-5 h-5 text-red-500 hover:opacity-70"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                         {paginatedInventoryParts.length === 0 && <p className="text-center p-8 text-slate-500 dark:text-slate-400">Không tìm thấy phụ tùng nào.</p>}
                    </div>
                     {filteredInventoryParts.length > INVENTORY_ITEMS_PER_PAGE && <Pagination currentPage={inventoryPage} totalPages={Math.ceil(filteredInventoryParts.length / INVENTORY_ITEMS_PER_PAGE)} onPageChange={setInventoryPage} itemsPerPage={INVENTORY_ITEMS_PER_PAGE} totalItems={filteredInventoryParts.length} />}
                </div>
            )}
            
            {/* 2. DANH MỤC SẢN PHẨM (GRID VIEW) */}
             {activeTab === 'catalog' && (
                <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Tìm kiếm theo tên, SKU..." value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-slate-100" />
                        <select value={catalogCategoryFilter} onChange={e => setCatalogCategoryFilter(e.target.value)} className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-slate-100">
                             <option value="all">Tất cả danh mục</option>
                             {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                         {paginatedCatalogParts.map(part => {
                             const cardColor = getCategoryColor(part.category);
                             const totalStock = Object.values(part.stock).reduce((a, b) => a + b, 0);
                             return (
                                <div key={part.id} className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 relative border-t-4 overflow-hidden ${cardColor}`}>
                                    <div className="p-4 space-y-2">
                                        <div className="absolute top-2 right-2">
                                            <EllipsisVerticalIcon className="w-5 h-5 text-slate-400"/>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <ArchiveBoxIcon className="w-6 h-6 text-slate-500 dark:text-slate-400"/>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{part.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{part.sku}</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-semibold text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/50 px-2 py-0.5 rounded-full">{part.category || 'Chưa phân loại'}</button>
                                        <div className="grid grid-cols-2 gap-x-4 border-t pt-2 dark:border-slate-700">
                                            <div className="text-sm"><p className="text-slate-500 dark:text-slate-400">Giá nhập:</p><p className="font-medium text-slate-700 dark:text-slate-300">{formatCurrency(part.price)}</p></div>
                                            <div className="text-sm text-right"><p className="text-slate-500 dark:text-slate-400">Giá bán:</p><p className="font-bold text-sky-600 dark:text-sky-400">{formatCurrency(part.sellingPrice)}</p></div>
                                        </div>
                                        {totalStock <= 5 && (
                                            <p className="text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-1"><ExclamationTriangleIcon className="w-4 h-4"/> Tồn kho thấp: {totalStock}</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                     {paginatedCatalogParts.length === 0 && <p className="text-center p-8 text-slate-500 dark:text-slate-400">Không tìm thấy phụ tùng nào.</p>}
                     {filteredCatalogParts.length > CATALOG_ITEMS_PER_PAGE && <Pagination currentPage={catalogPage} totalPages={Math.ceil(filteredCatalogParts.length / CATALOG_ITEMS_PER_PAGE)} onPageChange={setCatalogPage} itemsPerPage={CATALOG_ITEMS_PER_PAGE} totalItems={filteredCatalogParts.length}/>}
                </div>
            )}

            {/* 3. TRA CỨU PHỤ TÙNG */}
            {activeTab === 'lookup' && (
                 <div className="space-y-4">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tra cứu phụ tùng Honda Việt Nam</h1>
                    <div>
                         <label htmlFor="model-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Chọn dòng xe:</label>
                         <select id="model-filter" value={lookupModelFilter} onChange={e => setLookupModelFilter(e.target.value)} className="mt-1 w-full md:w-1/2 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-slate-100">
                            <option value="all">Tất cả</option>
                            {allHondaModels.map(model => <option key={model} value={model}>{model}</option>)}
                         </select>
                    </div>
                     <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-sm">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Tên Phụ tùng</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Mã (SKU)</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Giá tham khảo</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLookupParts.map(part => (
                                     <tr key={part.sku} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{part.name}</td>
                                        <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{part.sku}</td>
                                        <td className="p-3 text-right font-semibold text-sky-600 dark:text-sky-400">{formatCurrency(part.sellingPrice)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleSelectPartFromLookup(part)} className="bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-semibold px-3 py-1 rounded-md text-sm hover:bg-sky-200 dark:hover:bg-sky-800/50">Thêm</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {filteredLookupParts.length > LOOKUP_ITEMS_PER_PAGE && <Pagination currentPage={lookupPage} totalPages={Math.ceil(filteredLookupParts.length / LOOKUP_ITEMS_PER_PAGE)} onPageChange={setLookupPage} itemsPerPage={LOOKUP_ITEMS_PER_PAGE} totalItems={filteredLookupParts.length} />}
                 </div>
            )}
             
            {/* 4. LỊCH SỬ */}
             {activeTab === 'history' && (
                <div className="space-y-4">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Lịch sử Xuất/Nhập kho</h1>
                    <input type="text" placeholder="Tìm kiếm theo tên phụ tùng, mã giao dịch, ghi chú..." value={historySearch} onChange={e => setHistorySearch(e.target.value)} className="w-full md:w-1/2 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-slate-100" />
                     <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-sm">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Ngày</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Loại</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Phụ tùng</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Số lượng</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Đơn giá</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Tổng tiền</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Chi nhánh</th>
                                    <th className="p-3 font-semibold text-slate-600 dark:text-slate-300">Ghi chú</th>
                                </tr>
                            </thead>
                             <tbody>
                                {paginatedHistory.map(tx => (
                                     <tr key={tx.id} className="border-b dark:border-slate-700">
                                        <td className="p-2 text-slate-600 dark:text-slate-400 text-xs">{tx.date}</td>
                                        <td className="p-2"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tx.type === 'Nhập kho' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>{tx.type}</span></td>
                                        <td className="p-2 font-medium text-slate-800 dark:text-slate-200">{tx.partName}</td>
                                        <td className="p-2 text-center font-bold text-slate-700 dark:text-slate-300">{tx.quantity}</td>
                                        <td className="p-2 text-right text-slate-600 dark:text-slate-400">{formatCurrency(tx.unitPrice || 0)}</td>
                                        <td className="p-2 text-right font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(tx.totalPrice)}</td>
                                        <td className="p-2 text-slate-600 dark:text-slate-400">{storeSettings.branches.find(b => b.id === tx.branchId)?.name || tx.branchId}</td>
                                        <td className="p-2 text-slate-500 text-xs">{tx.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {paginatedHistory.length === 0 && <p className="text-center p-8 text-slate-500 dark:text-slate-400">Không có giao dịch nào.</p>}
                    </div>
                     {filteredHistory.length > HISTORY_ITEMS_PER_PAGE && <Pagination currentPage={historyPage} totalPages={Math.ceil(filteredHistory.length / HISTORY_ITEMS_PER_PAGE)} onPageChange={setHistoryPage} itemsPerPage={HISTORY_ITEMS_PER_PAGE} totalItems={filteredHistory.length} />}
            </div>
            )}
        </div>
    );
};

export default InventoryManager;
