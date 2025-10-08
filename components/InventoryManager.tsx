import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Part, InventoryTransaction, User, StoreSettings } from "../types";
import {
  PlusIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  MinusIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  ChevronDownIcon,
  CloudArrowUpIcon,
  ArrowUturnLeftIcon,
  ClockIcon,
} from "./common/Icons";
import Pagination from "./common/Pagination";

// Helper to format currency
const formatCurrency = (amount: number) => {
  if (isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// --- Dữ liệu mẫu phụ tùng Honda Việt Nam (ĐÃ MỞ RỘNG TOÀN DIỆN VÀ THÊM GIÁ) ---
const hondaPartsData: (Omit<Part, "id" | "stock"> & { model: string[] })[] = [
  // === Phụ tùng Tiêu hao & Bảo dưỡng ===
  {
    name: "Nhớt Honda chính hãng (0.8L, MA SL 10W30)",
    sku: "MA-SL-10W30-0.8",
    price: 85000,
    sellingPrice: 105000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: [
      "Wave Alpha",
      "Wave RSX",
      "Future 125",
      "Future Neo",
      "Future X",
      "Dream",
    ],
  },
  {
    name: "Nhớt Honda chính hãng (1L, MA SL 10W30)",
    sku: "MA-SL-10W30-1.0",
    price: 100000,
    sellingPrice: 125000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: ["Winner/Winner X"],
  },
  {
    name: "Nhớt hộp số (120ml)",
    sku: "GEAR-OIL-120ML",
    price: 30000,
    sellingPrice: 40000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: [
      "Air Blade 125/150",
      "Lead/SH Mode",
      "Vision 2021+",
      "SH",
      "Vario",
      "Click",
      "PCX",
    ],
  },
  {
    name: "Nước làm mát Honda chính hãng (1L)",
    sku: "08CLAG010S0",
    price: 80000,
    sellingPrice: 100000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: [
      "Air Blade 125/150",
      "Winner/Winner X",
      "Lead/SH Mode",
      "SH",
      "Vario",
      "PCX",
    ],
  },
  {
    name: "Ắc quy GS GTZ5S-E (Wave, Future)",
    sku: "31500-KWW-A01",
    price: 250000,
    sellingPrice: 310000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: ["Wave Alpha", "Wave RSX", "Future 125", "Future Neo", "Future X"],
  },
  {
    name: "Ắc quy GS GTZ6V (Xe ga)",
    sku: "31500-KZR-602",
    price: 320000,
    sellingPrice: 380000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: [
      "Air Blade 125/150",
      "Lead/SH Mode",
      "Vision 2021+",
      "SH",
      "Vario",
      "Click",
      "PCX",
    ],
  },
  {
    name: "Bugi NGK CPR6EA-9 (Wave RSX, Future 125)",
    sku: "31916-KRM-841",
    price: 45000,
    sellingPrice: 65000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: ["Wave RSX", "Future 125", "Future Neo", "Future X"],
  },
  {
    name: "Bugi NGK MR8K-9 (Air Blade 125/150)",
    sku: "31926-K12-V01",
    price: 90000,
    sellingPrice: 120000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Bugi NGK LMAR8L-9 (SH 125/150)",
    sku: "31908-K59-A71",
    price: 110000,
    sellingPrice: 150000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: ["SH"],
  },
  {
    name: "Bugi NGK CPR8EA-9 (Winner/Winner X)",
    sku: "31917-K56-N01",
    price: 55000,
    sellingPrice: 75000,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: ["Winner/Winner X"],
  },
  {
    name: "Bình ắc quy Vision",
    sku: "31500-K44-D01",
    price: 420000,
    sellingPrice: 499936,
    category: "Phụ tùng Tiêu hao & Bảo dưỡng",
    model: ["Vision 2021+"],
  },

  // === Phụ tùng Lọc gió & Bôi trơn ===
  {
    name: "Lọc gió (Wave Alpha 110, RSX 110)",
    sku: "17210-KWW-640",
    price: 60000,
    sellingPrice: 80000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Wave Alpha", "Wave RSX"],
  },
  {
    name: "Lọc gió (Future 125, Future X, Neo)",
    sku: "17210-KTL-740",
    price: 75000,
    sellingPrice: 95000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Future 125", "Future Neo", "Future X"],
  },
  {
    name: "Lọc gió (Air Blade 125/150)",
    sku: "17210-K12-900",
    price: 120000,
    sellingPrice: 150000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Lọc gió (Winner/Winner X)",
    sku: "17210-K56-N00",
    price: 90000,
    sellingPrice: 115000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Winner/Winner X"],
  },
  {
    name: "Lọc gió (Lead 125/SH Mode)",
    sku: "17210-K1N-V00",
    price: 130000,
    sellingPrice: 165000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Lead/SH Mode"],
  },
  {
    name: "Lọc gió (Vision 2021+)",
    sku: "17210-K2C-V00",
    price: 110000,
    sellingPrice: 140000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Vision 2021+"],
  },
  {
    name: "Lọc gió (SH 125/150i)",
    sku: "17210-K59-A70",
    price: 180000,
    sellingPrice: 220000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["SH"],
  },
  {
    name: "Lọc gió (Vario/Click/PCX)",
    sku: "17210-K59-A70",
    price: 140000,
    sellingPrice: 180000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Vario", "Click", "PCX"],
  },
  {
    name: "Lọc nhớt (Lưới lọc) (Wave, Future)",
    sku: "15421-KSP-910",
    price: 25000,
    sellingPrice: 35000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Wave Alpha", "Wave RSX", "Future 125", "Future Neo", "Future X"],
  },
  {
    name: "Lọc nhớt (Lưới lọc) (Xe ga)",
    sku: "15421-KPL-900",
    price: 30000,
    sellingPrice: 45000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Air Blade 125/150", "Lead/SH Mode", "Vision 2021+", "SH"],
  },
  {
    name: "Lọc nhớt (Lõi lọc giấy) (Winner/Winner X)",
    sku: "15412-KSP-910",
    price: 45000,
    sellingPrice: 60000,
    category: "Phụ tùng Lọc gió & Bôi trơn",
    model: ["Winner/Winner X"],
  },

  // === Phụ tùng Hệ thống truyền động (NSD, Dây curoa, Bi nồi) ===
  {
    name: "Nhông sên dĩa (Wave RSX, Future 125)",
    sku: "06406-KTL-750",
    price: 290000,
    sellingPrice: 360000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Wave RSX", "Future 125"],
  },
  {
    name: "Nhông sên dĩa (Winner/Winner X)",
    sku: "06406-K56-V01",
    price: 450000,
    sellingPrice: 550000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Winner/Winner X"],
  },
  {
    name: "Nhông sên dĩa (Wave Alpha 110)",
    sku: "06406-KWW-640",
    price: 250000,
    sellingPrice: 310000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Wave Alpha"],
  },
  {
    name: "Dây curoa (Air Blade 125)",
    sku: "23100-KZR-601",
    price: 380000,
    sellingPrice: 450000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Dây curoa (Air Blade 150)",
    sku: "23100-K0S-V01",
    price: 420000,
    sellingPrice: 500000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Dây curoa (Lead 125/SH Mode)",
    sku: "23100-K1N-V01",
    price: 400000,
    sellingPrice: 480000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Lead/SH Mode"],
  },
  {
    name: "Dây curoa (Vision 110)",
    sku: "23100-K44-V01",
    price: 350000,
    sellingPrice: 420000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Vision 2021+"],
  },
  {
    name: "Dây curoa (SH 125/150i)",
    sku: "23100-K59-A71",
    price: 550000,
    sellingPrice: 650000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["SH"],
  },
  {
    name: "Dây curoa Bando (Vario/Click/AB)",
    sku: "23100-K35-V01",
    price: 350000,
    sellingPrice: 425000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Vario", "Click", "Air Blade 125/150"],
  },
  {
    name: "Bộ bi nồi (Air Blade 125)",
    sku: "22123-KZR-600",
    price: 150000,
    sellingPrice: 190000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Bộ bi nồi (Lead 125/SH Mode)",
    sku: "22123-K1N-V00",
    price: 160000,
    sellingPrice: 200000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Lead/SH Mode"],
  },
  {
    name: "Bộ bi nồi (Vision 110)",
    sku: "22123-K44-V00",
    price: 140000,
    sellingPrice: 180000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Vision 2021+"],
  },
  {
    name: "Bộ bi nồi (SH 125/150i)",
    sku: "22123-K59-A70",
    price: 220000,
    sellingPrice: 280000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["SH"],
  },
  {
    name: "Bố 3 càng (AB 125, Vision)",
    sku: "22535-K12-900",
    price: 350000,
    sellingPrice: 420000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Air Blade 125/150", "Vision 2021+"],
  },
  {
    name: "Bố 3 càng (Lead 125, SH Mode)",
    sku: "22535-K1N-V00",
    price: 380000,
    sellingPrice: 450000,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Lead/SH Mode"],
  },
  {
    name: "Nắp hộp xích trên Future",
    sku: "40510-KFL-890ZA",
    price: 170000,
    sellingPrice: 212258,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Future 125", "Future Neo", "Future X"],
  },
  {
    name: "Chén bi (Vario/Click/AB)",
    sku: "22110-K35-V00",
    price: 95000,
    sellingPrice: 120432,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Vario", "Click", "Air Blade 125/150"],
  },
  {
    name: "Cánh quạt (Vario/Click/AB)",
    sku: "22102-K35-V00",
    price: 85000,
    sellingPrice: 104272,
    category: "Phụ tùng Hệ thống truyền động",
    model: ["Vario", "Click", "Air Blade 125/150"],
  },

  // === Phụ tùng Hệ thống phanh (Heo dầu, Má phanh, Đĩa phanh) ===
  {
    name: "Má phanh đĩa trước (Wave RSX, Future)",
    sku: "06455-KWB-601",
    price: 80000,
    sellingPrice: 110000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Wave RSX", "Future 125", "Future Neo", "Future X"],
  },
  {
    name: "Má phanh đĩa trước (Air Blade, Lead)",
    sku: "06455-KVG-V01",
    price: 90000,
    sellingPrice: 125000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Air Blade 125/150", "Lead/SH Mode"],
  },
  {
    name: "Má phanh đĩa trước (Winner/SH)",
    sku: "06455-K56-N01",
    price: 120000,
    sellingPrice: 160000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Winner/Winner X", "SH"],
  },
  {
    name: "Má phanh đĩa trước (Vision CBS)",
    sku: "06455-K81-N21",
    price: 85000,
    sellingPrice: 115000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Vision 2021+"],
  },
  {
    name: "Bố thắng đĩa trước (Vario/Click/SH/SH Mode/PCX)",
    sku: "06455-K59-A71",
    price: 210000,
    sellingPrice: 260344,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Vario", "Click", "SH", "SH Mode", "PCX"],
  },
  {
    name: "Má phanh đĩa sau (Winner/Winner X, SH)",
    sku: "06435-K56-N01",
    price: 110000,
    sellingPrice: 150000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Winner/Winner X", "SH"],
  },
  {
    name: "Má phanh sau (đùm) (Wave, Future, Vision)",
    sku: "06430-KFM-900",
    price: 70000,
    sellingPrice: 95000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Wave Alpha", "Wave RSX", "Future 125", "Vision 2021+"],
  },
  {
    name: "Bố thắng đùm sau (Vario/Click)",
    sku: "43151-K59-A71",
    price: 140000,
    sellingPrice: 171940,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Vario", "Click"],
  },
  {
    name: "Đĩa phanh trước (Wave RSX, Future 125)",
    sku: "45251-KTL-750",
    price: 300000,
    sellingPrice: 380000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Wave RSX", "Future 125"],
  },
  {
    name: "Đĩa phanh trước (Winner/Winner X)",
    sku: "45251-K56-N01",
    price: 550000,
    sellingPrice: 650000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Winner/Winner X"],
  },
  {
    name: "Đĩa phanh trước (Air Blade)",
    sku: "45251-KVG-901",
    price: 400000,
    sellingPrice: 480000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Đĩa phanh trước (Vario/Click)",
    sku: "45251-K59-A71",
    price: 380000,
    sellingPrice: 460000,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Vario", "Click", "PCX"],
  },
  {
    name: "Cụm ngàm phanh trước bên trái Vario",
    sku: "45150-K2S-N01",
    price: 1450000,
    sellingPrice: 1879696,
    category: "Phụ tùng Hệ thống phanh",
    model: ["Vario", "Click"],
  },

  // === Phụ tùng Động cơ & Đầu bò ===
  {
    name: "Gioăng đầu xylanh Future",
    sku: "12251-KFL-851",
    price: 25000,
    sellingPrice: 31912,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Future 125", "Future Neo", "Future X"],
  },
  {
    name: "Nắp máy trái Future",
    sku: "11341-KYZ-900",
    price: 250000,
    sellingPrice: 309991,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Future 125"],
  },
  {
    name: "Piston + bạc (Wave Alpha 110)",
    sku: "13101-KWW-740",
    price: 220000,
    sellingPrice: 280000,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Wave Alpha"],
  },
  {
    name: "Piston + bạc (Winner/Winner X)",
    sku: "13101-K56-N00",
    price: 350000,
    sellingPrice: 420000,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Winner/Winner X"],
  },
  {
    name: "Xupap hút (Wave, Future)",
    sku: "14711-KWW-740",
    price: 90000,
    sellingPrice: 120000,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Wave Alpha", "Wave RSX", "Future 125"],
  },
  {
    name: "Xupap xả (Wave, Future)",
    sku: "14721-KWW-740",
    price: 80000,
    sellingPrice: 110000,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Wave Alpha", "Wave RSX", "Future 125"],
  },
  {
    name: "Cây cam (Wave Alpha 110)",
    sku: "14100-KWW-640",
    price: 300000,
    sellingPrice: 380000,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Wave Alpha"],
  },
  {
    name: "Cây cam (Air Blade 125)",
    sku: "14100-KZR-600",
    price: 450000,
    sellingPrice: 550000,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Két nước Vario/Click",
    sku: "19010-K59-A11",
    price: 550000,
    sellingPrice: 680000,
    category: "Phụ tùng Động cơ & Đầu bò",
    model: ["Vario", "Click"],
  },

  // === Phụ tùng Hệ thống điện (IC, Sạc, Mobin, Khóa) ===
  {
    name: "Cụm khóa điện Vision",
    sku: "35100-K2C-V01",
    price: 680000,
    sellingPrice: 844876,
    category: "Phụ tùng Hệ thống điện",
    model: ["Vision 2021+"],
  },
  {
    name: "Cụm khóa Smartkey SH 125/150i",
    sku: "35111-K0R-V00",
    price: 900000,
    sellingPrice: 1100000,
    category: "Phụ tùng Hệ thống điện",
    model: ["SH"],
  },
  {
    name: "IC/ECM (Wave RSX Fi)",
    sku: "38770-K03-H11",
    price: 700000,
    sellingPrice: 850000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Wave RSX"],
  },
  {
    name: "IC/ECM (Air Blade 125)",
    sku: "38770-KZR-601",
    price: 1200000,
    sellingPrice: 1500000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Air Blade 125/150"],
  },
  {
    name: "IC/ECM (Winner X)",
    sku: "38770-K56-V02",
    price: 1100000,
    sellingPrice: 1350000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Winner/Winner X"],
  },
  {
    name: "Sạc (Wave, Future)",
    sku: "31600-KWW-641",
    price: 150000,
    sellingPrice: 200000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Wave Alpha", "Wave RSX", "Future 125"],
  },
  {
    name: "Sạc (Air Blade 125, SH)",
    sku: "31600-KZR-601",
    price: 400000,
    sellingPrice: 500000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Air Blade 125/150", "SH"],
  },
  {
    name: "Mobin sườn (Wave, Future)",
    sku: "30510-KWW-641",
    price: 180000,
    sellingPrice: 230000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Wave Alpha", "Wave RSX", "Future 125"],
  },
  {
    name: "Cảm biến nhiệt độ ECT (Xe ga)",
    sku: "37870-KZR-601",
    price: 130000,
    sellingPrice: 170000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Air Blade 125/150", "Lead/SH Mode", "Vision 2021+", "SH"],
  },
  {
    name: "Dây điện chính Vision",
    sku: "32100-K2C-D01",
    price: 2100000,
    sellingPrice: 2606984,
    category: "Phụ tùng Hệ thống điện",
    model: ["Vision 2021+"],
  },
  {
    name: "Cụm đèn pha LED Air Blade 125/150",
    sku: "33110-K1F-V11",
    price: 1500000,
    sellingPrice: 1750000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Cùm công tắc trái Winner X (ABS)",
    sku: "35200-K56-V51",
    price: 380000,
    sellingPrice: 450000,
    category: "Phụ tùng Hệ thống điện",
    model: ["Winner/Winner X"],
  },
  {
    name: "Cụm đèn hậu Vario/Click",
    sku: "33701-K59-A71",
    price: 600000,
    sellingPrice: 757949,
    category: "Phụ tùng Hệ thống điện",
    model: ["Vario", "Click"],
  },

  // === Phụ tùng Dàn nhựa & Khung sườn ===
  {
    name: "Tem sản phẩm Vision",
    sku: "87501-K2C-V91",
    price: 8000,
    sellingPrice: 11231,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp xi nhan trước Vision (Đỏ)",
    sku: "NEXAC-K44-WKC03",
    price: 130000,
    sellingPrice: 169539,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp xi nhan trước Vision (Chrome)",
    sku: "NEXAC-K44-WKC02",
    price: 130000,
    sellingPrice: 169539,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp ống xả Vision (Carbon)",
    sku: "NEXAC-K44-MFC04",
    price: 200000,
    sellingPrice: 251167,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp đèn pha Vision (Đỏ)",
    sku: "NEXAC-K44-HLC03",
    price: 120000,
    sellingPrice: 150702,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp thân trước Vision (Chrome)",
    sku: "NEXAC-K44-FRC02",
    price: 380000,
    sellingPrice: 470938,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Thảm lót chân Vision (Carbon)",
    sku: "NEXAC-K44-FLP04",
    price: 480000,
    sellingPrice: 596522,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp bầu lọc gió Vision (Carbon)",
    sku: "NEXAC-K44-ESP04",
    price: 200000,
    sellingPrice: 251167,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp chân bùn sau Vision (Đỏ mờ)",
    sku: "UNIAC-K44-RFC06",
    price: 60000,
    sellingPrice: 74827,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp két tản nhiệt Vision (Carbon)",
    sku: "UNIAC-K44-RDC04",
    price: 75000,
    sellingPrice: 92095,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Ốp pô Vision (Đỏ mờ)",
    sku: "UNIAC-K44-MFC06",
    price: 130000,
    sellingPrice: 161165,
    category: "Phụ tùng Dàn nhựa & Khung sườn",
    model: ["Vision 2021+"],
  },
  {
    name: "Dàn áo Air Blade 150 (Đen mờ)",
    sku: "83500-K1F-V10ZA",
    price: 4200000,
    sellingPrice: 4800000,
    category: "Dàn nhựa & Khung sườn",
    model: ["Air Blade 125/150"],
  },
  {
    name: "Mặt nạ trước Vario/Click (Đỏ)",
    sku: "64301-K59-A70ZC",
    price: 250000,
    sellingPrice: 310000,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Ốp sườn sau SH Mode (Trắng)",
    sku: "83600-K1N-V00ZC",
    price: 450000,
    sellingPrice: 550000,
    category: "Dàn nhựa & Khung sườn",
    model: ["Lead/SH Mode"],
  },
  {
    name: "Yên xe Wave Alpha",
    sku: "77200-KWW-640",
    price: 280000,
    sellingPrice: 350000,
    category: "Dàn nhựa & Khung sườn",
    model: ["Wave Alpha"],
  },
  {
    name: "Gác chân sau Future 125",
    sku: "50715-K73-T60",
    price: 180000,
    sellingPrice: 220000,
    category: "Dàn nhựa & Khung sườn",
    model: ["Future 125"],
  },
  {
    name: "Bộ mỏ bùn Vario",
    sku: "57110-K2S-N12",
    price: 2600000,
    sellingPrice: 3285289,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Tem PGM-FI Future",
    sku: "86646-K73-VE0ZC",
    price: 14000,
    sellingPrice: 18235,
    category: "Dàn nhựa & Khung sườn",
    model: ["Future 125", "Future Neo", "Future X"],
  },
  {
    name: "Gù tay lái phải (Vario/Click/AB/PCX/SH/Winner)",
    sku: "53166-K46-N20",
    price: 40000,
    sellingPrice: 50229,
    category: "Dàn nhựa & Khung sườn",
    model: [
      "Vario",
      "Click",
      "Air Blade 125/150",
      "PCX",
      "SH",
      "Winner/Winner X",
    ],
  },
  {
    name: "Gù tay lái trái (Vario/Click/AB/PCX/SH/Winner)",
    sku: "53165-K46-N20",
    price: 40000,
    sellingPrice: 50229,
    category: "Dàn nhựa & Khung sườn",
    model: [
      "Vario",
      "Click",
      "Air Blade 125/150",
      "PCX",
      "SH",
      "Winner/Winner X",
    ],
  },
  {
    name: "Móc treo đồ (Vario/Click)",
    sku: "81250-K59-A70",
    price: 35000,
    sellingPrice: 42973,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Nẹp sườn trái (Vario/Click)",
    sku: "64308-K59-A70",
    price: 20000,
    sellingPrice: 25117,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Nẹp sườn phải (Vario/Click)",
    sku: "64309-K59-A70",
    price: 20000,
    sellingPrice: 25117,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Ốp pô (Vario/Click)",
    sku: "18318-K59-A70",
    price: 145000,
    sellingPrice: 181254,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Ốp đồng hồ trước (Vario/Click)",
    sku: "81131-K59-A70",
    price: 80000,
    sellingPrice: 101906,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Ốp sườn trái (Vario/Click)",
    sku: "83750-K59-A70ZA",
    price: 210000,
    sellingPrice: 260344,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Ốp sườn phải (Vario/Click)",
    sku: "83650-K59-A70ZA",
    price: 210000,
    sellingPrice: 260344,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Yếm trái (Vario/Click)",
    sku: "64340-K59-A70ZB",
    price: 140000,
    sellingPrice: 171940,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Yếm phải (Vario/Click)",
    sku: "64335-K59-A70ZB",
    price: 140000,
    sellingPrice: 171940,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },
  {
    name: "Dè trước (Vario/Click)",
    sku: "61100-K59-A70ZB",
    price: 250000,
    sellingPrice: 310078,
    category: "Dàn nhựa & Khung sườn",
    model: ["Vario", "Click"],
  },

  // === Bánh xe & Lốp ===
  {
    name: "Lốp trước IRC (Wave, Future)",
    sku: "44711-KWW-641",
    price: 250000,
    sellingPrice: 320000,
    category: "Bánh xe & Lốp",
    model: ["Wave Alpha", "Wave RSX", "Future 125"],
  },
  {
    name: "Lốp sau IRC (Wave, Future)",
    sku: "42711-KWW-641",
    price: 300000,
    sellingPrice: 380000,
    category: "Bánh xe & Lốp",
    model: ["Wave Alpha", "Wave RSX", "Future 125"],
  },
  {
    name: "Lốp trước IRC (Air Blade, Vision)",
    sku: "44711-KVG-901",
    price: 350000,
    sellingPrice: 430000,
    category: "Bánh xe & Lốp",
    model: ["Air Blade 125/150", "Vision 2021+"],
  },
  {
    name: "Lốp sau IRC (Air Blade, Vision)",
    sku: "42711-KVG-901",
    price: 400000,
    sellingPrice: 480000,
    category: "Bánh xe & Lốp",
    model: ["Air Blade 125/150", "Vision 2021+"],
  },
  {
    name: "Lốp trước IRC (Winner/Winner X)",
    sku: "44711-K56-N01",
    price: 450000,
    sellingPrice: 550000,
    category: "Bánh xe & Lốp",
    model: ["Winner/Winner X"],
  },
  {
    name: "Mâm (vành) trước Winner X",
    sku: "44650-K56-V50",
    price: 1300000,
    sellingPrice: 1550000,
    category: "Bánh xe & Lốp",
    model: ["Winner/Winner X"],
  },
  {
    name: "Mâm (vành) sau SH 150i ABS",
    sku: "42650-K0R-V00",
    price: 2200000,
    sellingPrice: 2600000,
    category: "Bánh xe & Lốp",
    model: ["SH"],
  },

  // === Linh kiện nhỏ & Bu lông, Ốc vít ===
  {
    name: "Vít 5x12",
    sku: "938910501207",
    price: 3000,
    sellingPrice: 4628,
    category: "Linh kiện nhỏ",
    model: ["Future 125", "Wave Alpha", "Vision 2021+", "Dream"],
  },
  {
    name: "Bu lông 6x20",
    sku: "90118KY1000",
    price: 5000,
    sellingPrice: 7739,
    category: "Linh kiện nhỏ",
    model: ["Future 125", "Wave Alpha", "Dream"],
  },
  {
    name: "Vít có đệm 5-10",
    sku: "93891-050-1007",
    price: 3500,
    sellingPrice: 4628,
    category: "Linh kiện nhỏ",
    model: ["Vision 2021+"],
  },
  {
    name: "Vít 4x20",
    sku: "93891-040-2007",
    price: 3000,
    sellingPrice: 4628,
    category: "Linh kiện nhỏ",
    model: ["Future 125", "Wave Alpha", "Dream"],
  },
];

const ITEMS_PER_PAGE = 50;

// --- Modals ---
const PartModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (part: Part) => void;
  part: Part | null;
  parts: Part[];
  allCategories: string[];
  onAddCategory: (categoryName: string) => void;
  currentBranchId: string;
}> = ({
  isOpen,
  onClose,
  onSave,
  part,
  parts,
  allCategories,
  onAddCategory,
  currentBranchId,
}) => {
  const [formData, setFormData] = useState<Omit<Part, "id">>(() =>
    part
      ? { ...part }
      : {
          name: "",
          sku: "",
          stock: {},
          price: 0,
          sellingPrice: 0,
          category: "",
        }
  );
  const [userModifiedSku, setUserModifiedSku] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (part) {
        // Editing existing part or creating from reference
        setFormData({ ...part });
        // If part has a real ID, it's an edit. If ID is falsy (''), it's from reference.
        // In both cases, the SKU is considered user-defined.
        setUserModifiedSku(true);
      } else {
        // Adding brand new part from scratch
        setFormData({
          name: "",
          sku: "",
          stock: {},
          price: 0,
          sellingPrice: 0,
          category: "",
        });
        setUserModifiedSku(false);
      }
      setIsAddingNewCategory(false);
      setNewCategoryName("");
    }
  }, [part, isOpen]);

  const generateSkuFromName = (name: string): string => {
    if (!name || name.trim() === "") return "";

    const cleanedName = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .toUpperCase();

    const words = cleanedName.split(/\s+/).filter(Boolean);
    if (words.length === 0) return "";

    const initials = words
      .slice(0, 3)
      .map((word) => word[0])
      .join("");
    const randomPart = Math.floor(1000 + Math.random() * 9000);

    return `${initials}-${randomPart}`;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name === "sku") {
      setUserModifiedSku(true);
    }

    const isNumber = type === "number";
    const processedValue = isNumber ? parseFloat(value) || 0 : value;

    if (name === "name" && !userModifiedSku) {
      const generatedSku = generateSkuFromName(value as string);
      setFormData((prev) => ({
        ...prev,
        name: value as string,
        sku: generatedSku,
      }));
    } else if (name === "quantity") {
      setFormData((prev) => ({
        ...prev,
        stock: {
          ...prev.stock,
          [currentBranchId]: processedValue as number,
        },
      }));
    } else if (name === "price") {
      const purchasePrice = processedValue as number;
      setFormData((prev) => ({
        ...prev,
        price: purchasePrice,
        sellingPrice: Math.round((purchasePrice * 1.3) / 1000) * 1000, // Suggest selling price with ~30% margin
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleAddNewCategory = () => {
    const trimmedCategory = newCategoryName.trim();
    if (trimmedCategory && !allCategories.includes(trimmedCategory)) {
      onAddCategory(trimmedCategory);
      setFormData((prev) => ({ ...prev, category: trimmedCategory }));
    }
    setNewCategoryName("");
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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              {part?.id ? "Chỉnh sửa Phụ tùng" : "Thêm Phụ tùng mới"}
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="part-name"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Tên phụ tùng
                </label>
                <input
                  id="part-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="VD: Bugi NGK Iridium"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="part-sku"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  SKU
                </label>
                <input
                  id="part-sku"
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Tự động tạo hoặc nhập thủ công"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Danh mục sản phẩm
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <select
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                    className="p-2 bg-slate-200 dark:bg-slate-700 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 flex-shrink-0"
                  >
                    <PlusIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  </button>
                </div>
                {isAddingNewCategory && (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Tên danh mục mới..."
                      className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700"
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="part-quantity"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Số lượng tồn kho (Chi nhánh hiện tại)
                </label>
                <input
                  id="part-quantity"
                  type="number"
                  name="quantity"
                  value={currentStock}
                  onChange={handleChange}
                  placeholder="0"
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="part-price"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Giá nhập
                  </label>
                  <input
                    id="part-price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="80000"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="part-sellingPrice"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Giá bán
                  </label>
                  <input
                    id="part-sellingPrice"
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="110000"
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 flex justify-end space-x-3 border-t dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
            >
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

// Fix: Add TransactionModal for handling stock import/export
const TransactionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    transaction: Omit<InventoryTransaction, "id" | "date" | "totalPrice">
  ) => void;
  parts: Part[];
  type: "Nhập kho" | "Xuất kho";
  currentBranchId: string;
}> = ({ isOpen, onClose, onSave, parts, type, currentBranchId }) => {
  const [partId, setPartId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [unitPrice, setUnitPrice] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      setPartId("");
      setQuantity(1);
      setNotes("");
      setUnitPrice(undefined);
    }
  }, [isOpen]);

  const selectedPart = parts.find((p) => p.id === partId);
  const maxQuantity =
    type === "Xuất kho" ? selectedPart?.stock[currentBranchId] || 0 : Infinity;

  const handleSubmit = () => {
    if (
      !partId ||
      quantity <= 0 ||
      (type === "Xuất kho" && quantity > maxQuantity)
    )
      return;

    const part = parts.find((p) => p.id === partId);
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            {type === "Nhập kho" ? "Tạo Phiếu Nhập Kho" : "Tạo Phiếu Xuất Kho"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phụ tùng
              </label>
              <select
                value={partId}
                onChange={(e) => {
                  setPartId(e.target.value);
                  const selected = parts.find((p) => p.id === e.target.value);
                  if (type === "Nhập kho" && selected) {
                    setUnitPrice(selected.price);
                  }
                }}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Chọn phụ tùng --</option>
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) - Tồn: {p.stock[currentBranchId] || 0}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Số lượng
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                max={type === "Xuất kho" ? maxQuantity : undefined}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
              />
              {type === "Xuất kho" && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tồn kho hiện tại: {maxQuantity}
                </p>
              )}
            </div>
            {type === "Nhập kho" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Đơn giá nhập
                </label>
                <input
                  type="number"
                  value={unitPrice ?? ""}
                  onChange={(e) => setUnitPrice(Number(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ghi chú
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Nhập hàng từ nhà cung cấp A"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 flex justify-end space-x-3 border-t dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Trở về
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};

// Fix: Add HistoryModal to view transaction history for a part
const HistoryModal: React.FC<{
  part: Part | null;
  transactions: InventoryTransaction[];
  onClose: () => void;
  storeSettings: StoreSettings;
}> = ({ part, transactions, onClose, storeSettings }) => {
  const partTransactions = useMemo(() => {
    if (!part) return [];
    return transactions
      .filter((t) => t.partId === part.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [part, transactions]);

  if (!part) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Lịch sử giao dịch: {part.name}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto">
          {partTransactions.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              Không có giao dịch nào cho phụ tùng này.
            </p>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                <tr>
                  <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">
                    Ngày
                  </th>
                  <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">
                    Loại
                  </th>
                  <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">
                    Số lượng
                  </th>
                  <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">
                    Chi nhánh
                  </th>
                  <th className="p-2 font-semibold text-slate-700 dark:text-slate-300">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody>
                {partTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b dark:border-slate-700">
                    <td className="p-2 text-slate-800 dark:text-slate-200">
                      {tx.date}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          tx.type === "Nhập kho"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-2 font-medium text-slate-800 dark:text-slate-200">
                      {tx.quantity}
                    </td>
                    <td className="p-2 text-slate-800 dark:text-slate-200">
                      {storeSettings.branches.find((b) => b.id === tx.branchId)
                        ?.name || tx.branchId}
                    </td>
                    <td className="p-2 text-sm text-slate-600 dark:text-slate-400">
                      {tx.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 mt-auto border-t dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

const TransferStockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (transfer: {
    partId: string;
    fromBranchId: string;
    toBranchId: string;
    quantity: number;
    notes: string;
  }) => void;
  parts: Part[];
  branches: { id: string; name: string }[];
  currentBranchId: string;
}> = ({ isOpen, onClose, onSave, parts, branches, currentBranchId }) => {
  const [partId, setPartId] = useState("");
  const [fromBranchId, setFromBranchId] = useState(currentBranchId);
  const [toBranchId, setToBranchId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPartId("");
      setFromBranchId(currentBranchId);
      setToBranchId("");
      setQuantity(1);
      setNotes("");
    }
  }, [isOpen, currentBranchId]);

  const selectedPart = parts.find((p) => p.id === partId);
  const maxQuantity = selectedPart?.stock[fromBranchId] || 0;
  const isFormInvalid =
    !partId ||
    !fromBranchId ||
    !toBranchId ||
    fromBranchId === toBranchId ||
    quantity <= 0 ||
    quantity > maxQuantity;

  const handleSubmit = () => {
    if (isFormInvalid) return;
    onSave({ partId, fromBranchId, toBranchId, quantity, notes });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Tạo Phiếu Chuyển Kho
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Phụ tùng
              </label>
              <select
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
              >
                <option value="">-- Chọn phụ tùng --</option>
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Từ chi nhánh
                </label>
                <select
                  value={fromBranchId}
                  onChange={(e) => setFromBranchId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Đến chi nhánh
                </label>
                <select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
                  disabled={!fromBranchId}
                >
                  <option value="">-- Chọn --</option>
                  {branches
                    .filter((b) => b.id !== fromBranchId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Số lượng chuyển
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                max={maxQuantity}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tồn kho tại chi nhánh nguồn: {maxQuantity}
              </p>
              {quantity > maxQuantity && (
                <p className="text-red-500 text-xs mt-1">
                  Số lượng vượt quá tồn kho!
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ghi chú
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Điều chuyển hàng cuối tháng"
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 flex justify-end space-x-3 border-t dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Trở về
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isFormInvalid}
            className="bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
          >
            Tạo phiếu
          </button>
        </div>
      </div>
    </div>
  );
};

const CategorySettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  onAdd: (name: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}> = ({ isOpen, onClose, categories, onAdd, onEdit, onDelete }) => {
  const [editingCategories, setEditingCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEditingCategories([...categories]);
      setNewCategoryName("");
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
      setEditingCategories((prev) => [...prev, trimmedName]);
      setNewCategoryName("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Cài đặt Danh mục sản phẩm
          </h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-3">
          {editingCategories.map((cat, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={cat}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      `Bạn có chắc muốn xóa danh mục "${categories[index]}"? Các sản phẩm thuộc danh mục này sẽ được chuyển về "Chưa phân loại".`
                    )
                  ) {
                    onDelete(categories[index]);
                  }
                }}
                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md flex-shrink-0"
                title="Xóa danh mục"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <div className="pt-4 border-t dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Thêm danh mục mới
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Tên danh mục mới..."
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddNewCategory();
                }}
              />
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="px-4 py-2 bg-sky-600 text-white rounded-md text-sm font-medium hover:bg-sky-700 flex-shrink-0"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 mt-auto border-t dark:border-slate-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            <ArrowUturnLeftIcon className="w-5 h-5" />
            Trở về
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600"
          >
            Lưu thay đổi
          </button>
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

type ActiveTab = "inventory" | "catalog" | "history";

const InventoryManager: React.FC<InventoryManagerProps> = ({
  currentUser,
  parts,
  setParts,
  transactions,
  setTransactions,
  currentBranchId,
  storeSettings,
}) => {
  // General State
  const [activeTab, setActiveTab] = useState<ActiveTab>("inventory");
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<
    "Nhập kho" | "Xuất kho"
  >("Nhập kho");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tab-specific State
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryPage, setInventoryPage] = useState(1);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogPage, setCatalogPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [historyPage, setHistoryPage] = useState(1);

  const searchGetters: Record<ActiveTab, string> = {
    inventory: inventorySearch,
    catalog: catalogSearch,
    history: historySearch,
  };
  const searchSetters: Record<
    ActiveTab,
    React.Dispatch<React.SetStateAction<string>>
  > = {
    inventory: setInventorySearch,
    catalog: setCatalogSearch,
    history: setHistorySearch,
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    searchSetters[activeTab](e.target.value);

  const allCategories = useMemo(
    () =>
      Array.from(
        new Set(parts.map((p) => p.category).filter((c): c is string => !!c))
      ).sort(),
    [parts]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleSavePart = (part: Part) => {
    setParts((prev) => {
      const exists = prev.some((p) => p.id === part.id);
      return exists
        ? prev.map((p) => (p.id === part.id ? part : p))
        : [part, ...prev];
    });
  };

  const handleDeletePart = (partId: string) => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa phụ tùng này? Hành động này không thể hoàn tác."
      )
    ) {
      setParts((prev) => prev.filter((p) => p.id !== partId));
    }
  };

  const handleSelectPartFromCatalog = (
    catalogPart: Omit<Part, "id" | "stock">
  ) => {
    const newPartForModal: Part = {
      id: "", // Signal to PartModal that this is a new part
      stock: {},
      ...catalogPart,
    };
    setSelectedPart(newPartForModal);
    setIsPartModalOpen(true);
  };

  const handleSaveTransaction = (
    transaction: Omit<InventoryTransaction, "id" | "date" | "totalPrice">
  ) => {
    const newTransaction: InventoryTransaction = {
      id: `T-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      totalPrice: (transaction.unitPrice || 0) * transaction.quantity,
      ...transaction,
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id === newTransaction.partId) {
          const newStock = { ...p.stock };
          const currentStock = newStock[newTransaction.branchId] || 0;
          newStock[newTransaction.branchId] =
            newTransaction.type === "Nhập kho"
              ? currentStock + newTransaction.quantity
              : currentStock - newTransaction.quantity;

          const updatedPart = { ...p, stock: newStock };
          if (newTransaction.type === "Nhập kho" && newTransaction.unitPrice) {
            updatedPart.price = newTransaction.unitPrice;
          }
          return updatedPart;
        }
        return p;
      })
    );
    setIsTransactionModalOpen(false);
  };

  const handleSaveTransfer = (transfer: {
    partId: string;
    fromBranchId: string;
    toBranchId: string;
    quantity: number;
    notes: string;
  }) => {
    const transferId = `TR-${Date.now()}`;

    const part = parts.find((p) => p.id === transfer.partId);
    if (!part) return;

    const exportTx: InventoryTransaction = {
      id: `T-EXP-${transferId}`,
      type: "Xuất kho",
      partId: transfer.partId,
      partName: part.name,
      quantity: transfer.quantity,
      date: new Date().toISOString().split("T")[0],
      notes: `Chuyển đến ${
        storeSettings.branches.find((b) => b.id === transfer.toBranchId)?.name
      }. ${transfer.notes}`,
      unitPrice: part.price,
      totalPrice: part.price * transfer.quantity,
      branchId: transfer.fromBranchId,
      transferId,
    };
    const importTx: InventoryTransaction = {
      id: `T-IMP-${transferId}`,
      type: "Nhập kho",
      partId: transfer.partId,
      partName: part.name,
      quantity: transfer.quantity,
      date: new Date().toISOString().split("T")[0],
      notes: `Nhận từ ${
        storeSettings.branches.find((b) => b.id === transfer.fromBranchId)?.name
      }. ${transfer.notes}`,
      unitPrice: part.price,
      totalPrice: part.price * transfer.quantity,
      branchId: transfer.toBranchId,
      transferId,
    };

    setTransactions((prev) => [exportTx, importTx, ...prev]);

    setParts((prevParts) =>
      prevParts.map((p) => {
        if (p.id === transfer.partId) {
          const newStock = { ...p.stock };
          newStock[transfer.fromBranchId] =
            (newStock[transfer.fromBranchId] || 0) - transfer.quantity;
          newStock[transfer.toBranchId] =
            (newStock[transfer.toBranchId] || 0) + transfer.quantity;
          return { ...p, stock: newStock };
        }
        return p;
      })
    );
    setIsTransferModalOpen(false);
  };

  const handleCategoryAction = (
    action: "add" | "edit" | "delete",
    payload: any
  ) => {
    switch (action) {
      case "add":
        // The onAdd in PartModal will already handle this via callback
        break;
      case "edit":
        setParts((prev) =>
          prev.map((p) =>
            p.category === payload.oldName
              ? { ...p, category: payload.newName }
              : p
          )
        );
        break;
      case "delete":
        setParts((prev) =>
          prev.map((p) =>
            p.category === payload.name
              ? { ...p, category: "Chưa phân loại" }
              : p
          )
        );
        break;
    }
  };

  const TabButton: React.FC<{
    tabId: ActiveTab;
    icon: React.ReactNode;
    label: string;
  }> = ({ tabId, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        activeTab === tabId
          ? "border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400"
          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Modals */}
      <PartModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSave={handleSavePart}
        part={selectedPart}
        parts={parts}
        allCategories={allCategories}
        onAddCategory={(name) => handleCategoryAction("add", { name })}
        currentBranchId={currentBranchId}
      />
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={handleSaveTransaction}
        parts={parts}
        type={transactionType}
        currentBranchId={currentBranchId}
      />
      <HistoryModal
        part={selectedPart}
        transactions={transactions}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedPart(null);
        }}
        storeSettings={storeSettings}
      />
      <TransferStockModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSave={handleSaveTransfer}
        parts={parts}
        branches={storeSettings.branches}
        currentBranchId={currentBranchId}
      />
      <CategorySettingsModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={allCategories}
        onAdd={(name) => handleCategoryAction("add", { name })}
        onEdit={(oldName, newName) =>
          handleCategoryAction("edit", { oldName, newName })
        }
        onDelete={(name) => handleCategoryAction("delete", { name })}
      />

      {/* Header and Actions */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchGetters[activeTab]}
            onChange={handleSearchChange}
            className="w-full sm:w-72 p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-slate-100"
          />
          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === "inventory" && (
              <>
                <button
                  onClick={() => {
                    setSelectedPart(null);
                    setIsPartModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-sky-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-sky-700 text-sm"
                >
                  <PlusIcon /> Thêm SP
                </button>
                <Link
                  to="/inventory/goods-receipt/new"
                  className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-green-700 text-sm"
                >
                  <CloudArrowUpIcon /> Phiếu nhập
                </Link>
                <button
                  onClick={() => {
                    setTransactionType("Xuất kho");
                    setIsTransactionModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-red-600 text-sm"
                >
                  <MinusIcon /> Xuất lẻ
                </button>
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="flex items-center gap-2 bg-orange-500 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-orange-600 text-sm"
                >
                  <ArrowsRightLeftIcon /> Chuyển kho
                </button>
              </>
            )}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
              title="Cài đặt danh mục"
            >
              <Cog6ToothIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <TabButton
            tabId="inventory"
            icon={<ArchiveBoxIcon className="w-5 h-5" />}
            label="Tồn kho"
          />
          <TabButton
            tabId="catalog"
            icon={<ClockIcon className="w-5 h-5" />}
            label="Danh mục sản phẩm"
          />
          <TabButton
            tabId="history"
            icon={<ArrowsRightLeftIcon className="w-5 h-5" />}
            label="Lịch sử"
          />
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "inventory" && (
        <div>{/* Existing Inventory List component content */}</div>
      )}
      {activeTab === "catalog" && (
        <div>{/* New Product Catalog component content */}</div>
      )}
      {activeTab === "history" && (
        <div>{/* New Transaction History component content */}</div>
      )}
    </div>
  );
};

export default InventoryManager;
