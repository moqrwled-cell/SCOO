import React, { useState } from 'react';
import { Smartphone, Globe, Copy, Check, X, Sparkles } from 'lucide-react';

export default function PhoneConnectModal({ isOpen, onClose, lanUrl }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.origin;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">رابط التطبيق لجوال المعلمات</h3>
            <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>مربوط بقاعدة سحابية موحدة (يعمل من أي مكان)</span>
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs text-slate-700 leading-relaxed">
          <p className="font-medium">
            تستطيع المعلمة والمدير فتح الرابط مباشرة من متصفح الهاتف (Safari أو Chrome) عبر باقة البيانات أو أي اتصال إنترنت دون الحاجة للاتصال بشبكة محددة:
          </p>
        </div>

        {/* URL Box */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-2.5">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="bg-transparent text-slate-900 font-mono text-xs font-bold flex-1 select-all focus:outline-none text-left"
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0 active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 text-center leading-relaxed bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-lg">
          💡 <strong>نصيحة للمعلمة:</strong> يمكن فتح الرابط بالجوال والضغط على خيارات المتصفح ثم <strong>"إضافة إلى الشاشة الرئيسية"</strong> ليتحول لأيقونة تطبيق مستقل على هاتفها!
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
