import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cb-bg py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        
        {/* Navigation Link */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to CottBook
          </Link>
        </div>

        {/* Main Document Card */}
        <div className="neu-card p-8 sm:p-12" style={{ borderRadius: "24px" }}>
          
          {/* Header */}
          <div className="border-b border-gray-200 pb-8 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-700 shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair tracking-tight">
                  CottBook Privacy Policy
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Last Updated: August 18, 2026 &middot; Scope: cottbook.com, app.cottbook.com, api.cottbook.com
                </p>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed mt-4">
              CottBook is committed to safeguarding the commercial confidentiality, proprietary trade secrets, and personal information of cotton brokers, commission agents, and their commercial counterparties.
            </p>
          </div>

          {/* Document Content */}
          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
            
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">1.</span> Introduction and Regulatory Framework
              </h2>
              <p className="text-gray-700">
                This Privacy Policy outlines our data handling practices in compliance with:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>The Information Technology Act, 2000 (Section 43A and Section 72A).</li>
                <li>The Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.</li>
                <li>The Digital Personal Data Protection Act, 2023 (DPDP Act, India).</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">2.</span> Legal Capacity: Broker as Data Fiduciary vs. CottBook as Data Processor
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Broker as Data Fiduciary / Controller:</strong> The Broker acts as the primary Data Fiduciary regarding all buyer, seller, ginner, spinner, transporter, and farmer information uploaded into their tenant workspace. The Broker is solely responsible for ensuring lawful collection, commercial consent, and verification of third-party statutory identifiers (GSTIN, PAN, APMC license numbers).
                </li>
                <li>
                  <strong className="text-gray-900">CottBook as Data Processor / Service Provider:</strong> CottBook processes tenant transactional data strictly on the instructions of the Subscriber to execute software calculations, generate PDF confirmation notes, dispatch invoices, and render operational dashboards.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">3.</span> Categories of Information Collected
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">A. Broker Account &amp; Authentication Data</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Full name, administrative username, business email address, verified mobile phone number.</li>
                    <li>Encrypted password hashes (PBKDF2/SHA256) and session tokens (JWT).</li>
                    <li>IP address, browser user-agent, authentication attempt logs, and audit logs.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-1">B. Brokerage Firm Data</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Firm Name, Trade Tagline, Registered Office Address, Branch Locations.</li>
                    <li>GSTIN, PAN, APMC/Mandi License Numbers, State/Jurisdiction details.</li>
                    <li>Uploaded firm letterhead graphic files, stamps, and logos.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-800 mb-1">C. Commercial Party &amp; Transactional Records (Proprietary Asset)</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li><strong className="text-gray-700">Party Master Directories:</strong> Company names, contact persons, phone numbers, addresses, GSTINs, APMC mandi codes.</li>
                    <li><strong className="text-gray-700">Trade Parameters:</strong> Bargain (sauda) ID numbers, cotton crop varieties (e.g., Shankar-6, MCU-5, J-34, MECH-1), staple length, micronaire, moisture limits, rate per candy/quintal, payment terms.</li>
                    <li><strong className="text-gray-700">Logistics &amp; Settlement:</strong> Passing entries, delivery challans, truck numbers, weightment slips, tare deductions, brokerage invoices, and payment receipts.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">4.</span> How We Use Collected Information
              </h2>
              <p className="text-gray-700">We process data strictly for operational SaaS functions:</p>
              <ul className="space-y-2 list-disc pl-5 text-gray-600">
                <li>Authenticating authorized operators and securing database records.</li>
                <li>Executing core calculations (brokerage fees, split allocations, tax distributions).</li>
                <li>Compiling and rendering downloadable PDF documents (Bargain Confirmations, Passing Slips, Brokerage Bills).</li>
                <li>Facilitating user-requested dispatch of trade records via WhatsApp, SMS, or Email.</li>
                <li>Transmitting critical account notices, OTPs, billing confirmations, and security alerts.</li>
                <li>Maintaining tenant audit trails to detect unauthorized logins or data manipulation.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">5.</span> Confidentiality of Trade Secrets &amp; Zero Data Monetization
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Trade Secret Protection:</strong> Client party networks, rate sheets, and broker-commission arrangements in the cotton market are recognized as confidential business trade secrets.
                </li>
                <li>
                  <strong className="text-gray-900">Zero Data Sales:</strong> CottBook does not sell, rent, monetize, or commercialize Subscriber data or Party Master records.
                </li>
                <li>
                  <strong className="text-gray-900">No Trading Exploitation or Market Intelligence:</strong> CottBook will never inspect, aggregate, or utilize your client networks, bargain rates, or brokerage margins to trade commodities, inform market competitors, or power speculative trade algorithms.
                </li>
                <li>
                  <strong className="text-gray-900">Strict Logical Multi-Tenancy:</strong> Each brokerage firm&apos;s database records are isolated with explicit tenant ownership constraints. No other broker on the Platform can view or search your records.
                </li>
                <li>
                  <strong className="text-gray-900">Internal Access Restrictions:</strong> CottBook engineers are strictly prohibited from viewing tenant transactional data unless explicitly authorized in writing by the Subscriber for support troubleshooting.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">6.</span> Sub-processors and Cloud Infrastructure
              </h2>
              <p className="text-gray-700">
                We employ trusted, industry-leading cloud service providers under strict confidentiality agreements:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Database Infrastructure:</strong> Supabase Inc. (PostgreSQL database clusters hosted in regional, ISO/IEC 27001 certified data centers with SSL-enforced connections).
                </li>
                <li>
                  <strong className="text-gray-900">Application Hosting:</strong> Render Services, Inc. (Backend API orchestration) and Vercel, Inc. (Frontend edge application hosting).
                </li>
                <li>
                  <strong className="text-gray-900">Storage Systems:</strong> AWS S3 / Cloud Storage for securely storing uploaded letterhead images and generated PDF caches.
                </li>
                <li>
                  <strong className="text-gray-900">Communication APIs:</strong> Authorized telecommunication gateways and Meta/WhatsApp Cloud APIs used exclusively to send user-triggered OTPs and trade PDFs.
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">7.</span> Data Security &amp; Storage Safeguards
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">In-Transit Encryption:</strong> All communication between user web browsers, mobile interfaces, and api.cottbook.com is encrypted via Transport Layer Security (TLS 1.3 / HTTPS).
                </li>
                <li>
                  <strong className="text-gray-900">At-Rest Protection:</strong> Databases utilize automated snapshotting, restricted IP tables, principle of least privilege access, and salted password hashing algorithms.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">8.</span> Data Portability, Exit Rights, and Right to Erasure
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">No Vendor Lock-In &amp; Portability:</strong> Subscribers can request and download their complete raw party lists, deal registers, and billing records at any time in structured JSON/CSV/PDF formats.
                </li>
                <li>
                  <strong className="text-gray-900">Right to Permanent Purge:</strong> Upon voluntary account closure or formal written request to our Grievance Officer, CottBook will permanently delete and cryptographically scrub all tenant database schemas and uploaded letterhead assets within sixty (60) days.
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">9.</span> Cookies and Local Storage
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>CottBook uses essential session cookies, JSON Web Tokens (JWT) in local storage, and UI preference caches to maintain login state and dashboard functionality.</li>
                <li>CottBook does not utilize third-party cross-site advertising tracking cookies.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="space-y-3 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">10.</span> Grievance Officer &amp; Contact Information
              </h2>
              <p className="text-gray-600">
                For privacy inquiries, data deletion requests, or formal concerns under the Information Technology Act, 2000 or the Digital Personal Data Protection Act, 2023, contact:
              </p>
              <div className="bg-cb-bg shadow-neu-inset rounded-xl p-4 space-y-1.5 mt-2">
                <p><strong className="text-gray-800">Designated Entity:</strong> Grievance Officer, CottBook Platform</p>
                <p><strong className="text-gray-800">Operational Address:</strong> Indore, Madhya Pradesh, India</p>
                <p><strong className="text-gray-800">Privacy Contact Email:</strong> <a href="mailto:cottbook2026@gmail.com" className="text-cb-primary hover:underline">cottbook2026@gmail.com</a></p>
                <p><strong className="text-gray-800">Support &amp; Legal Email:</strong> <a href="mailto:cottbook2026@gmail.com" className="text-cb-primary hover:underline">cottbook2026@gmail.com</a></p>
                <p><strong className="text-gray-800">Website:</strong> <a href="https://cottbook.com" target="_blank" rel="noopener noreferrer" className="text-cb-primary hover:underline">https://cottbook.com</a> &middot; <a href="https://app.cottbook.com" target="_blank" rel="noopener noreferrer" className="text-cb-primary hover:underline">https://app.cottbook.com</a></p>
              </div>
            </section>

          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 mt-6 pb-6">
          &copy; 2026 CottBook. All rights reserved.
        </div>

      </div>
    </div>
  );
}
