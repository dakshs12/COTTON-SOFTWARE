import { ShieldCheck, Lock, Download, CheckCircle2 } from "lucide-react";
import { SECURITY_PILLARS, APP_LINKS } from "@/data/landingData";

export default function SecurityShield() {
  const getIcon = (name: string) => {
    switch (name) {
      case "ShieldCheck":
        return <ShieldCheck size={28} className="text-[#2D5A27]" />;
      case "Lock":
        return <Lock size={28} className="text-[#2D5A27]" />;
      case "Download":
        return <Download size={28} className="text-[#2D5A27]" />;
      default:
        return <ShieldCheck size={28} className="text-[#2D5A27]" />;
    }
  };

  return (
    <section id="security" className="py-24 lg:py-32 bg-[#F8FAFC] border-t border-slate-200/80 relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#04294E] text-white uppercase tracking-wider">
            Broker Confidentiality Guarantee
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#04294E] tracking-tight mt-3">
            Your Trade Secrets Are 100% Yours.
            <br />
            <span className="text-[#2D5A27]">We Never Sell Or Share Data.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            In cotton brokerage, your buyer list and negotiated candy margins are your most valuable intellectual property. We engineered CottBook with strict bank-grade isolation so you can trade with absolute peace of mind.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SECURITY_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-8 flex flex-col justify-between shadow-sm card-elevation-hover"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center mb-6">
                  {getIcon(pillar.iconName)}
                </div>

                <h3 className="text-xl font-black text-[#04294E] tracking-tight mb-3">
                  {pillar.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={16} />
                <span>Verified Tenant Security Protocol</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
