import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsPage() {
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
              <div className="p-2.5 rounded-xl bg-blue-50 text-cb-primary shadow-sm">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair tracking-tight">
                  Terms of Service
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Last Updated: August 18, 2026 &middot; Platform: CottBook (cottbook.com, app.cottbook.com, api.cottbook.com)
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mt-4">
              These Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) constitute a legally binding agreement between CottBook (&quot;CottBook&quot;, &quot;Platform&quot;, &quot;We&quot;, &quot;Us&quot;, or &quot;Our&quot;) and the business entity, cotton brokerage firm, commission agent, or individual (&quot;User&quot;, &quot;Subscriber&quot;, &quot;Broker&quot;, &quot;You&quot;, or &quot;Your&quot;) accessing or using our cloud-based brokerage management platform, mobile interfaces, APIs, and associated services.
            </p>
          </div>

          {/* Document Content */}
          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">1.</span> Platform Purpose &amp; Intermediary Status
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">SaaS Utility:</strong> CottBook is a cloud-based software-as-a-service (SaaS) workflow, digital record-keeping, calculation, and business management application designed specifically for cotton brokers, commission agents, ginning entities, traders, and spinning mill intermediaries.
                </li>
                <li>
                  <strong className="text-gray-900">Technology Intermediary Only:</strong> CottBook operates solely as a technological platform and an intermediary under Section 79 of the Information Technology Act, 2000 (India).
                </li>
                <li>
                  <strong className="text-gray-900">Not a Trading Exchange or Broker:</strong> CottBook is not a commodities exchange, broker, dealer, buyer, seller, clearinghouse, or banking institution. CottBook does not broker, execute, guarantee, settle, or finance any physical cotton trade, contract, or financial transaction recorded on the platform.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">2.</span> Broker&apos;s Absolute Ownership of Trade Data (Proprietary Asset)
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Exclusive Ownership:</strong> The Broker/Subscriber retains 100% full, exclusive, and unencumbered ownership of all data entered into CottBook. This includes Party Master directories (buyers, sellers, ginners, mills, transporters), client contact lists, custom commission arrangements, pricing history, bargain (sauda) contracts, passing reports, and financial ledgers.
                </li>
                <li>
                  <strong className="text-gray-900">No Platform Rights Over Business Data:</strong> CottBook claims zero intellectual property, proprietary interest, or commercial rights over your business records.
                </li>
                <li>
                  <strong className="text-gray-900">Strict Non-Interference:</strong> CottBook will never use, analyze, or aggregate your specific buyer-seller pairings, commission margins, trade volumes, or pricing trends to trade, compete, or provide market intelligence to any third party.
                </li>
                <li>
                  <strong className="text-gray-900">Zero Vendor Lock-In &amp; On-Demand Export:</strong> You have the absolute right to request and export your complete transactional registers, party masters, and invoices at any time in structured CSV/JSON/PDF formats.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">3.</span> Broker&apos;s Responsibility for Third-Party &amp; Party Master Data
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Lawful Collection &amp; Consent:</strong> The Broker is solely responsible for ensuring they possess lawful authority, commercial consent, or contractual rights to input the personal and commercial information of third parties (including ginning factories, spinning mills, traders, buyers, transporters, and individual farmers) into their tenant workspace.
                </li>
                <li>
                  <strong className="text-gray-900">Accuracy of Mandi &amp; Statutory Identifiers:</strong> The Broker is exclusively responsible for verifying the accuracy of party names, registered addresses, contact details, bank accounts, GSTIN, PAN, and APMC/Mandi license numbers entered into party records.
                </li>
                <li>
                  <strong className="text-gray-900">Data Fiduciary Role:</strong> Under the Indian Digital Personal Data Protection Act (DPDP Act, 2023), the Broker acts as the <span className="text-gray-900 font-semibold">Data Fiduciary/Controller</span> for their clients&apos; information, while CottBook operates strictly as a technological <span className="text-gray-900 font-semibold">Data Processor/Service Provider</span>.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">4.</span> Oral Bargains (Sauda), Verbal Contracts &amp; Market Dispute Disclaimer
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Record-Keeping Nature:</strong> In the Indian cotton trade, bargains (sauda) are frequently struck verbally over telephonic conversations. CottBook functions solely as a digital recording, calculation, and confirmation utility.
                </li>
                <li>
                  <strong className="text-gray-900">No Contractual Guarantee:</strong> Generating a PDF confirmation slip, passing note, or invoice via CottBook does not constitute a legal guarantee or contract validation by CottBook.
                </li>
                <li>
                  <strong className="text-gray-900">Trade Disputes &amp; Arbitration:</strong> CottBook is not a party to, nor liable for, any commercial disputes, contract cancellations, weight variances, quality variances (staple length, micronaire, moisture, trash), payment defaults, or bad debts between buyers, sellers, ginners, and mills. All disputes remain strictly subject to the customary trade terms agreed between the counterparties or formal arbitration bodies (e.g., Cotton Association of India - CAI, or regional APMC/trade tribunals).
                </li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">5.</span> Tax, Invoicing &amp; GST Responsibility (Including RCM &amp; TDS)
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Informational Calculation Tools:</strong> All automated mathematical utilities (brokerage per candy/quintal, tare percentage deductions, moisture/trash allowances, passing split adjustments, GST amounts) are provided for operational convenience.
                </li>
                <li>
                  <strong className="text-gray-900">Broker Compliance:</strong> The Broker bears sole and exclusive responsibility for complying with applicable Goods and Services Tax (GST) provisions—including Reverse Charge Mechanism (RCM) applicability on cotton brokerage services, TDS deductions, e-invoicing mandates, and APMC agricultural mandi fee compliance under Indian tax laws.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">6.</span> Third-Party Dispatch &amp; WhatsApp Document Sharing
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Recipient Verification:</strong> When using one-click sharing features to dispatch Bargain Slips, Delivery Orders, or Invoices via WhatsApp, SMS, or Email, the Broker is solely responsible for verifying the recipient&apos;s identity and contact details prior to transmission.
                </li>
                <li>
                  <strong className="text-gray-900">Third-Party Network Liability:</strong> CottBook bears no liability for message delays, data interception, transmission failures, or unauthorized access occurring over third-party networks (e.g., WhatsApp/Meta, telecom providers).
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">7.</span> Subscription Plans, Billing &amp; Commercial Terms
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Service Plans:</strong> Platform access is governed by paid subscription tiers:
                  <ul className="list-circle pl-5 mt-1 space-y-1 text-gray-600">
                    <li><strong className="text-gray-800">1-Year Plan:</strong> ₹ TBA per year (full brokerage management suite access, unlimited deal records, PDF generation, standard support).</li>
                    <li><strong className="text-gray-800">3-Year Plan:</strong> ₹ TBA upfront commitment (locked-in pricing equivalent to ₹25,000/year, priority support, complimentary onboarding).</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-gray-900">Trial Period:</strong> CottBook may offer a limited-duration Free Trial (typically 14 days). Upon trial expiration, continued access to active deal recording and administrative features requires activation of a paid subscription plan.
                </li>
                <li>
                  <strong className="text-gray-900">Non-Refundable:</strong> All subscription fees paid are non-refundable and non-transferable under any circumstances, including early termination or voluntary account closure.
                </li>
                <li>
                  <strong className="text-gray-900">Taxes:</strong> All stated prices are exclusive of applicable Goods and Services Tax (GST) unless explicitly noted otherwise.
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">8.</span> Intellectual Property &amp; Custom Branding
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">CottBook Ownership:</strong> All source code, database architectures, user interfaces, branding assets, algorithms, visual styles, documentation, and software features remain the exclusive intellectual property of CottBook.
                </li>
                <li>
                  <strong className="text-gray-900">Subscriber Branding:</strong> Subscribers retain full ownership over their trade names, custom logos, letterhead banners, and trade party master databases. By uploading your letterhead or logo, you grant CottBook a limited, non-exclusive license strictly to render and embed these visual assets into your firm&apos;s generated PDF bargain notes, bills, and receipts.
                </li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">9.</span> Acceptable Use &amp; Prohibited Conduct
              </h2>
              <p className="text-gray-700">You expressly agree not to:</p>
              <ul className="space-y-2 list-disc pl-5 text-gray-600">
                <li>Reverse engineer, decompile, intercept API endpoints, scrape, or extract source code from cottbook.com, api.cottbook.com, or any associated service.</li>
                <li>Enter fraudulent, fabricated, or illegal transaction details intended to evade statutory agricultural taxes, APMC mandi fees, or GST regulations.</li>
                <li>Introduce malware, automated scripts, or denial-of-service vectors that disrupt database integrity, Supabase clusters, or Render/Vercel production hosting infrastructure.</li>
                <li>Resell, white-label, or sub-license platform access to unauthorized third-party brokerages without prior written authorization from CottBook.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">10.</span> Limitation of Liability &amp; Service Availability
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">&quot;As-Is&quot; Service:</strong> CottBook is provided on an &quot;as is&quot; and &quot;as available&quot; basis. While we strive for 99.9% uptime, we do not warrant uninterrupted, error-free operations during maintenance windows, upstream cloud outages (e.g., Supabase, Render, Vercel, AWS), or telecommunication failures.
                </li>
                <li>
                  <strong className="text-gray-900">Liability Cap:</strong> To the maximum extent permitted by applicable law, CottBook’s total aggregate liability arising out of or related to these Terms shall be strictly limited to the actual subscription fees paid by You to CottBook in the three (3) months immediately preceding the event giving rise to liability.
                </li>
                <li>
                  <strong className="text-gray-900">Consequential Damages:</strong> In no event shall CottBook be liable for lost profits, loss of cotton brokerage commissions, business interruption, loss of trade data, or punitive/consequential damages.
                </li>
              </ul>
            </section>

            {/* Section 11 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">11.</span> Data Portability, Exit Rights &amp; Purge Guarantees
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Full Portability:</strong> Subscribers can request and download their raw party lists and deal registers at any time in structured JSON/CSV/PDF formats with zero vendor lock-in.
                </li>
                <li>
                  <strong className="text-gray-900">Right to Permanent Purge:</strong> Upon voluntary account cancellation or formal written request to our Grievance Officer, CottBook will permanently delete and cryptographically scrub all tenant database schemas and uploaded letterhead assets from production clusters within sixty (60) days.
                </li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">12.</span> Governing Law &amp; Dispute Resolution
              </h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong className="text-gray-900">Jurisdiction:</strong> These Terms shall be governed by, construed, and enforced in accordance with the laws of the Republic of India.
                </li>
                <li>
                  <strong className="text-gray-900">Exclusive Forum:</strong> Any legal dispute, arbitration, claim, or proceeding arising out of or in connection with CottBook shall be subject to the exclusive jurisdiction of the competent courts located in Indore, Madhya Pradesh, India.
                </li>
              </ul>
            </section>

            {/* Section 13 */}
            <section className="space-y-3 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-cb-primary">13.</span> Contact &amp; Legal Notices
              </h2>
              <p className="text-gray-600">For legal inquiries, terms clarification, or formal communication:</p>
              <div className="bg-cb-bg shadow-neu-inset rounded-xl p-4 space-y-1.5 mt-2">
                <p><strong className="text-gray-800">Entity:</strong> CottBook Platform Administration</p>
                <p><strong className="text-gray-800">Operational Jurisdiction:</strong> Indore, Madhya Pradesh, India</p>
                <p><strong className="text-gray-800">Email:</strong> <a href="mailto:cottbook2026@gmail.com" className="text-cb-primary hover:underline">cottbook2026@gmail.com</a></p>
                <p><strong className="text-gray-800">Official URL:</strong> <a href="https://app.cottbook.com" target="_blank" rel="noopener noreferrer" className="text-cb-primary hover:underline">https://app.cottbook.com</a></p>
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
