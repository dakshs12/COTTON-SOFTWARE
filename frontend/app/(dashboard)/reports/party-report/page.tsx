"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import api from "@/lib/api";
import { Toast } from "@/app/components/Toast";
import CustomDatePicker from "@/app/components/CustomDatePicker";
import * as XLSX from "xlsx";
import {
  Search,
  Printer,
  Download,
  ChevronDown,
  BookOpen,
  Users,
  Building2,
  FileText,
  Calendar,
  Filter,
  Check,
  Clock,
  Truck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Phone,
  Hash,
  RefreshCw,
  Info
} from "lucide-react";

interface PartyLite {
  id: number;
  company_name: string;
  station: string;
  party_type: string;
}

interface FirmLite {
  id: number;
  firm_name: string;
  city: string;
}

interface DealLedgerItem {
  deal_no: number;
  smart_deal_id: string;
  bargain_date: string;
  formatted_date: string;
  role: "Buyer" | "Seller";
  role_label: string;
  counterparty_name: string;
  counterparty_station: string;
  seller_name: string;
  buyer_name: string;
  station: string;
  variety: string;
  rate: number;
  unit: string;
  booked_bales: number;
  dispatched_bales: number;
  pending_bales: number;
  status: "Pending" | "In-Passing" | "Dispatched";
  original_status: string;
  lot_no?: string;
  book_bargain_no?: string;
}

interface LedgerSummary {
  total_deals: number;
  total_booked_bales: number;
  total_dispatched_bales: number;
  total_pending_bales: number;
}

interface SelectedPartyInfo {
  id: number;
  party_code: string;
  company_name: string;
  station: string;
  state: string;
  party_type: string;
  contact_person: string;
  mobile: string;
  gst_no: string;
}

interface DirectoryParty {
  id: number;
  party_code: string;
  company_name: string;
  station: string;
  state: string;
  party_type: string;
  contact_person: string;
  mobile: string;
  gst_no: string;
  total_deals: number;
}

export default function PartyReportPage() {
  // Global & Tab State
  const [activeTab, setActiveTab] = useState<"ledger" | "directory">("ledger");
  const [firms, setFirms] = useState<FirmLite[]>([]);
  const [parties, setParties] = useState<PartyLite[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // -------------------------------------------------------------
  // TAB 1: Party Ledger State
  // -------------------------------------------------------------
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [partySearchQuery, setPartySearchQuery] = useState("");
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const partyDropdownRef = useRef<HTMLDivElement>(null);
  const partyInputRef = useRef<HTMLInputElement>(null);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<"all" | "buyer" | "seller">("all");

  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummary | null>(null);
  const [ledgerDeals, setLedgerDeals] = useState<DealLedgerItem[]>([]);
  const [selectedPartyData, setSelectedPartyData] = useState<SelectedPartyInfo | null>(null);

  // -------------------------------------------------------------
  // TAB 2: Party Directory State
  // -------------------------------------------------------------
  const [directoryData, setDirectoryData] = useState<DirectoryParty[]>([]);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [dirSearchQuery, setDirSearchQuery] = useState("");
  const [dirRoleFilter, setDirRoleFilter] = useState<"all" | "buyer" | "seller" | "trader">("all");
  const [dirStationFilter, setDirStationFilter] = useState<string>("all");
  const [isStationDropdownOpen, setIsStationDropdownOpen] = useState(false);
  const [stationSearchText, setStationSearchText] = useState("All Stations");
  const stationDropdownRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // Init & FY Setup
  // -------------------------------------------------------------
  useEffect(() => {
    // Calculate current Indian Financial Year (April 1 to today)
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    const fyStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;

    const start = `${fyStartYear}-04-01`;
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const end = `${yyyy}-${mm}-${dd}`;

    setStartDate(start);
    setEndDate(end);

    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [firmsRes, partiesRes] = await Promise.all([
        api.get("firms/lite/"),
        api.get("parties/lite/")
      ]);
      setFirms(firmsRes.data || []);
      setParties(partiesRes.data || []);
      setLoadingInitial(false);
    } catch (error) {
      console.error("Error loading initial parties & firms:", error);
      showToast("Error loading base metadata", "error");
      setLoadingInitial(false);
    }
  };

  // Close dropdowns when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        partyDropdownRef.current &&
        !partyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPartyDropdownOpen(false);
      }
      if (
        stationDropdownRef.current &&
        !stationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Directory when user switches to Directory tab
  useEffect(() => {
    if (activeTab === "directory" && directoryData.length === 0) {
      fetchDirectory();
    }
  }, [activeTab]);

  // Fetch Ledger when filters change
  useEffect(() => {
    if (selectedPartyId) {
      fetchLedger();
    }
  }, [selectedPartyId, startDate, endDate, roleFilter]);

  // -------------------------------------------------------------
  // API Calls
  // -------------------------------------------------------------
  const fetchLedger = async () => {
    if (!selectedPartyId) return;
    setLedgerLoading(true);
    try {
      let url = `bargains/party_ledger/?party_id=${selectedPartyId}&role=${roleFilter}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      const res = await api.get(url);
      setLedgerSummary(res.data.summary);
      setLedgerDeals(res.data.deals || []);
      setSelectedPartyData(res.data.party || null);
    } catch (error) {
      console.error("Error fetching party ledger:", error);
      showToast("Failed to fetch ledger details.", "error");
    } finally {
      setLedgerLoading(false);
    }
  };

  const fetchDirectory = async () => {
    setDirectoryLoading(true);
    try {
      const res = await api.get("parties/directory/");
      setDirectoryData(res.data || []);
    } catch (error) {
      console.error("Error fetching party directory:", error);
      showToast("Failed to fetch party directory.", "error");
    } finally {
      setDirectoryLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Quick FY / Date Preset Handlers
  // -------------------------------------------------------------
  const applyPresetFY = (type: "current_fy" | "last_30_days" | "all_time") => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (type === "current_fy") {
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const fyStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;
      setStartDate(`${fyStartYear}-04-01`);
      setEndDate(todayStr);
    } else if (type === "last_30_days") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      const pY = past.getFullYear();
      const pM = String(past.getMonth() + 1).padStart(2, "0");
      const pD = String(past.getDate()).padStart(2, "0");
      setStartDate(`${pY}-${pM}-${pD}`);
      setEndDate(todayStr);
    } else if (type === "all_time") {
      setStartDate("");
      setEndDate("");
    }
  };

  // -------------------------------------------------------------
  // Filtered Parties for Dropdown
  // -------------------------------------------------------------
  const currentlySelectedParty = parties.find((p) => p.id === selectedPartyId);
  const primaryFirm = firms.length > 0 ? firms[0] : null;

  const isSelectedPartyTrader = useMemo(() => {
    const type = selectedPartyData?.party_type || currentlySelectedParty?.party_type || "";
    return type.toLowerCase() === "trader";
  }, [selectedPartyData, currentlySelectedParty]);

  const isPartyMatched = useMemo(() => {
    return parties.some(
      (p) =>
        partySearchQuery.trim() ===
        (p.station ? `${p.company_name} (${p.station})` : p.company_name) ||
        partySearchQuery.trim().toLowerCase() === p.company_name.toLowerCase()
    );
  }, [parties, partySearchQuery]);

  const filteredPartiesList = useMemo(() => {
    if (!partySearchQuery.trim() || isPartyMatched) return parties;
    const q = partySearchQuery.toLowerCase();
    return parties.filter(
      (p) =>
        p.company_name.toLowerCase().includes(q) ||
        (p.station && p.station.toLowerCase().includes(q))
    );
  }, [parties, partySearchQuery, isPartyMatched]);

  // Synchronize input text with currently selected party
  useEffect(() => {
    if (currentlySelectedParty) {
      setPartySearchQuery(
        currentlySelectedParty.station
          ? `${currentlySelectedParty.company_name} (${currentlySelectedParty.station})`
          : currentlySelectedParty.company_name
      );
    } else {
      setPartySearchQuery("");
    }
  }, [currentlySelectedParty]);

  // -------------------------------------------------------------
  // Filtered Directory Data
  // -------------------------------------------------------------
  const uniqueStations = useMemo(() => {
    const stations = new Set<string>();
    directoryData.forEach((p) => {
      if (p.station) stations.add(p.station.trim());
    });
    return Array.from(stations).sort();
  }, [directoryData]);

  const stationOptions = useMemo(() => {
    return ["All Stations", ...uniqueStations];
  }, [uniqueStations]);

  const isStationMatched = useMemo(() => {
    return stationOptions.some(
      (s) => s.toLowerCase() === stationSearchText.trim().toLowerCase()
    );
  }, [stationOptions, stationSearchText]);

  const filteredStations = useMemo(() => {
    if (!stationSearchText.trim() || isStationMatched) return stationOptions;
    const q = stationSearchText.toLowerCase();
    return stationOptions.filter((s) => s.toLowerCase().includes(q));
  }, [stationOptions, stationSearchText, isStationMatched]);

  useEffect(() => {
    if (dirStationFilter === "all") {
      setStationSearchText("All Stations");
    } else {
      setStationSearchText(dirStationFilter);
    }
  }, [dirStationFilter]);

  const filteredDirectory = useMemo(() => {
    return directoryData.filter((item) => {
      // Search
      if (dirSearchQuery.trim()) {
        const q = dirSearchQuery.toLowerCase();
        const matchesName = item.company_name?.toLowerCase().includes(q);
        const matchesStation = item.station?.toLowerCase().includes(q);
        const matchesContact = item.contact_person?.toLowerCase().includes(q);
        const matchesGst = item.gst_no?.toLowerCase().includes(q);
        const matchesMobile = item.mobile?.toLowerCase().includes(q);
        if (!matchesName && !matchesStation && !matchesContact && !matchesGst && !matchesMobile) {
          return false;
        }
      }

      // Role filter: 'buyer' -> Mill, Buyer; 'seller' -> Ginner, Seller; 'trader' -> Trader
      if (dirRoleFilter === "buyer") {
        if (!["Buyer", "Mill"].includes(item.party_type)) return false;
      } else if (dirRoleFilter === "seller") {
        if (!["Seller", "Ginner"].includes(item.party_type)) return false;
      } else if (dirRoleFilter === "trader") {
        if (item.party_type !== "Trader") return false;
      }

      // Station filter
      if (dirStationFilter !== "all") {
        if (item.station !== dirStationFilter) return false;
      }

      return true;
    });
  }, [directoryData, dirSearchQuery, dirRoleFilter, dirStationFilter]);

  // -------------------------------------------------------------
  // Export to Excel (.xlsx) Handlers
  // -------------------------------------------------------------
  const handleExportLedgerExcel = () => {
    if (!selectedPartyData || ledgerDeals.length === 0) {
      showToast("No deals to export for the selected party.", "error");
      return;
    }

    const aoa: any[][] = [];

    // Header Rows
    aoa.push([primaryFirm ? primaryFirm.firm_name : "CottBook Deals Audit"]);
    aoa.push(["PARTY LEDGER"]);
    aoa.push([
      `Party: ${selectedPartyData.company_name} | Station: ${selectedPartyData.station || "N/A"} | GSTIN: ${selectedPartyData.gst_no || "N/A"}`
    ]);
    aoa.push([
      `Date Range: ${startDate || "Earliest"} to ${endDate || "Latest"} | Role Filter: ${roleFilter.toUpperCase()}`
    ]);
    aoa.push([]); // Blank row

    // Summary Cards Row in Excel
    aoa.push([
      `Total Deals: ${ledgerSummary?.total_deals || 0}`,
      `Total Booked Bales: ${ledgerSummary?.total_booked_bales || 0}`,
      `Total Dispatched Bales: ${ledgerSummary?.total_dispatched_bales || 0}`,
      `Total Pending Bales: ${ledgerSummary?.total_pending_bales || 0}`
    ]);
    aoa.push([]); // Blank row

    // Table Column Headers
    const headers = [
      "Deal Date",
      "Deal No / Smart ID",
      "Counterparty",
      ...(isSelectedPartyTrader ? ["Role"] : []),
      "Rate (₹)",
      "Unit",
      "Bales",
      "DISPATCHED",
      "Pending Bales",
      "Status"
    ];
    aoa.push(headers);

    // Data Rows
    const dataStartRow = aoa.length + 1; // 1-indexed
    ledgerDeals.forEach((d) => {
      aoa.push([
        d.formatted_date,
        d.smart_deal_id,
        `${d.counterparty_name} (${d.counterparty_station})`,
        ...(isSelectedPartyTrader ? [d.role_label] : []),
        d.rate,
        d.unit,
        d.booked_bales,
        d.dispatched_bales,
        d.pending_bales,
        d.status
      ]);
    });
    const dataEndRow = aoa.length;

    // Formula-driven Total Row
    const balesCol = isSelectedPartyTrader ? "G" : "F";
    const dispCol = isSelectedPartyTrader ? "H" : "G";
    const pendCol = isSelectedPartyTrader ? "I" : "H";
    const totalRow = [
      "GRAND TOTAL",
      ...Array(isSelectedPartyTrader ? 5 : 4).fill(""),
      { t: "n", f: `SUM(${balesCol}${dataStartRow}:${balesCol}${dataEndRow})` },
      { t: "n", f: `SUM(${dispCol}${dataStartRow}:${dispCol}${dataEndRow})` },
      { t: "n", f: `SUM(${pendCol}${dataStartRow}:${pendCol}${dataEndRow})` },
      ""
    ];
    aoa.push(totalRow);

    // Footer Watermark row strictly at the bottom border
    aoa.push([]);
    aoa.push([
      `Generated via CottBook — Software for Cotton Brokers • Exported on ${new Date().toLocaleString("en-IN")}`
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Merge titles
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 10 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } },
      { s: { r: 5, c: 2 }, e: { r: 5, c: 4 } },
      { s: { r: 5, c: 5 }, e: { r: 5, c: 7 } },
      { s: { r: 5, c: 8 }, e: { r: 5, c: 10 } },
      { s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: 10 } }
    ];

    // Column widths
    worksheet["!cols"] = [
      { wch: 14 }, // Date
      { wch: 16 }, // Deal No
      { wch: 38 }, // Counterparty
      { wch: 14 }, // Role
      { wch: 22 }, // Variety
      { wch: 14 }, // Rate
      { wch: 10 }, // Unit
      { wch: 20 }, // Booked Bales
      { wch: 18 }, // Dispatched Bales
      { wch: 16 }, // Pending Bales
      { wch: 14 }  // Status
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Party Ledger");

    const safePartyName = selectedPartyData.company_name.replace(/[^a-zA-Z0-9]/g, "_");
    XLSX.writeFile(
      workbook,
      `Party_Ledger_${safePartyName}_${startDate || "All"}_to_${endDate || "Today"}.xlsx`
    );
    showToast("Party Ledger exported to Excel successfully!");
  };

  const handleExportDirectoryExcel = () => {
    if (filteredDirectory.length === 0) {
      showToast("No party directory records to export.", "error");
      return;
    }

    const aoa: any[][] = [];

    // Header Rows
    aoa.push([primaryFirm ? primaryFirm.firm_name : "CottBook Register"]);
    aoa.push(["PARTY DIRECTORY & REGISTER"]);
    aoa.push([
      `Filter Role: ${dirRoleFilter.toUpperCase()} | Station: ${dirStationFilter.toUpperCase()} | Total Parties: ${filteredDirectory.length}`
    ]);
    aoa.push([]); // Blank row

    // Table Column Headers
    aoa.push([
      "Party Code",
      "Party Name",
      "Station / City",
      "State",
      "Party Type / Role",
      "Contact Person",
      "Mobile No",
      "GSTIN",
      "Total Deals Associated"
    ]);

    const dataStartRow = aoa.length + 1;
    filteredDirectory.forEach((p) => {
      aoa.push([
        p.party_code || "",
        p.company_name,
        p.station || "",
        p.state || "",
        p.party_type || "",
        p.contact_person || "",
        p.mobile || "",
        p.gst_no || "",
        p.total_deals || 0
      ]);
    });
    const dataEndRow = aoa.length;

    // Total Row
    aoa.push([
      "TOTAL PARTIES",
      filteredDirectory.length,
      "",
      "",
      "",
      "",
      "",
      "TOTAL DEALS",
      { t: "n", f: `SUM(I${dataStartRow}:I${dataEndRow})` }
    ]);

    // Footer Watermark strictly at the bottom
    aoa.push([]);
    aoa.push([
      `Generated via CottBook — Software for Cotton Brokers • Exported on ${new Date().toLocaleString("en-IN")}`
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
      { s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: 8 } }
    ];

    worksheet["!cols"] = [
      { wch: 14 }, // Party Code
      { wch: 38 }, // Party Name
      { wch: 18 }, // Station
      { wch: 14 }, // State
      { wch: 18 }, // Type
      { wch: 22 }, // Contact Person
      { wch: 16 }, // Mobile
      { wch: 20 }, // GSTIN
      { wch: 24 }  // Deals
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Party Directory");

    XLSX.writeFile(workbook, `Party_Directory_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast("Party Directory exported to Excel successfully!");
  };

  // -------------------------------------------------------------
  // Print / PDF Handler
  // -------------------------------------------------------------
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 print:max-w-none print:w-full print:m-0 print:p-0 print:space-y-4">
      {/* -------------------------------------------------------------
          TOP HEADER (Hidden in Print)
      ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-playfair-display), serif",
              color: "var(--cb-text-heading)"
            }}
          >
            Party Report
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--cb-text-secondary)" }}>
            Bargain & bale reconciliation ledger, offline trade auditing, and comprehensive party directory.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-[#f8f6f4] border border-[#e2dfda] shadow-[inset_2px_2px_4px_#d1cec7,inset_-2px_-2px_4px_#ffffff]">
          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${activeTab === "ledger"
              ? "bg-[#65a34e] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
              }`}
          >
            <BookOpen size={16} className={activeTab === "ledger" ? "text-white" : "text-gray-500"} />
            <span>Party Ledger</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ${activeTab === "directory"
              ? "bg-[#65a34e] text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
              }`}
          >
            <Users size={16} className={activeTab === "directory" ? "text-white" : "text-gray-500"} />
            <span>Party Directory</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          PRINT HEADER (Visible ONLY during Print / PDF)
      ------------------------------------------------------------- */}
      <div className="hidden print:block border-b-2 border-gray-800 mb-6">
        <div className="flex justify-between items-start pb-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-wide uppercase">
              {primaryFirm ? primaryFirm.firm_name : "CottBook Cotton Broker"}
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Cotton Broker & Commission Agent • Station: {primaryFirm?.city || "Indore"}
            </p>
          </div>
          <div className="text-right">
            {activeTab !== "ledger" && (
              <h2 className="text-lg font-bold text-gray-800">
                PARTY DIRECTORY & REGISTER
              </h2>
            )}
            <p className="text-xs text-gray-500">
              Generated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        {activeTab === "ledger" && (
          <div className="border-t border-gray-300 py-2.5 text-center flex items-center justify-center">
            <h2 className="text-base font-black text-gray-900 tracking-wider uppercase leading-none">
              PARTY LEDGER
            </h2>
          </div>
        )}
      </div>

      {/* =============================================================
          TAB 1: PARTY LEDGER (DEAL & BALE RECONCILIATION)
      ============================================================= */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          {/* Controls & Filter Card */}
          <div className="neu-card p-4 sm:p-6 print:hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--cb-text-heading)" }}>
                  Party Deal Audit & Reconciliation Parameters
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a party to reconcile bargains, compare actual dispatched bales, and identify unbooked offline trades.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={handleExportLedgerExcel}
                  disabled={!selectedPartyId || ledgerDeals.length === 0}
                  className="neu-btn neu-btn-action flex-1 md:flex-initial text-xs py-2 px-3"
                  title="Export full ledger reconciliation to Excel (.xlsx)"
                >
                  <Download size={15} />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!selectedPartyId || ledgerDeals.length === 0}
                  className="neu-btn neu-btn-action flex-1 md:flex-initial text-xs py-2 px-3"
                  title="Print or save as clean PDF"
                >
                  <Printer size={15} />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Party Selector Dropdown (col-span-4) */}
              <div className="md:col-span-4 relative" ref={partyDropdownRef}>
                <label className="neu-label">Select Party</label>
                <div className="relative">
                  <input
                    ref={partyInputRef}
                    type="text"
                    value={partySearchQuery}
                    onChange={(e) => {
                      setPartySearchQuery(e.target.value);
                      setIsPartyDropdownOpen(true);
                    }}
                    onFocus={() => setIsPartyDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => {
                        setIsPartyDropdownOpen(false);
                        if (currentlySelectedParty) {
                          setPartySearchQuery(
                            currentlySelectedParty.station
                              ? `${currentlySelectedParty.company_name} (${currentlySelectedParty.station})`
                              : currentlySelectedParty.company_name
                          );
                        } else {
                          setPartySearchQuery("");
                        }
                      }, 200)
                    }
                    placeholder="Choose a Party"
                    className="neu-input cursor-pointer pr-10"
                    autoComplete="off"
                  />
                  <ChevronDown
                    size={16}
                    className={`absolute right-3 top-3 pointer-events-none transition-transform duration-200 ${isPartyDropdownOpen ? "rotate-180" : ""
                      }`}
                    style={{ color: "var(--cb-text-label)" }}
                  />

                  {isPartyDropdownOpen && (
                    <ul className="neu-dropdown">
                      {filteredPartiesList.map((party) => {
                        const isSelected = selectedPartyId === party.id;
                        return (
                          <li
                            key={party.id}
                            onMouseDown={() => {
                              setSelectedPartyId(party.id);
                              const label = party.station
                                ? `${party.company_name} (${party.station})`
                                : party.company_name;
                              setPartySearchQuery(label);
                              setIsPartyDropdownOpen(false);
                            }}
                            className={isSelected ? "bg-[#65a34e]/10 font-bold" : ""}
                          >
                            <div>
                              <span className="font-semibold block text-xs">
                                {party.company_name}
                              </span>
                              <span className="text-[11px] text-gray-500 font-normal">
                                {party.station ? `${party.station} • ` : ""}{party.party_type}
                              </span>
                            </div>
                            {isSelected && (
                              <Check
                                size={14}
                                style={{ color: "var(--cb-primary)" }}
                                strokeWidth={2.5}
                              />
                            )}
                          </li>
                        );
                      })}
                      {filteredPartiesList.length === 0 && (
                        <li className="italic text-gray-400 text-xs cursor-default">
                          No matching parties
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Date Pickers (col-span-4) */}
              <div className="md:col-span-4 grid grid-cols-2 gap-3">
                <CustomDatePicker
                  label="From Date"
                  value={startDate}
                  onChange={setStartDate}
                />
                <CustomDatePicker
                  label="To Date"
                  value={endDate}
                  onChange={setEndDate}
                />
              </div>

              {/* Role Filter Pills (col-span-4) */}
              <div className="md:col-span-4">
                <label className="neu-label">Trade Role Filter</label>
                <div className="flex items-center p-1 rounded-xl h-[42px] bg-[#f8f6f4] border border-[#e2dfda] shadow-[inset_2px_2px_4px_#d1cec7,inset_-2px_-2px_4px_#ffffff]">
                  <button
                    type="button"
                    onClick={() => setRoleFilter("all")}
                    className={`flex-1 h-full text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${roleFilter === "all"
                      ? "bg-[#65a34e] text-white font-bold shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                      }`}
                  >
                    All Trades
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("buyer")}
                    className={`flex-1 h-full text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${roleFilter === "buyer"
                      ? "bg-[#65a34e] text-white font-bold shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                      }`}
                  >
                    As Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter("seller")}
                    className={`flex-1 h-full text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${roleFilter === "seller"
                      ? "bg-[#65a34e] text-white font-bold shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                      }`}
                  >
                    As Seller
                  </button>
                </div>
              </div>
            </div>

            {/* Quick FY Presets */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-gray-400" />
                Quick Presets:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPresetFY("current_fy")}
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                >
                  Current FY (Apr - Mar)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetFY("last_30_days")}
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                >
                  Last 30 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetFY("all_time")}
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors cursor-pointer"
                >
                  All Time Deals
                </button>
              </div>
            </div>
          </div>

          {/* Selected Party Info & Summary Cards */}
          {selectedPartyId && selectedPartyData && (
            <div className="space-y-6">
              {/* Selected Party Summary Ribbon */}
              <div className="neu-card p-4 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-[#4a7fc4] print:shadow-none print:border print:border-gray-300 print:mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg print:hidden">
                    {selectedPartyData.company_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {selectedPartyData.company_name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="print:hidden" /> {selectedPartyData.station} ({selectedPartyData.state || "India"})
                      </span>
                      {selectedPartyData.gst_no && (
                        <span className="flex items-center gap-1">
                          <Hash size={12} className="print:hidden" /> GSTIN: {selectedPartyData.gst_no}
                        </span>
                      )}
                      {selectedPartyData.contact_person && (
                        <span className="flex items-center gap-1 print:hidden">
                          <Phone size={12} /> {selectedPartyData.contact_person} ({selectedPartyData.mobile})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* On Screen: Type and Code badges */}
                <div className="flex items-center gap-2 print:hidden">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    Type: {selectedPartyData.party_type}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Code: {selectedPartyData.party_code}
                  </span>
                </div>

                {/* In Print: Period, Trade Role, Contact details (Shifted parallel to party info on left) */}
                <div className="hidden print:block text-right text-xs text-gray-700 space-y-1">
                  <p>
                    <strong className="text-gray-900">Period:</strong> {startDate || "Earliest"} to {endDate || "Latest"}
                  </p>
                  <p>
                    <strong className="text-gray-900">Trade Role:</strong>{" "}
                    {roleFilter === "all"
                      ? "All Trades (Buyer & Seller)"
                      : roleFilter === "buyer"
                      ? "As Buyer"
                      : "As Seller"}
                  </p>
                  <p>
                    <strong className="text-gray-900">Contact:</strong>{" "}
                    {selectedPartyData.contact_person || "-"} {selectedPartyData.mobile ? `(${selectedPartyData.mobile})` : ""}
                  </p>
                </div>
              </div>

              {/* Top 4 Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
                {/* 1. Total Deals */}
                <div className="neu-card p-4 sm:p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total Deals Done
                    </span>
                    <FileText size={18} className="text-blue-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-[#04294E]">
                    {ledgerSummary?.total_deals || 0}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Bargains entered in system
                  </p>
                </div>

                {/* 2. Total Booked Bales (Main Audit Metric) */}
                <div className="neu-card p-4 sm:p-5 flex flex-col justify-between border-b-2 border-b-[#4a7fc4]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#4a7fc4] uppercase tracking-wider">
                      Total Bales Entered
                    </span>
                    <TrendingUp size={18} className="text-[#4a7fc4]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#4a7fc4]">
                    {(ledgerSummary?.total_booked_bales || 0).toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Main audit metric vs notes
                  </p>
                </div>

                {/* 3. Total Dispatched Bales */}
                <div className="neu-card p-4 sm:p-5 flex flex-col justify-between border-b-2 border-b-emerald-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Total Dispatched
                    </span>
                    <Truck size={18} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
                    {(ledgerSummary?.total_dispatched_bales || 0).toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    From linked truck deliveries
                  </p>
                </div>

                {/* 4. Total Pending Bales */}
                <div className="neu-card p-4 sm:p-5 flex flex-col justify-between border-b-2 border-b-amber-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                      Total Pending Bales
                    </span>
                    <Clock size={18} className="text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-700">
                    {(ledgerSummary?.total_pending_bales || 0).toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Remaining to be dispatched
                  </p>
                </div>
              </div>

              {/* Ledger Deals Table */}
              <div className="neu-card overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#faf9f8] print:hidden">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm tracking-wide uppercase">
                      PARTY LEDGER
                    </h4>
                  </div>
                  {ledgerLoading && (
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                      <RefreshCw size={14} className="animate-spin" /> Fetching latest deals...
                    </div>
                  )}
                </div>

                {/* Screen Table View */}
                <div className="overflow-x-auto print:hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-3 whitespace-nowrap">Deal Date</th>
                        <th className="py-3 px-3 whitespace-nowrap">Deal ID</th>
                        <th className="py-3 px-3">Counterparty</th>
                        {isSelectedPartyTrader && (
                          <th className="py-3 px-3 whitespace-nowrap">Role</th>
                        )}
                        <th className="py-3 px-3 text-right whitespace-nowrap">Rate</th>
                        <th className="py-3 px-3 text-right font-bold text-gray-800 whitespace-nowrap bg-blue-50/50">
                          Bales
                        </th>
                        <th className="py-3 px-3 text-right whitespace-nowrap">DISPATCHED</th>
                        <th className="py-3 px-3 text-right whitespace-nowrap">Pending</th>
                        <th className="py-3 px-3 text-center whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {ledgerDeals.length === 0 ? (
                        <tr>
                          <td colSpan={isSelectedPartyTrader ? 9 : 8} className="py-12 text-center text-gray-400">
                            <Info size={36} className="mx-auto mb-2 opacity-30" />
                            <p className="font-medium text-sm text-gray-600">
                              No deals found for this party in the selected date range.
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Try expanding the date range or selecting "All Trades".
                            </p>
                          </td>
                        </tr>
                      ) : (
                        ledgerDeals.map((deal) => (
                          <tr
                            key={deal.deal_no}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            {/* Deal Date */}
                            <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-700">
                              {deal.formatted_date}
                            </td>

                            {/* Deal No / Smart ID */}
                            <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-gray-900">
                              {deal.smart_deal_id}
                            </td>

                            {/* Counterparty */}
                            <td className="py-3 px-3">
                              <span className="font-bold text-gray-900 block truncate max-w-xs">
                                {deal.counterparty_name}
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {deal.counterparty_station}
                              </span>
                            </td>

                            {/* Role (Bought From / Sold To) - Only for Traders */}
                            {isSelectedPartyTrader && (
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${deal.role === "Buyer"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-emerald-100 text-emerald-800"
                                    }`}
                                >
                                  {deal.role_label}
                                </span>
                              </td>
                            )}

                            {/* Rate */}
                            <td className="py-3 px-3 text-right whitespace-nowrap font-medium text-gray-800">
                              ₹ {deal.rate % 1 === 0
                                ? deal.rate.toLocaleString("en-IN")
                                : deal.rate.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                              <span className="text-[10px] text-gray-400 block">
                                /{deal.unit || "Candy"}
                              </span>
                            </td>

                            {/* Total Booked Bales (Prominent Font) */}
                            <td className="py-3 px-3 text-right font-extrabold text-sm text-[#04294E] whitespace-nowrap bg-blue-50/40">
                              {deal.booked_bales.toLocaleString("en-IN")}
                            </td>

                            {/* DISPATCHED */}
                            <td className="py-3 px-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                              {deal.dispatched_bales.toLocaleString("en-IN")}
                            </td>

                            {/* Pending Bales */}
                            <td className="py-3 px-3 text-right font-medium text-amber-700 whitespace-nowrap">
                              {deal.pending_bales.toLocaleString("en-IN")}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${deal.status === "Dispatched"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : deal.status === "In-Passing"
                                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                                    : "bg-amber-100 text-amber-800 border border-amber-300"
                                  }`}
                              >
                                {deal.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>

                    {/* Table Footer: Pinned Total Row */}
                    {ledgerDeals.length > 0 && (
                      <tfoot className="border-t-2 border-gray-300 bg-gray-50/90 font-bold text-gray-900">
                        <tr>
                          <td colSpan={isSelectedPartyTrader ? 5 : 4} className="py-3.5 px-3 text-right uppercase tracking-wider text-xs">
                            GRAND TOTAL:
                          </td>
                          {/* Pinned Grand Sum: Booked Bales */}
                          <td className="py-3.5 px-3 text-right text-sm font-black text-[#04294E] bg-blue-100/60 border-x border-blue-200">
                            {(ledgerSummary?.total_booked_bales || 0).toLocaleString("en-IN")}
                          </td>
                          {/* Pinned Grand Sum: Dispatched Bales */}
                          <td className="py-3.5 px-3 text-right text-sm font-black text-emerald-800">
                            {(ledgerSummary?.total_dispatched_bales || 0).toLocaleString("en-IN")}
                          </td>
                          {/* Pinned Grand Sum: Pending Bales */}
                          <td className="py-3.5 px-3 text-right text-sm font-bold text-amber-800">
                            {(ledgerSummary?.total_pending_bales || 0).toLocaleString("en-IN")}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {/* PDF Print Table View (Strictly 7 Columns) */}
                <div className="hidden print:block overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs border border-gray-400">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-400 font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3 border-r border-gray-300 whitespace-nowrap text-left">DEAL DATE</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-left">COUNTERPARTY</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-left">STATION</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-right">BALES</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-right whitespace-nowrap">RATE / PC</th>
                        <th className="py-2.5 px-3 border-r border-gray-300 text-left whitespace-nowrap">LOT NO</th>
                        <th className="py-2.5 px-3 text-left whitespace-nowrap">BARGAIN / PO NO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                      {ledgerDeals.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-gray-500">
                            No deals found for this party in the selected date range.
                          </td>
                        </tr>
                      ) : (
                        ledgerDeals.map((deal) => (
                          <tr key={deal.deal_no} className="border-b border-gray-200">
                            {/* DEAL DATE */}
                            <td className="py-2 px-3 border-r border-gray-200 whitespace-nowrap text-gray-800 font-medium">
                              {deal.formatted_date}
                            </td>

                            {/* COUNTERPARTY */}
                            <td className="py-2 px-3 border-r border-gray-200 font-bold text-gray-900">
                              {deal.counterparty_name}
                            </td>

                            {/* STATION */}
                            <td className="py-2 px-3 border-r border-gray-200 text-gray-700">
                              {deal.counterparty_station || deal.station || "-"}
                            </td>

                            {/* BALES */}
                            <td className="py-2 px-3 border-r border-gray-200 text-right font-black text-gray-900">
                              {deal.booked_bales.toLocaleString("en-IN")}
                            </td>

                            {/* RATE / PC */}
                            <td className="py-2 px-3 border-r border-gray-200 text-right text-gray-800 font-medium whitespace-nowrap">
                              {deal.rate % 1 === 0
                                ? deal.rate.toLocaleString("en-IN")
                                : deal.rate.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                            </td>

                            {/* LOT NO */}
                            <td className="py-2 px-3 border-r border-gray-200 font-mono text-gray-800">
                              {deal.lot_no || "-"}
                            </td>

                            {/* BARGAIN NO */}
                            <td className="py-2 px-3 font-mono font-bold text-gray-900">
                              {deal.book_bargain_no && deal.book_bargain_no !== deal.smart_deal_id
                                ? `${deal.smart_deal_id} (${deal.book_bargain_no})`
                                : deal.smart_deal_id}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {ledgerDeals.length > 0 && (
                      <tfoot className="border-t-2 border-gray-400 bg-gray-100 font-bold text-gray-900">
                        <tr>
                          <td colSpan={3} className="py-2.5 px-3 text-right uppercase tracking-wider text-xs border-r border-gray-300">
                            GRAND TOTAL:
                          </td>
                          <td className="py-2.5 px-3 text-right text-xs font-black text-gray-900 border-r border-gray-300">
                            {(ledgerSummary?.total_booked_bales || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-300"></td>
                          <td className="py-2.5 px-3 border-r border-gray-300"></td>
                          <td className="py-2.5 px-3"></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Initial State when no party is selected */}
          {!selectedPartyId && (
            <div className="neu-card p-12 text-center text-gray-400 print:hidden">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <BookOpen size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Select a Party to Begin Deal Reconciliation
              </h3>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setIsPartyDropdownOpen(true);
                    partyInputRef.current?.focus();
                  }}
                  className="neu-btn neu-btn-primary text-xs py-2 px-4"
                >
                  <Search size={14} /> Open Party Selector
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          TAB 2: PARTY DIRECTORY / LIST
      ============================================================= */}
      {activeTab === "directory" && (
        <div className="space-y-6">
          {/* Controls Card */}
          <div className="neu-card p-4 sm:p-6 print:hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--cb-text-heading)" }}>
                  Party Directory & Registered Entities
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Instant directory lookup with contact persons, station filters, and total deals strike counts.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                  onClick={handleExportDirectoryExcel}
                  disabled={filteredDirectory.length === 0}
                  className="neu-btn neu-btn-action flex-1 md:flex-initial text-xs py-2 px-3"
                  title="Export complete party directory to Excel"
                >
                  <Download size={15} />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={handlePrint}
                  disabled={filteredDirectory.length === 0}
                  className="neu-btn neu-btn-action flex-1 md:flex-initial text-xs py-2 px-3"
                  title="Print party directory register"
                >
                  <Printer size={15} />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Quick Search Bar (col-span-5) */}
              <div className="md:col-span-5 relative">
                <label className="neu-label">Quick Search Entity</label>
                <div className="relative">
                  <Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search Party Name, Station, Contact Person, GSTIN..."
                    className="neu-input pr-10 text-xs h-[42px]"
                    value={dirSearchQuery}
                    onChange={(e) => setDirSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Tabs / Pills (col-span-4) */}
              <div className="md:col-span-4">
                <label className="neu-label">Entity Role Filter</label>
                <div className="flex items-center p-1 rounded-xl h-[42px] bg-[#f8f6f4] border border-[#e2dfda] shadow-[inset_2px_2px_4px_#d1cec7,inset_-2px_-2px_4px_#ffffff]">
                  <button
                    type="button"
                    onClick={() => setDirRoleFilter("all")}
                    className={`flex-1 h-full text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${dirRoleFilter === "all"
                      ? "bg-[#65a34e] text-white font-bold shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                      }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirRoleFilter("buyer")}
                    className={`flex-1 h-full text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${dirRoleFilter === "buyer"
                      ? "bg-[#65a34e] text-white font-bold shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                      }`}
                  >
                    Buyers
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirRoleFilter("seller")}
                    className={`flex-1 h-full text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${dirRoleFilter === "seller"
                      ? "bg-[#65a34e] text-white font-bold shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                      }`}
                  >
                    Sellers
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirRoleFilter("trader")}
                    className={`flex-1 h-full text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center ${dirRoleFilter === "trader"
                      ? "bg-[#65a34e] text-white font-bold shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
                      }`}
                  >
                    Traders
                  </button>
                </div>
              </div>

              {/* State / Station Filter Dropdown (col-span-3) */}
              <div className="md:col-span-3 relative" ref={stationDropdownRef}>
                <label className="neu-label">Station / City Filter</label>
                <div className="relative">
                  <input
                    type="text"
                    value={stationSearchText}
                    onChange={(e) => {
                      setStationSearchText(e.target.value);
                      setIsStationDropdownOpen(true);
                    }}
                    onFocus={() => setIsStationDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => {
                        setIsStationDropdownOpen(false);
                        setStationSearchText(
                          dirStationFilter === "all" ? "All Stations" : dirStationFilter
                        );
                      }, 200)
                    }
                    placeholder="All Stations"
                    className="neu-input cursor-pointer pr-10"
                    autoComplete="off"
                  />
                  <ChevronDown
                    size={16}
                    className={`absolute right-3 top-3 pointer-events-none transition-transform duration-200 ${isStationDropdownOpen ? "rotate-180" : ""
                      }`}
                    style={{ color: "var(--cb-text-label)" }}
                  />

                  {isStationDropdownOpen && (
                    <ul className="neu-dropdown">
                      {filteredStations.map((station) => {
                        const isSelected =
                          (station === "All Stations" && dirStationFilter === "all") ||
                          dirStationFilter.toLowerCase() === station.toLowerCase();
                        return (
                          <li
                            key={station}
                            onMouseDown={() => {
                              if (station === "All Stations") {
                                setDirStationFilter("all");
                                setStationSearchText("All Stations");
                              } else {
                                setDirStationFilter(station);
                                setStationSearchText(station);
                              }
                              setIsStationDropdownOpen(false);
                            }}
                            className={isSelected ? "bg-[#65a34e]/10 font-bold" : ""}
                          >
                            <span className="text-xs">{station}</span>
                            {isSelected && (
                              <Check
                                size={14}
                                style={{ color: "var(--cb-primary)" }}
                                strokeWidth={2.5}
                              />
                            )}
                          </li>
                        );
                      })}
                      {filteredStations.length === 0 && (
                        <li className="italic text-gray-400 text-xs cursor-default">
                          No matching stations
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Directory Table Card */}
          <div className="neu-card overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#faf9f8] print:bg-white">
              <div>
                <h4 className="font-bold text-gray-800 text-sm">
                  Registered Party Directory Records
                </h4>
                <p className="text-xs text-gray-500">
                  Showing {filteredDirectory.length} of {directoryData.length} total parties registered.
                </p>
              </div>
              {directoryLoading && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                  <RefreshCw size={14} className="animate-spin" /> Loading directory...
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100/75 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Party Name</th>
                    <th className="py-3 px-3">Station / City</th>
                    <th className="py-3 px-3">Role / Party Type</th>
                    <th className="py-3 px-3">Contact Person & Mobile</th>
                    <th className="py-3 px-3">GSTIN</th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">Total Deals</th>
                    <th className="py-3 px-3 text-right print:hidden">Reconcile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60">
                  {filteredDirectory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Users size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="font-medium text-sm text-gray-600">
                          No parties found matching your search and filter criteria.
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Try resetting the filters or clearing the search bar.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredDirectory.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        {/* Party Name */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-900 text-sm">
                            {p.company_name}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            Code: {p.party_code}
                          </div>
                        </td>

                        {/* Station / City */}
                        <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                          <span className="font-medium">{p.station || "-"}</span>
                          {p.state && (
                            <span className="text-[11px] text-gray-400 block">
                              {p.state}
                            </span>
                          )}
                        </td>

                        {/* Role / Party Type (Color-coded chips) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${p.party_type === "Mill"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : p.party_type === "Ginner"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : p.party_type === "Trader"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : p.party_type === "Buyer"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                          >
                            {p.party_type}
                          </span>
                        </td>

                        {/* Contact Person & Mobile */}
                        <td className="py-3 px-3 text-gray-700">
                          <span className="font-medium block text-gray-800">
                            {p.contact_person || "-"}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            {p.mobile || "-"}
                          </span>
                        </td>

                        {/* GSTIN */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-gray-700">
                          {p.gst_no || "-"}
                        </td>

                        {/* Total Deals Associated (Badge Count) */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${p.total_deals > 0
                              ? "bg-blue-100 text-blue-900 border border-blue-200"
                              : "bg-gray-100 text-gray-500"
                              }`}
                          >
                            {p.total_deals} Deals
                          </span>
                        </td>

                        {/* Action: Jump to Ledger */}
                        <td className="py-3 px-3 text-right whitespace-nowrap print:hidden">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPartyId(p.id);
                              setActiveTab("ledger");
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            <span>Ledger</span>
                            <ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Table Footer */}
                {filteredDirectory.length > 0 && (
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-semibold text-gray-700">
                    <tr>
                      <td colSpan={5} className="py-3 px-3 text-xs">
                        Showing {filteredDirectory.length} entities
                      </td>
                      <td className="py-3 px-3 text-center text-xs font-bold text-blue-900">
                        Total Deals:{" "}
                        {filteredDirectory.reduce((sum, p) => sum + (p.total_deals || 0), 0)}
                      </td>
                      <td className="print:hidden"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PRINT FOOTER & STRICT WATERMARK RULE COMPLIANCE
          (Must strictly be in the page footer / bottom border)
      ------------------------------------------------------------- */}
      <div className="hidden print:block mt-12 pt-4 border-t border-gray-400 text-center text-xs text-gray-600">
        <div className="flex justify-between items-center px-2">
          <span>
            Generated via <strong>CottBook</strong> — Software for Cotton Brokers
          </span>
          <span>
            {new Date().toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <Toast message={toastMessage} />
    </div>
  );
}
