import React, { useMemo } from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { getScheduleForDate, formatArabicDate } from '../utils/dateHelpers';
import { exportAttendanceReport } from '../utils/excelParser';
import { CircularGauge, DistributionBar, StudentAvatar } from './VisualCharts';

export default function PrincipalDashboard({ 
  classes, 
  teachers, 
  attendanceData, 
  selectedDate, 
  setSelectedDate,
  schoolName,
  onViewClass 
}) {
  const scheduleToday = useMemo(() => getScheduleForDate(selectedDate), [selectedDate]);

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
    const message = `السلام عليكم ورحمة الله،\nولي أمر الطالب المحترم (${student.name}) - ${className}،\nنود إحاطتكم علماً بتسجيل غياب الطالب اليوم (${formatArabicDate(selectedDate)}).\nنرجو التواصل مع إدارة المدرسة لإفادتنا بسبب الغياب للاطمئنان عليه.\n- إدارة المدرسة`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Controls & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              لوحة المتابعة والتحليل اليومي
            </h2>
            <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {scheduleToday.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            متابعة بيانية متقدمة للحضور والغياب مع خيارات الاتصال الفوري بأولياء الأمور
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none"
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

      {/* Visual Analytics Showcase (The "فخم" Graphics Section) */}
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

      {/* Class Monitoring Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">جدول رصد فصول اليوم المقررة</h3>
            <p className="text-xs text-slate-500">حالة رصد الحضور لكل فصل ومعلمة</p>
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
                <th className="py-3.5 px-4">وقت الرصد</th>
                <th className="py-3.5 px-5 text-left">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduledClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    لا توجد فصول مبرمجة لليوم في هذه المجموعة.
                  </td>
                </tr>
              ) : (
                scheduledClasses.map(cls => {
                  const recordObj = attendanceData[selectedDate]?.[cls.id];
                  const isRecorded = !!recordObj;
                  let present = 0, absent = 0;

                  if (isRecorded && recordObj.records) {
                    (cls.students || []).forEach(st => {
                      if (recordObj.records[st.id] === 'present') present++;
                      if (recordObj.records[st.id] === 'absent') absent++;
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            تم الرصد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
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
                      <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                        {timeStr}
                      </td>
                      <td className="py-3.5 px-5 text-left">
                        <button
                          type="button"
                          onClick={() => onViewClass && onViewClass(cls.id)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                        >
                          عرض الفصل
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* School-Wide Absentees with Avatars & Instant WhatsApp */}
      <div className="bg-white border border-rose-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                قائمة الطلاب الغائبين في المدرسة اليوم ({absenteesList.length} طالب/طالبة)
              </h3>
              <p className="text-[11px] text-rose-700 font-medium">
                تواصل فوري مع أولياء الأمور عبر واتساب أو الهاتف
              </p>
            </div>
          </div>
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
                <div key={idx} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <StudentAvatar name={item.student.name} className="w-10 h-10 text-sm font-extrabold" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.student.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{item.classInfo.name}</span>
                        <span className="text-slate-300">•</span>
                        <span>المعلمة: {item.classInfo.teacherName}</span>
                        {item.student.nationalId && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-slate-500">قيد: {item.student.nationalId}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Phone & WhatsApp Direct */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.student.phone ? (
                      <>
                        <a
                          href={`tel:${item.student.phone}`}
                          className="h-9 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 inline-flex items-center gap-1.5 transition-colors"
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
                            className="h-9 px-3.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>مراسلة واتساب</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">لا يوجد رقم هاتف مسجل</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
