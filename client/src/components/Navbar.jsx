import React, { useState } from 'react';
import { 
  Calendar, 
  UserCheck, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Smartphone, 
  Wifi, 
  WifiOff,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { formatArabicDate, getScheduleForDate } from '../utils/dateHelpers';
import { SchoolCrest } from './VisualCharts';
import { toggleSound, isSoundEnabled } from '../utils/soundEffects';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  selectedDate, 
  schoolName, 
  isOnline, 
  lanUrl,
  onOpenPhoneModal 
}) {
  const scheduleInfo = getScheduleForDate(selectedDate);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Royal Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              <SchoolCrest className="w-11 h-11 transition-transform group-hover:scale-105 duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                  {schoolName || 'نظام الحضور والغياب الذكي'}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  النسخة الذكية
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatArabicDate(selectedDate)}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded-md text-[11px] border border-slate-200">
                  {scheduleInfo.shortName || scheduleInfo.name}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={soundOn ? "كتم المؤثرات الصوتية" : "تشغيل المؤثرات الصوتية"}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Mobile Open */}
            <button
              onClick={onOpenPhoneModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
              title="فتح الرابط على جوال المعلمات"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">فتح من الجوال</span>
            </button>

            {/* Live Sync Status */}
            <div 
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
              title={isOnline ? 'متصل بالخادم - المزامنة فورية بين المعلمة والمدير' : 'يعمل بنمط التخزين المحلي'}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden md:inline">مزامنة حية</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span className="hidden md:inline">وضع أوفلاين</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <div className="flex space-x-2 space-x-reverse border-t border-slate-100 py-2.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentTab('teacher')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              currentTab === 'teacher'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>تسجيل حضور الفصل (المعلمة)</span>
          </button>

          <button
            onClick={() => setCurrentTab('principal')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              currentTab === 'principal'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>لوحة المتابعة والرسوم البيانية (المدير)</span>
          </button>

          <button
            onClick={() => setCurrentTab('classes')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              currentTab === 'classes'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>إدارة الصفوف ورفع الإكسل</span>
          </button>
        </div>
      </div>
    </header>
  );
}
