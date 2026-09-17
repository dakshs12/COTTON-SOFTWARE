import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { APP_LINKS } from "@/data/landingData";

export default function FinalCtaBanner() {
  return (
    <section className="py-20 lg:py-28 bg-[#04294E] relative overflow-hidden text-white">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/10 rounded-full pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2D5A27]/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#2D5A27]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10 mb-6 backdrop-blur-md">
          <Sparkles size={14} className="text-emerald-400" />
          <span>Transform Your Brokerage In 2 Minutes</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          Ready to Modernize Your Cotton Brokerage?
        </h2>

        <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Join forward-thinking cotton brokers and experience faster saudas, zero disputes, and automated billing. Start your 14-day free trial right now.
        </p>

        {/* Action Button */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={APP_LINKS.register}
            className="w-full sm:w-auto px-9 py-4 text-base sm:text-lg font-bold text-[#04294E] bg-white hover:bg-slate-100 rounded-2xl shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-3"
          >
            <span>Create Free Account Now</span>
            <ArrowRight size={20} className="text-[#2D5A27]" />
          </a>

          <a
            href={APP_LINKS.login}
            className="w-full sm:w-auto px-7 py-4 text-base font-bold text-white hover:text-emerald-300 rounded-2xl border border-white/20 hover:border-white/40 transition-all flex items-center justify-center"
          >
            Already a member? Sign In
          </a>
        </div>

        {/* Reversal Guarantee */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>No credit card required</span>
          <span className="text-slate-600">•</span>
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>Instant setup</span>
          <span className="text-slate-600">•</span>
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>100% private tenant data</span>
        </div>
      </div>
    </section>
  );
}
