import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Printer, 
  MessageCircle, 
  Phone, 
  Calendar, 
  Building2, 
  TrendingUp, 
  FileSpreadsheet, 
  Award, 
  BarChart3, 
  Sparkles, 
  ArrowUpRight,
  Edit2,
  Edit3,
  X,
  Save,
  Search,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';
import { getScheduleForDate, formatArabicDate } from '../utils/dateHelpers';
import { exportAttendanceReport } from '../utils/excelParser';
import { CircularGauge, DistributionBar, StudentAvatar } from './VisualCharts';
import { playClickSound, playSaveSuccessSound, playAllPresentChime } from '../utils/soundEffects';

export default function PrincipalDashboard({ 
  classes, 
  teachers, 
  attendanceData, 
  selectedDate, 
  setSelectedDate, 
  schoolName, 
  onViewClass,
  onSaveAttendance,
  onSaveStudent,
  onDeleteStudent,
  onNavigateToManagement
}) {
  const scheduleToday = useMemo(() => getScheduleForDate(selectedDate), [selectedDate]);

  // Modal for Principal Direct Attendance Editing
  const [editingClassAttendance, setEditingClassAttendance] = useState(null); // class object or null
  const [modalRecords, setModalRecords] = useState({});
  const [modalSearch, setModalSearch] = useState('');
  const [modalSavedNotification, setModalSavedNotification] = useState(false);

  // Modal for Editing Student Details directly
  const [editingStudentModal, setEditingStudentModal] = useState(null); // { student, classId } or null
  const [studentFormName, setStudentFormName] = useState('');
  const [studentFormId, setStudentFormId] = useState('');
  const [studentFormPhone, setStudentFormPhone] = useState('');

  // Today's scheduled classes (or all if weekend)
  const scheduledClasses = useMemo(() => {
    if (scheduleToday.group === 'WEEKEND') return classes;
    return classes.filter(c => c.schedule === scheduleToday.group);
  }, [classes, scheduleToday]);

  // Aggregate stats across today's classes
  const stats = useMemo(() => {
    let totalStudents = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;
    let recordedClassesCount = 0;

    const dayAttendance = attendanceData[selectedDate] || {};

    scheduledClasses.forEach(cls => {
      const clsStudents = cls.students || [];
      totalStudents += clsStudents.length;

      const recordObj = dayAttendance[cls.id];
      if (recordObj && recordObj.records) {
        recordedClassesCount++;
        clsStudents.forEach(st => {
          const stStatus = recordObj.records[st.id];
          if (stStatus === 'present') presentCount++;
          else if (stStatus === 'absent') absentCount++;
          else if (stStatus === 'late') lateCount++;
          else if (stStatus === 'excused') excusedCount++;
        });
      }
    });

    const totalMarked = presentCount + absentCount + lateCount + excusedCount;
    const attendanceRate = totalMarked > 0 
      ? Math.round(((presentCount + lateCount) / totalMarked) * 100) 
      : 0;

    return {
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      recordedClassesCount,
      totalClasses: scheduledClasses.length,
      attendanceRate
    };
  }, [scheduledClasses, attendanceData, selectedDate]);

  // Consolidated absentees list for today
  const absenteesList = useMemo(() => {
    const list = [];
    const dayAttendance = attendanceData[selectedDate] || {};

    scheduledClasses.forEach(cls => {
      const recordObj = dayAttendance[cls.id];
      if (recordObj && recordObj.records) {
        (cls.students || []).forEach(st => {
          if (recordObj.records[st.id] === 'absent') {
            list.push({
              student: st,
              classInfo: cls,
              recordedAt: recordObj.recordedAt
            });
          }
        });
      }
    });

    return list;
  }, [scheduledClasses, attendanceData, selectedDate]);

  // Excel Export
  const handleExport = () => {
    exportAttendanceReport({
      date: selectedDate,
      classes: scheduledClasses,
      attendance: attendanceData[selectedDate] || {},
      schoolName
    });
  };

  // WhatsApp Message for absent student
  const getWhatsAppLink = (student, className) => {
    if (!student.phone) return null;
    const cleanPhone = student.phone.replace(/[^\d]/g, '');
    const message = `السلام عليكم ورحمة الله،\nولي أمر الطالب المحترم (${student.name}) - ${className}،\nنود إحاطتكم علماً بتسجيل غياب الطالب اليوم (${formatArabicDate(selectedDate)}).\nنرجو التواصل مع إدارة المدرسة لإفادتنا بسبب الغياب للاطمئنان عليه.\n- إدارة ${schoolName || 'المدرسة'}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // ----------------- PRINCIPAL ATTENDANCE EDITING ACTIONS -----------------

  // 1. Direct 1-tap quick status change for an absent student from the absentees list
  const handleQuickChangeStatus = async (classId, studentId, newStatus) => {
    playClickSound();
    const dayAttendance = attendanceData[selectedDate] || {};
    const classRecords = { ...(dayAttendance[classId]?.records || {}) };
    classRecords[studentId] = newStatus;

    if (onSaveAttendance) {
      await onSaveAttendance({
        date: selectedDate,
        classId,
        records: classRecords,
        recordedBy: 'مدير المدرسة'
      });
      playSaveSuccessSound();
    }
  };

  // 2. Open Principal Class Attendance Modal
  const handleOpenClassAttendanceModal = (cls) => {
    const dayAttendance = attendanceData[selectedDate] || {};
    const existing = dayAttendance[cls.id]?.records || {};
    setModalRecords({ ...existing });
    setModalSearch('');
    setModalSavedNotification(false);
    setEditingClassAttendance(cls);
  };

  // 3. Mark All Present inside Modal
  const handleModalAllPresent = () => {
    if (!editingClassAttendance) return;
    playAllPresentChime();
    const updated = {};
    (editingClassAttendance.students || []).forEach(st => {
      updated[st.id] = 'present';
    });
    setModalRecords(updated);
  };

  // 4. Change single status inside Modal
  const handleModalStudentStatus = (studentId, status) => {
    playClickSound();
    setModalRecords(prev => ({ ...prev, [studentId]: status }));
  };

  // 5. Save Modal attendance
  const handleSaveModalAttendance = async () => {
    if (!editingClassAttendance || !onSaveAttendance) return;
    await onSaveAttendance({
      date: selectedDate,
      classId: editingClassAttendance.id,
      records: modalRecords,
      recordedBy: 'مدير المدرسة'
    });
    playSaveSuccessSound();
    setModalSavedNotification(true);
    setTimeout(() => {
      setModalSavedNotification(false);
      setEditingClassAttendance(null);
    }, 900);
  };

  // 6. Open Edit Student Modal
  const handleOpenEditStudent = (student, classId) => {
    setEditingStudentModal({ student, classId });
    setStudentFormName(student.name);
    setStudentFormId(student.nationalId || student.national_id || '');
    setStudentFormPhone(student.phone || '');
  };

  const handleSaveStudentDetails = async (e) => {
    e.preventDefault();
    if (!editingStudentModal || !studentFormName.trim() || !onSaveStudent) return;
    
    await onSaveStudent(editingStudentModal.classId, {
      id: editingStudentModal.student.id,
      name: studentFormName.trim(),
      nationalId: studentFormId.trim(),
      phone: studentFormPhone.trim()
    });
    
    playSaveSuccessSound();
    setEditingStudentModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: Controls, Management Link & Date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              لوحة المتابعة والتحرير الشامل (المدير)
            </h2>
            <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {scheduleToday.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            صلاحيات كاملة للمدير: تعديل الحضور والغياب، التواصل الفوري، وإدارة الفصول والطلاب
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Management Switcher */}
          {onNavigateToManagement && (
            <button
              type="button"
              onClick={onNavigateToManagement}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>إدارة الفصول والطلاب</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            title="طباعة التقرير"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Interactive Radial Gauge */}
        <div className="bg-gradient-to-br from-white to-slate-50/50 border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-3 right-4 flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>معدل الحضور العام</span>
          </div>

          <div className="my-2">
            <CircularGauge percentage={stats.attendanceRate} size={150} strokeWidth={13} />
          </div>

          <p className="text-xs font-medium text-slate-500 max-w-xs mt-1">
            نسبة الالتزام المدرسي المحسوبة من كافة الفصول المرصودة لليوم
          </p>
        </div>

        {/* Card 2: Visual Distribution Bar & Statistics */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">الرسم البياني لتوزيع الحضور والغياب اليوم</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">
              إجمالي: <strong className="text-slate-900 tabular-nums">{stats.totalStudents}</strong> طالب
            </span>
          </div>

          {/* Graphical Multi-Segment Bar */}
          <DistributionBar 
            present={stats.presentCount}
            absent={stats.absentCount}
            late={stats.lateCount}
            excused={stats.excusedCount}
            total={stats.totalStudents}
          />

          {/* Quick Counter Badges */}
          <div className="grid grid-cols-4 gap-2.5 pt-2">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-center">
              <span className="text-[11px] font-bold text-emerald-800 block">حاضر</span>
              <span className="text-xl font-extrabold text-emerald-700 tabular-nums">{stats.presentCount}</span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 text-center">
              <span className="text-[11px] font-bold text-rose-800 block">غائب</span>
              <span className="text-xl font-extrabold text-rose-700 tabular-nums">{stats.absentCount}</span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
              <span className="text-[11px] font-bold text-amber-800 block">متأخر</span>
              <span className="text-xl font-extrabold text-amber-700 tabular-nums">{stats.lateCount}</span>
            </div>

            <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3 text-center">
              <span className="text-[11px] font-bold text-sky-800 block">مبرر</span>
              <span className="text-xl font-extrabold text-sky-700 tabular-nums">{stats.excusedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Class Monitoring Table with Direct Principal Editing */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">جدول رصد فصول اليوم المقررة</h3>
              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                تحرير مباشر للمدير
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">يمكنك مراجعة وتعديل رصد أي فصل مباشرة بضغطة زر</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              اكتمال الرصد: {stats.recordedClassesCount} من {stats.totalClasses} فصول
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">الفصل الدراسي</th>
                <th className="py-3.5 px-4">المعلمة المسؤولة</th>
                <th className="py-3.5 px-4">حالة الرصد</th>
                <th className="py-3.5 px-4">عدد الطلاب</th>
                <th className="py-3.5 px-4 text-emerald-700">حاضر</th>
                <th className="py-3.5 px-4 text-rose-700">غائب</th>
                <th className="py-3.5 px-4 text-amber-700">متأخر</th>
                <th className="py-3.5 px-4 font-mono">وقت الرصد</th>
                <th className="py-3.5 px-5 text-left">إجراءات المدير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduledClasses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    لا توجد فصول مبرمجة لليوم في هذه المجموعة.
                  </td>
                </tr>
              ) : (
                scheduledClasses.map(cls => {
                  const recordObj = attendanceData[selectedDate]?.[cls.id];
                  const isRecorded = !!recordObj;
                  let present = 0, absent = 0, late = 0;

                  if (isRecorded && recordObj.records) {
                    (cls.students || []).forEach(st => {
                      const s = recordObj.records[st.id];
                      if (s === 'present') present++;
                      else if (s === 'absent') absent++;
                      else if (s === 'late') late++;
                    });
                  }

                  const timeStr = recordObj?.recordedAt 
                    ? new Date(recordObj.recordedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                    : '-';

                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {cls.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {cls.teacherName || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isRecorded ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            تم الرصد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            بانتظار الرصد
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 tabular-nums">
                        {cls.students?.length || 0}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-emerald-700 tabular-nums">
                        {isRecorded ? present : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-rose-700 tabular-nums">
                        {isRecorded ? absent : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-amber-700 tabular-nums">
                        {isRecorded ? late : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                        {timeStr}
                      </td>
                      <td className="py-3.5 px-5 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct Principal Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenClassAttendanceModal(cls)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-900 hover:text-white bg-amber-100 hover:bg-slate-900 rounded-lg border border-amber-200 transition-all inline-flex items-center gap-1.5"
                            title="تحرير وتعديل سجل حضور هذا الفصل مباشرة"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تحرير الحضور</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onViewClass && onViewClass(cls.id)}
                            className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                            title="فتح واجهة المعلمة"
                          >
                            عرض
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* School-Wide Absentees with Instant Principal Quick-Fix Buttons */}
      <div className="bg-white border border-rose-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                قائمة الطلاب الغائبين في المدرسة اليوم ({absenteesList.length} طالب/طالبة)
              </h3>
              <p className="text-[11px] text-rose-700 font-medium">
                تحويل مباشر للحالة إلى (حاضر / متأخر / مستأذن) بضغطة زر من قبل المدير
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-lg">
            تعديل فوري وسريع
          </span>
        </div>

        {absenteesList.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-800">نسبة حضور كاملة - لا يوجد غياب مسجل اليوم!</p>
            <p className="text-xs text-slate-400 mt-0.5">كافة الطلاب حاضرون أو لم يتم رصد غائبين حتى اللحظة.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {absenteesList.map((item, idx) => {
              const waUrl = getWhatsAppLink(item.student, item.classInfo.name);

              return (
                <div key={idx} className="p-4 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <StudentAvatar name={item.student.name} className="w-10 h-10 text-sm font-extrabold" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{item.student.name}</h4>
                        <button
                          type="button"
                          onClick={() => handleOpenEditStudent(item.student, item.classInfo.id)}
                          className="text-slate-400 hover:text-slate-700 p-1"
                          title="تعديل بيانات الطالب"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-700">{item.classInfo.name}</span>
                        <span className="text-slate-300">•</span>
                        <span>المعلمة: {item.classInfo.teacherName}</span>
                        {item.student.nationalId && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-slate-500">هوية: {item.student.nationalId}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Principal Instant Status Fix + Phone/WhatsApp */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    {/* Quick Status Fixes */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleQuickChangeStatus(item.classInfo.id, item.student.id, 'present')}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-95 shadow-2xs"
                        title="تحويل الطالب إلى حاضر فوراً"
                      >
                        ✓ حاضر
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickChangeStatus(item.classInfo.id, item.student.id, 'late')}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all active:scale-95 shadow-2xs"
                        title="تحويل الطالب إلى متأخر"
                      >
                        ⏱ متأخر
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickChangeStatus(item.classInfo.id, item.student.id, 'excused')}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-all active:scale-95 shadow-2xs"
                        title="تسجيل عذر مقبول"
                      >
                        📋 معذور
                      </button>
                    </div>

                    {/* Phone & WhatsApp Contact */}
                    {item.student.phone ? (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${item.student.phone}`}
                          className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 inline-flex items-center gap-1 transition-colors"
                          title="اتصال هاتفي بولي الأمر"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-mono tabular-nums">{item.student.phone}</span>
                        </a>

                        {waUrl && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">بدون هاتف</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL: PRINCIPAL CLASS ATTENDANCE EDITOR ================= */}
      {editingClassAttendance && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold">{editingClassAttendance.name}</h3>
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                    تحرير المدير
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  المعلمة: {editingClassAttendance.teacherName} • تاريخ: {formatArabicDate(selectedDate)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingClassAttendance(null)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleModalAllPresent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>الجميع حاضر (ضغطة واحدة)</span>
              </button>

              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="بحث عن طالب..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Students List with 4 Status Buttons */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {(editingClassAttendance.students || [])
                .filter(st => st.name.toLowerCase().includes(modalSearch.toLowerCase()))
                .map(st => {
                  const currentStatus = modalRecords[st.id] || 'present';

                  return (
                    <div key={st.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar name={st.name} className="w-8 h-8 text-xs font-bold" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{st.name}</p>
                          {st.phone && <p className="text-[11px] font-mono text-slate-400">{st.phone}</p>}
                        </div>
                      </div>

                      {/* 4 Status Pills */}
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleModalStudentStatus(st.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          حاضر
                        </button>

                        <button
                          type="button"
                          onClick={() => handleModalStudentStatus(st.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'absent'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          غائب
                        </button>

                        <button
                          type="button"
                          onClick={() => handleModalStudentStatus(st.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'late'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          متأخر
                        </button>

                        <button
                          type="button"
                          onClick={() => handleModalStudentStatus(st.id, 'excused')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            currentStatus === 'excused'
                              ? 'bg-sky-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          مبرر
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {modalSavedNotification ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  تم حفظ وتحديث الحضور في السحابة بنجاح!
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  سيتم حفظ التعديلات باسم "مدير المدرسة" فوراً
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClassAttendance(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalAttendance}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all active:scale-95 inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT STUDENT DETAILS ================= */}
      {editingStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900">تعديل بيانات الطالب</h3>
              <button
                type="button"
                onClick={() => setEditingStudentModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentDetails} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب الرباعي</label>
                <input
                  type="text"
                  required
                  value={studentFormName}
                  onChange={(e) => setStudentFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهوية / القيد (اختياري)</label>
                <input
                  type="text"
                  value={studentFormId}
                  onChange={(e) => setStudentFormId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف ولي الأمر (واتساب)</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={studentFormPhone}
                  onChange={(e) => setStudentFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudentModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
