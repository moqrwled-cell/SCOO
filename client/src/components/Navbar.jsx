import React, { useState, useEffect } from 'react';
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
  Sparkles,
  GraduationCap,
  Building2,
  BookOpen,
  Leaf,
  Edit2,
  X,
  Upload,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { formatArabicDate, getScheduleForDate } from '../utils/dateHelpers';
import { SchoolCrest } from './VisualCharts';
import { toggleSound, isSoundEnabled } from '../utils/soundEffects';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  selectedDate, 
  schoolName, 
  schoolLogo = 'none',
  onUpdateSchoolLogo,
  isOnline, 
  lanUrl,
  onOpenPhoneModal 
}) {
  const scheduleInfo = getScheduleForDate(selectedDate);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Logo Customization Modal
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState('');

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Also check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setCanInstallPwa(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instruction for iOS Safari / others
      alert('لتثبيت التطبيق على جوالك:\n1. انقر على زر المشاركة (Share) في المتصفح.\n2. اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstallPwa(false);
    }
    setDeferredPrompt(null);
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleSelectLogo = (type) => {
    if (onUpdateSchoolLogo) {
      onUpdateSchoolLogo(type);
    }
    setIsLogoModalOpen(false);
  };

  const handleUploadCustomImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && onUpdateSchoolLogo) {
        onUpdateSchoolLogo(event.target.result);
      }
      setIsLogoModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  // Render the selected logo or nothing if 'none'
  const renderLogo = () => {
    if (!schoolLogo || schoolLogo === 'none') {
      return null;
    }

    if (schoolLogo === 'icon:graduation') {
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <GraduationCap className="w-5 h-5 text-amber-400" />
        </div>
      );
    }

    if (schoolLogo === 'icon:school') {
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <Building2 className="w-5 h-5 text-emerald-400" />
        </div>
      );
    }

    if (schoolLogo === 'icon:book') {
      return (
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <BookOpen className="w-5 h-5 text-sky-400" />
        </div>
      );
    }

    if (schoolLogo === 'icon:leaf') {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
          <Leaf className="w-5 h-5 text-emerald-300" />
        </div>
      );
    }

    if (schoolLogo === 'crest') {
      return <SchoolCrest className="w-10 h-10" />;
    }

    if (typeof schoolLogo === 'string' && (schoolLogo.startsWith('data:image') || schoolLogo.startsWith('http'))) {
      return (
        <img 
          src={schoolLogo} 
          alt="شعار المدرسة" 
          className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-200" 
        />
      );
    }

    return null;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            {/* Logo Render (or null if none) */}
            {renderLogo()}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                  {schoolName || 'مدرسة قطوف الخير'}
                </h1>
                
                {/* Logo Change Tooltip Button for Principal */}
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="تغيير أو حذف الشعار بجانب اسم المدرسة"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

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

          {/* Quick Actions & PWA Install & Status */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* PWA Install Button (Always available for instant phone installation) */}
            <button
              onClick={handleInstallClick}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition-all active:scale-95 animate-pulse"
              title="تثبيت التطبيق على الشاشة الرئيسية للجوال أو الكمبيوتر"
            >
              <Download className="w-3.5 h-3.5 text-emerald-200" />
              <span>تثبيت التطبيق 📲</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={soundOn ? "كتم المؤثرات الصوتية" : "تشغيل المؤثرات الصوتية"}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Mobile Open QR/Modal */}
            <button
              onClick={onOpenPhoneModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
              title="فتح الرابط على جوال المعلمات"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">جوال المعلمات</span>
            </button>

            {/* Live Sync Status */}
            <div 
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
              title={isOnline ? 'المزامنة الحية مفعلة - كل نقرة تصل للمدير فوراً' : 'يعمل بنمط التخزين المحلي'}
            >
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden md:inline">مزامنة حية فائقة</span>
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
            <span>لوحة المتابعة وتحرير الحضور (المدير)</span>
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
            <span>الإدارة الشاملة للمدرسة (المدير)</span>
          </button>
        </div>
      </div>

      {/* ================= MODAL: LOGO SELECTOR / CHANGER ================= */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">تخصيص أو حذف شعار المدرسة</h3>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-500">اختر شكل الشعار الظاهر بجانب اسم المدرسة في الأعلى:</p>

              <div className="grid grid-cols-2 gap-2">
                {/* Option 1: None */}
                <button
                  type="button"
                  onClick={() => handleSelectLogo('none')}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    schoolLogo === 'none'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">🚫 بدون شعار</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">حذف الصورة نهائياً</span>
                </button>

                {/* Option 2: Graduation */}
                <button
                  type="button"
                  onClick={() => handleSelectLogo('icon:graduation')}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    schoolLogo === 'icon:graduation'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">🎓 قبعة تخرج</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">أيقونة حديثة</span>
                </button>

                {/* Option 3: School */}
                <button
                  type="button"
                  onClick={() => handleSelectLogo('icon:school')}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    schoolLogo === 'icon:school'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">🏫 صرح مدرسي</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">أيقونة مدرسية</span>
                </button>

                {/* Option 4: Book */}
                <button
                  type="button"
                  onClick={() => handleSelectLogo('icon:book')}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    schoolLogo === 'icon:book'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">📖 كتاب مفتوح</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">أيقونة تعليمية</span>
                </button>

                {/* Option 5: Leaf */}
                <button
                  type="button"
                  onClick={() => handleSelectLogo('icon:leaf')}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    schoolLogo === 'icon:leaf'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">🌿 غصن قطوف الخير</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">رمز الطبيعة والخير</span>
                </button>

                {/* Option 6: Crest */}
                <button
                  type="button"
                  onClick={() => handleSelectLogo('crest')}
                  className={`p-3 rounded-xl border text-right transition-all ${
                    schoolLogo === 'crest'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">👑 الشعار الملكي</span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">شعار أكاديمي كامل</span>
                </button>
              </div>

              {/* Upload Custom Image */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">أو ارفع صورة شعار من جهازك:</label>
                <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl cursor-pointer transition-colors text-xs font-bold text-slate-700">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>اختيار صورة شعار من الجهاز</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCustomImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
