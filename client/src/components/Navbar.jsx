import React from 'react';
import { 
  GraduationCap, 
  Calendar, 
  UserCheck, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Smartphone, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { formatArabicDate, getScheduleForDate } from '../utils/dateHelpers';

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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                {schoolName || 'نظام الحضور والغياب'}
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatArabicDate(selectedDate)}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                  {scheduleInfo.shortName || scheduleInfo.name}
                </span>
              </p>
            </div>
          </div>

          {/* Network & Mobile Connect */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPhoneModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors"
              title="فتح الرابط على جوال المعلمات"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">فتح من الجوال</span>
            </button>

            <div 
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200/60'
              }`}
              title={isOnline ? 'متصل بالخادم المحلي - المزامنة فورية' : 'يعمل بدون اتصال - يتم الحفظ محلياً'}
            >
              {isOnline ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden md:inline">مزامنة مباشرة</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  <span className="hidden md:inline">محلي (Offline)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex space-x-2 space-x-reverse border-t border-slate-100 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentTab('teacher')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'teacher'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>تسجيل حضور الفصل</span>
          </button>

          <button
            onClick={() => setCurrentTab('principal')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'principal'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة متابعة الإدارة والمدير</span>
          </button>

          <button
            onClick={() => setCurrentTab('classes')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              currentTab === 'classes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>إدارة الصفوف ورفع الإكسل</span>
          </button>
        </div>
      </div>
    </header>
  );
}
