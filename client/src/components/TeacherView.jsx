import React, { useState, useMemo, useEffect } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  Search, 
  Save, 
  RotateCcw, 
  MessageCircle, 
  Sparkles,
  Phone,
  Calendar,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { getScheduleForDate, formatArabicDate } from '../utils/dateHelpers';
import { StudentAvatar, DistributionBar } from './VisualCharts';
import { playClickSound, playAllPresentChime, playSaveSuccessSound } from '../utils/soundEffects';

export default function TeacherView({ 
  classes, 
  teachers, 
  attendanceData, 
  selectedDate, 
  setSelectedDate,
  onSaveAttendance 
}) {
  const scheduleToday = useMemo(() => getScheduleForDate(selectedDate), [selectedDate]);

  // Selected schedule tab (defaults to today's active schedule)
  const [activeSchedule, setActiveSchedule] = useState(() => {
    return scheduleToday.group === 'WEEKEND' ? 'SAT_MON_WED' : scheduleToday.group;
  });

  // Keep schedule in sync if date changes
  useEffect(() => {
    if (scheduleToday.group !== 'WEEKEND') {
      setActiveSchedule(scheduleToday.group);
    }
  }, [scheduleToday]);

  // Selected Teacher filter (optional)
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Classes filtered by schedule and teacher
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
      const matchSchedule = cls.schedule === activeSchedule;
      const matchTeacher = selectedTeacherId ? cls.teacherId === selectedTeacherId : true;
      return matchSchedule && matchTeacher;
    });
  }, [classes, activeSchedule, selectedTeacherId]);

  // Currently selected class
  const [selectedClassId, setSelectedClassId] = useState(() => {
    return filteredClasses.length > 0 ? filteredClasses[0].id : (classes[0]?.id || '');
  });

  // Ensure selectedClassId is valid
  useEffect(() => {
    if (filteredClasses.length > 0 && !filteredClasses.some(c => c.id === selectedClassId)) {
      setSelectedClassId(filteredClasses[0].id);
    }
  }, [filteredClasses, selectedClassId]);

  const currentClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || null;
  }, [classes, selectedClassId]);

  // Attendance records state for current class & date: { [studentId]: 'present' | 'absent' | 'late' | 'excused' }
  const [records, setRecords] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [allPresentCelebration, setAllPresentCelebration] = useState(false);

  // Load existing records when class or date changes
  useEffect(() => {
    if (selectedClassId && selectedDate && attendanceData[selectedDate]?.[selectedClassId]) {
      const existing = attendanceData[selectedDate][selectedClassId].records || {};
      setRecords(existing);
    } else {
      setRecords({});
    }
    setSaveSuccess(false);
    setAllPresentCelebration(false);
  }, [selectedClassId, selectedDate, attendanceData]);

  // Quick Action: Mark all students present with sound chime & animation
  const handleMarkAllPresent = () => {
    if (!currentClass || !currentClass.students) return;
    playAllPresentChime();
    const allPresent = {};
    currentClass.students.forEach(st => {
      allPresent[st.id] = 'present';
    });
    setRecords(allPresent);
    setSaveSuccess(false);
    setAllPresentCelebration(true);
    setTimeout(() => setAllPresentCelebration(false), 3500);
  };

  // Quick Action: Reset records
  const handleReset = () => {
    playClickSound();
    setRecords({});
    setSaveSuccess(false);
    setAllPresentCelebration(false);
  };

  // Toggle or set student status with click audio
  const setStudentStatus = (studentId, status) => {
    playClickSound();
    setRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
    setSaveSuccess(false);
  };

  // Save handler with chord sound
  const handleSave = async () => {
    if (!currentClass) return;
    setIsSaving(true);
    try {
      await onSaveAttendance({
        date: selectedDate,
        classId: currentClass.id,
        records,
        recordedBy: currentClass.teacherName || 'معلمة الصف'
      });
      playSaveSuccessSound();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!currentClass || !currentClass.students) {
      return { total: 0, present: 0, absent: 0, late: 0, excused: 0, unmarked: 0 };
    }
    const total = currentClass.students.length;
    let present = 0, absent = 0, late = 0, excused = 0;

    currentClass.students.forEach(st => {
      const status = records[st.id];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });

    const unmarked = total - (present + absent + late + excused);
    return { total, present, absent, late, excused, unmarked };
  }, [currentClass, records]);

  // Filter students by search
  const visibleStudents = useMemo(() => {
    if (!currentClass || !currentClass.students) return [];
    if (!searchQuery.trim()) return currentClass.students;

    const q = searchQuery.trim().toLowerCase();
    return currentClass.students.filter(st => {
      const nameMatch = (st.name || '').toLowerCase().includes(q);
      const idMatch = (st.nationalId || '').toLowerCase().includes(q);
      return nameMatch || idMatch;
    });
  }, [currentClass, searchQuery]);

  // WhatsApp Message Composer for absent student
  const getWhatsAppLink = (student) => {
    if (!student.phone) return null;
    const cleanPhone = student.phone.replace(/[^\d]/g, '');
    const message = `السلام عليكم ورحمة الله،\nولي أمر الطالب المحترم (${student.name})،\nنحيطكم علماً بتسجيل غياب الطالب عن الدوام اليوم (${formatArabicDate(selectedDate)}).\nنرجو إفادتنا بسبب الغياب للاطمئنان عليه.\n- إدارة المدرسة`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Control Card: Date & Schedule */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>تاريخ الحضور</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-500" />
              <span>تصفية بالمعلمة</span>
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
            >
              <option value="">جميع المعلمات</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Schedule Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
            <div className="flex items-center justify-between font-bold">
              <span>جدول اليوم حسب التقويم:</span>
              <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md text-[11px]">
                {scheduleToday.shortName || scheduleToday.name}
              </span>
            </div>
            <p className="mt-1 text-amber-800/80 text-[11px] leading-relaxed">
              النظام يفرز فصول اليوم تلقائياً لتفادي تسجيل صف في غير يوم دوامه.
            </p>
          </div>
        </div>

        {/* Schedule Tabs */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 ml-2">مجموعة الدوام:</span>
          <button
            type="button"
            onClick={() => setActiveSchedule('SAT_MON_WED')}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              activeSchedule === 'SAT_MON_WED'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            السبت - الإثنين - الأربعاء
            {scheduleToday.group === 'SAT_MON_WED' && (
              <span className="mr-1.5 text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">
                اليوم
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSchedule('SUN_TUE_THU')}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              activeSchedule === 'SUN_TUE_THU'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            الأحد - الثلاثاء - الخميس
            {scheduleToday.group === 'SUN_TUE_THU' && (
              <span className="mr-1.5 text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">
                اليوم
              </span>
            )}
          </button>
        </div>

        {/* Class Selection Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 ml-2">اختر الفصل:</span>
          {filteredClasses.length === 0 ? (
            <span className="text-xs text-slate-400 italic">لا توجد فصول مضافة في هذه المجموعة بعد.</span>
          ) : (
            filteredClasses.map(cls => {
              const isSelected = cls.id === selectedClassId;
              const isRecorded = !!attendanceData[selectedDate]?.[cls.id];

              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs ring-2 ring-slate-900/10'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{cls.name}</span>
                  {isRecorded && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="تم رصد هذا الفصل لليوم" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Classroom Panel */}
      {currentClass ? (
        <div className="space-y-4">
          {/* Class Header Banner & Visual Progress Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-extrabold text-slate-900">{currentClass.name}</h2>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    المعلمة: {currentClass.teacherName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  إجمالي المسجلين: <strong className="text-slate-900 tabular-nums">{stats.total}</strong> طالب/طالبة
                </p>
              </div>

              {/* Status Summary Visual Counters */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="block text-[11px] font-bold text-emerald-800">حاضر</span>
                  <span className="text-base font-extrabold text-emerald-700 tabular-nums">{stats.present}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="block text-[11px] font-bold text-rose-800">غائب</span>
                  <span className="text-base font-extrabold text-rose-700 tabular-nums">{stats.absent}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="block text-[11px] font-bold text-amber-800">متأخر</span>
                  <span className="text-base font-extrabold text-amber-700 tabular-nums">{stats.late}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="block text-[11px] font-bold text-sky-800">مبرر</span>
                  <span className="text-base font-extrabold text-sky-700 tabular-nums">{stats.excused}</span>
                </div>
              </div>
            </div>

            {/* Visual Live Proportional Breakdown Bar */}
            <div className="pt-1">
              <DistributionBar
                present={stats.present}
                absent={stats.absent}
                late={stats.late}
                excused={stats.excused}
                total={stats.total}
              />
            </div>

            {/* Ultra-Fast Action Toolbar */}
            <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* One-Click All Present Button & Reset */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 shadow-md shadow-emerald-700/15 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200 animate-spin-slow" />
                  <span>الجميع حاضر (نقرة واحدة)</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  title="إلغاء التحديد وإعادة البدء"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير</span>
                </button>
              </div>

              {/* Live Search & Save Button */}
              <div className="flex items-center gap-2 flex-1 md:max-w-md md:mr-auto">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو رقم القيد..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pr-10 pl-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm shrink-0 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ السجل'}</span>
                </button>
              </div>
            </div>

            {/* All-Present Celebration Notification Banner */}
            {allPresentCelebration && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>رائع! تم تحديد كافة الطلاب حاضرين بنجاح. انقر الآن فقط على الطالب الغائب لتغييره.</span>
                </div>
                <span className="text-emerald-700 font-extrabold text-[11px]">جاهز للحفظ</span>
              </div>
            )}

            {/* Notification alert on save */}
            {saveSuccess && (
              <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>تم حفظ سجل الحضور بنجاح وتمت المزامنة اللحظية مع الإدارة!</span>
              </div>
            )}
          </div>

          {/* Student Roster Cards with Illustrated Initials & Big Buttons */}
          <div className="space-y-2.5">
            {visibleStudents.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">لم يتم العثور على أي طالب مطابق للبحث.</p>
              </div>
            ) : (
              visibleStudents.map((student, idx) => {
                const currentStatus = records[student.id]; // 'present' | 'absent' | 'late' | 'excused' | undefined
                const isAbsent = currentStatus === 'absent';
                const whatsappUrl = isAbsent ? getWhatsAppLink(student) : null;

                return (
                  <div
                    key={student.id}
                    className={`bg-white border rounded-2xl p-3.5 sm:p-4 transition-all ${
                      isAbsent
                        ? 'border-rose-300 bg-rose-50/25 shadow-xs'
                        : currentStatus === 'present'
                        ? 'border-emerald-200/90 bg-white shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Student Info with Avatar Badge */}
                      <div className="flex items-center gap-3.5">
                        <StudentAvatar name={student.name} className="w-10 h-10 text-sm font-black" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 tabular-nums">#{idx + 1}</span>
                            <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                              {student.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            {student.nationalId && (
                              <span className="font-mono tabular-nums text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                                قيد: {student.nationalId}
                              </span>
                            )}
                            {student.phone && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono tabular-nums text-slate-500">
                                  {student.phone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Selector Controls (Generous touch targets) */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Present */}
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'present')}
                          className={`h-10 px-3.5 rounded-xl text-xs font-extrabold border transition-all active:scale-95 ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-emerald-800 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 inline ml-1" />
                          حاضر
                        </button>

                        {/* Absent */}
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'absent')}
                          className={`h-10 px-3.5 rounded-xl text-xs font-extrabold border transition-all active:scale-95 ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-white text-rose-800 border-slate-200 hover:bg-rose-50 hover:border-rose-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5 inline ml-1" />
                          غائب
                        </button>

                        {/* Late */}
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'late')}
                          className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-white text-amber-800 border-slate-200 hover:bg-amber-50'
                          }`}
                        >
                          متأخر
                        </button>

                        {/* Excused */}
                        <button
                          type="button"
                          onClick={() => setStudentStatus(student.id, 'excused')}
                          className={`h-10 px-3 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                            currentStatus === 'excused'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                              : 'bg-white text-sky-800 border-slate-200 hover:bg-sky-50'
                          }`}
                        >
                          مبرر
                        </button>

                        {/* Direct WhatsApp notify if absent */}
                        {isAbsent && whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-10 px-3 rounded-xl text-xs font-extrabold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 inline-flex items-center gap-1.5 transition-all shadow-xs"
                            title="إرسال رسالة واتساب لولي الأمر"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">إبلاغ الأهل</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Floating Save Bar on bottom for quick access */}
          <div className="sticky bottom-4 z-30 bg-white/95 backdrop-blur-md border border-slate-300 rounded-2xl p-3.5 shadow-lg flex items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              تم رصد <strong className="font-extrabold text-slate-900 tabular-nums">{stats.present + stats.absent + stats.late + stats.excused}</strong> من أصل <strong className="font-extrabold text-slate-900 tabular-nums">{stats.total}</strong> طالب
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جارِ الحفظ...' : 'حفظ حضور اليوم'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">لا توجد فصول دراسية محددة</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            يرجى إضافة الصفوف ورفع ملفات الإكسل من تبويب "إدارة الصفوف ورفع الإكسل" للبدء في رصد الحضور.
          </p>
        </div>
      )}
    </div>
  );
}
