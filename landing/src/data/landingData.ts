export const APP_LINKS = {
  login: "https://app.cottbook.com/login",
  register: "https://app.cottbook.com/register",
  supportEmail: "cottbook2026@gmail.com",
};

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Security & Trust", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

export const HERO_STATS = [
  { value: "18,400+", label: "Bales Audited This Month" },
  { value: "100%", label: "Tenant Data Isolation" },
  { value: "< 30 Sec", label: "To Generate Branded PDF Slips" },
  { value: "0%", label: "Commissions Overlooked" },
];

export const BEFORE_AFTER_ITEMS = [
  {
    pain: "Verbal deals made over phone calls, leading to disputes over rates, payment days, and variety.",
    solution: "1-Click branded contract slips with unique Smart Deal IDs automatically sent to WhatsApp.",
  },
  {
    pain: "Passing notes, Lot numbers, and PR numbers lost in messy WhatsApp chats and paper diaries.",
    solution: "Centralized Passing register with live remaining bale counters that prevent accidental over-dispatch.",
  },
  {
    pain: "Manual calculators needed for tare weight deduction, candy-to-quintal conversions, and brokerage.",
    solution: "Automated cotton calculation engine that computes financial values, net weights, and GST brokerage instantly.",
  },
  {
    pain: "Late night calls to ginners and spinning mills trying to reconcile which deals have pending dispatches.",
    solution: "Instant Party Ledgers showing booked vs. dispatched bales, spot delivery gaps, and unentered trades.",
  },
  {
    pain: "Brokerage commission bills delayed for weeks because offline logs are scattered across notebooks.",
    solution: "1-Click GST-compliant brokerage invoices generated per candy or quintal with direct payment tracking.",
  },
];

export interface FeatureTab {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  badge: string;
  description: string;
  bulletPoints: string[];
  mockupData: {
    dealId: string;
    buyer: string;
    seller: string;
    variety: string;
    station: string;
    bales: number;
    rate: string;
    status: string;
    metrics: { label: string; value: string }[];
  };
}

export const FEATURE_TABS: FeatureTab[] = [
  {
    id: "bargain-entry",
    title: "Instant Contract Notes (Bargain Entry)",
    shortTitle: "Bargain Entry",
    badge: "Deal Speed",
    tagline: "Turn verbal saudas into legal branded PDF contracts in under 30 seconds.",
    description:
      "Record buyers, sellers, cotton varieties (Shankar-6, MCU-5, DCH-32, MECH), candy rates, delivery stations, and credit terms. Supports split deals (BargainSplit) for complex multi-party orders.",
    bulletPoints: [
      "Custom branded PDF slips with your firm's official letterhead banner",
      "Instant 1-click share directly to buyer & seller WhatsApp numbers",
      "Automatic Smart Deal ID sequencing (e.g. 26-27/112) per financial year",
      "Dynamic payment condition rules (Dispatch Date, Delivery, Advance)",
    ],
    mockupData: {
      dealId: "26-27/112",
      buyer: "Vardhman Textiles Ltd (Ludhiana)",
      seller: "Shubham Cotton Industries (Amravati)",
      variety: "Shankar-6 (29mm, 3.8+ Mic)",
      station: "Amravati (Maharashtra)",
      bales: 100,
      rate: "₹ 58,500 / Candy",
      status: "Ready for WhatsApp",
      metrics: [
        { label: "Total Value", value: "₹ 29,25,000" },
        { label: "Payment Terms", value: "30 Days from Dispatch" },
        { label: "Weight Terms", value: "Mill Weight (170 Kg Net)" },
      ],
    },
  },
  {
    id: "passing-approval",
    title: "Quality Passing & Lot Approval",
    shortTitle: "Passing & Quality",
    badge: "Zero Over-Dispatch",
    tagline: "Log Lot Numbers and approved bales with strict balance enforcement.",
    description:
      "Manage quality passing approvals before truck dispatches. Enter Lot No, PR No, and passed bale quantities. The built-in counter guarantees you never dispatch more than the booked agreement.",
    bulletPoints: [
      "Track Lot No, PR No, and mill approved bale counts in real time",
      "Real-time remaining bale balance calculator that blocks excess dispatch",
      "Status alerts for pending passing inspections and laboratory reports",
      "Seamless passing-to-delivery handoff with automated notification logs",
    ],
    mockupData: {
      dealId: "26-27/119",
      buyer: "Tirupati Spinning Mills Pvt Ltd",
      seller: "Mahalaxmi Cottons & Agro Industries",
      variety: "Shankar-6 (28.5mm)",
      station: "Rajkot (Gujarat)",
      bales: 300,
      rate: "₹ 61,500 / Candy",
      status: "Passed & Approved",
      metrics: [
        { label: "Lot No", value: "LOT-93/94 (PR #402)" },
        { label: "Passed Bales", value: "300 / 300 Bales" },
        { label: "Moisture / Trash", value: "7.8% | 2.1%" },
      ],
    },
  },
  {
    id: "delivery-tracking",
    title: "Delivery & Logistics Tracking",
    shortTitle: "Delivery & Trucks",
    badge: "Full Traceability",
    tagline: "Track truck deliveries, weighbridge slips, and transporter LR numbers.",
    description:
      "Bridge the gap between ginning press factory dispatch and mill weighbridge acceptance. Support both Passing-linked truck dispatches and Direct Mill drop deliveries.",
    bulletPoints: [
      "Record Vehicle No, Driver Mobile, Transporter, and LR Consignment No",
      "Tare weight, gross weight, and net cotton weight deduction logging",
      "Instant notification slips with delivery dispatch dates",
      "Cross-check physical weighbridge receipts against booked sauda volume",
    ],
    mockupData: {
      dealId: "26-27/127",
      buyer: "Kishan Agro Ginning Factory",
      seller: "Narmada Ginning & Pressing",
      variety: "MCU-5 (31mm Super)",
      station: "Dhamnod (M.P.)",
      bales: 100,
      rate: "₹ 64,000 / Candy",
      status: "Truck Dispatched",
      metrics: [
        { label: "Truck No", value: "MP-09-GH-8821" },
        { label: "Net Bales / Weight", value: "100 Bales (16,840 Kg)" },
        { label: "Transporter / LR", value: "Shree Balaji Roadlines #4412" },
      ],
    },
  },
  {
    id: "party-reconciliation",
    title: "Party Ledger & Deal Reconciliation",
    shortTitle: "Party Auditor",
    badge: "Auditor Mode",
    tagline: "Reconcile trades against offline notes and catch missed saudas in seconds.",
    description:
      "Select any ginner, mill, or trader. CottBook cross-references every deal struck, actual bales booked, deliveries dispatched, and remaining pending balances for 100% audit peace of mind.",
    bulletPoints: [
      "Single-party reconciliation view across customizable date ranges",
      "Instantly discover unentered deals or discrepancies before year-end books close",
      "Export full audit statements to Excel (.xlsx) with clean formula rows",
      "Formal PDF printout matching traditional cotton brokerage ledger sheets",
    ],
    mockupData: {
      dealId: "AUDIT-2026",
      buyer: "Om Sai Spinners (Guntur)",
      seller: "Multi-Ginner Aggregate",
      variety: "Shankar-6 & MCU-5",
      station: "Guntur (Andhra Pradesh)",
      bales: 2600,
      rate: "₹ 60,000 - ₹ 63,500",
      status: "Reconciled Clean",
      metrics: [
        { label: "Deals Done", value: "6 Total Bargains" },
        { label: "Bales Dispatched", value: "1,900 Dispatched" },
        { label: "Pending Bales", value: "700 Bales Balance" },
      ],
    },
  },
  {
    id: "brokerage-invoicing",
    title: "1-Click GST Brokerage Invoicing",
    shortTitle: "Brokerage Billing",
    badge: "Automated Revenue",
    tagline: "Eliminate unpaid commissions with automated GST brokerage statements.",
    description:
      "Generate official tax invoices for buyer brokerage and seller commission. Auto-calculate rates per candy or per quintal with CGST/SGST/IGST breakdown.",
    bulletPoints: [
      "1-Click GST brokerage bill generation with customizable HSN/SAC codes",
      "Party Dues register tracking pending receivables and payment receipts",
      "Statement of Account showing billed vs. received payments with live balance",
      "Export to Tally or Excel for seamless accountant bookkeeping",
    ],
    mockupData: {
      dealId: "BILL-2026/048",
      buyer: "Shree Vallabh Cottons (Kadi)",
      seller: "Commission Brokerage Account",
      variety: "Candy Brokerage @ ₹100/Candy",
      station: "Kadi (Gujarat)",
      bales: 500,
      rate: "₹ 100.00 / Candy",
      status: "GST Bill Generated",
      metrics: [
        { label: "Taxable Commission", value: "₹ 50,000.00" },
        { label: "GST (18% IGST)", value: "₹ 9,000.00" },
        { label: "Total Receivable", value: "₹ 59,000.00" },
      ],
    },
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Set Up Your Firm in 2 Minutes",
    description:
      "Create your private tenant account. Upload your existing broker firm letterhead, address, GSTIN, and import your buyer and ginner party directory.",
  },
  {
    step: "02",
    title: "Punch Verbal Saudas in 30 Seconds",
    description:
      "Select parties from your lightning-fast party directory, enter bales, rate, and delivery terms. Download or 1-click WhatsApp the official confirmation note.",
  },
  {
    step: "03",
    title: "Auto-Track & Collect Brokerage",
    description:
      "As deliveries happen, update passings and truck dispatches. Reconcile party balances and generate GST brokerage invoices with 1 click.",
  },
];

export const SECURITY_PILLARS = [
  {
    title: "Isolated Multi-Tenant Architecture",
    description:
      "Your party master, private contact numbers, commission rates, and sauda archives are strictly isolated at the database level. No other broker or user can ever inspect your trade books.",
    iconName: "ShieldCheck",
  },
  {
    title: "Zero Commercial Data Sharing",
    description:
      "CottBook is an independent technology software company—not a commodity trader, ginner, or cotton merchant. We do not sell, aggregate, or monetize your trade intelligence.",
    iconName: "Lock",
  },
  {
    title: "100% Data Ownership & Portability",
    description:
      "Your data is always yours. Export your complete deal registry, party ledger, passing records, and delivery history to Excel or PDF with one click whenever you need.",
    iconName: "Download",
  },
];

export const PRICING_PLANS = [
  {
    name: "Independent Broker",
    badge: "Solo Practitioner",
    popular: false,
    monthlyPrice: 1999,
    annualPrice: 1599,
    description: "Essential operating system for independent cotton brokers striking daily regional saudas.",
    features: [
      "Unlimited Bargain / Sauda Entry",
      "Instant Branded PDF Contract Slips",
      "1-Click WhatsApp Slip Sharing",
      "Party Master Directory (Unlimited Parties)",
      "Basic Delivery & Status Tracking",
      "Single Broker Login",
      "Email & WhatsApp Support",
    ],
    ctaText: "Start 14-Day Free Trial",
  },
  {
    name: "Brokerage Firm",
    badge: "Most Popular",
    popular: true,
    monthlyPrice: 3999,
    annualPrice: 3199,
    description: "The complete suite for high-volume brokerage agencies managing multiple stations and passings.",
    features: [
      "Everything in Independent Broker, plus:",
      "Full Passing & Quality Approval Register",
      "Split Delivery & Multi-Truck Logistics",
      "Party Ledger & Bale Reconciliation (Auditor Mode)",
      "1-Click GST Brokerage Invoicing & Dues",
      "Custom Firm Letterhead & Signature Embedding",
      "Export All Data to Excel (.xlsx)",
      "Up to 3 Staff / Operator Logins",
      "Priority Phone & Remote Support",
    ],
    ctaText: "Start 14-Day Free Trial",
  },
  {
    name: "Agency Enterprise",
    badge: "Multi-Branch",
    popular: false,
    monthlyPrice: 7999,
    annualPrice: 6399,
    description: "Tailored for large cotton commission houses with interstate branches and high volume.",
    features: [
      "Everything in Brokerage Firm, plus:",
      "Unlimited Multi-User / Operator Accounts",
      "Multi-Firm Letterhead Switching",
      "Advanced Role-Based Permissions (Auditor / Data Entry)",
      "Dedicated Database Backup & SLA Guarantee",
      "Custom Excel Export Formats for Accounting Teams",
      "Dedicated Account Manager & Fast Onboarding",
    ],
    ctaText: "Start 14-Day Free Trial",
  },
];

export const FAQS = [
  {
    question: "Can my buyers, ginners, or competitor brokers see my trade data?",
    answer:
      "Never. CottBook operates on a strict multi-tenant cryptographic isolation architecture. Your party directory, buyer rates, seller names, and trade volumes are completely encrypted and private to your tenant account. No competitor or external party has access to your books.",
  },
  {
    question: "Can I use my firm's existing letterhead banner and logo on PDF slips?",
    answer:
      "Yes! In your Firm Settings, you can upload your custom letterhead image banner or logo. CottBook automatically embeds your official branding into every generated Bargain Confirmation Note, Delivery Slip, and GST Brokerage Invoice.",
  },
  {
    question: "How does the 14-day free trial work?",
    answer:
      "You get instant, unrestricted access to all features for 14 days. No credit card or advance payment is required. You can punch real saudas, generate PDF slips, and test party ledger reconciliations right away.",
  },
  {
    question: "Can I use CottBook on my mobile phone or tablet while traveling in mandis?",
    answer:
      "Yes. CottBook is 100% cloud-based and fully responsive on any smartphone, iPad, tablet, or laptop. You can punch a deal directly from the mandi or ginnery and WhatsApp the contract note instantly from your phone.",
  },
  {
    question: "How does CottBook handle split deals (BargainSplit) across multiple deliveries?",
    answer:
      "CottBook natively supports split deals. If a 500-bale sauda is delivered across 5 different trucks with distinct Lot numbers or passing dates, CottBook logs each split delivery under the parent deal and automatically updates remaining bale balances.",
  },
  {
    question: "Can I export my entire trade archive to Excel for my accountant?",
    answer:
      "Yes. With one click, you can export your entire deal register, party directories, passing logs, and party reconciliation statements into clean, formatted Excel (.xlsx) files compatible with Tally and ERP systems.",
  },
];
