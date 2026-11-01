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
  FileSpreadsheet
} from 'lucide-react';
import { getScheduleForDate, formatArabicDate } from '../utils/dateHelpers';
import { exportAttendanceReport } from '../utils/excelParser';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">لوحة المتابعة الإدارية</h2>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {scheduleToday.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            متابعة دقيقة وفورية لحضور وغياب كافة الفصول والطلاب لليوم.
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            title="طباعة التقرير"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Attendance Rate */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>نسبة الحضور</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {stats.attendanceRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">من إجمالي الطلاب المرصودين</p>
        </div>

        {/* Total Students Scheduled */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>طلاب اليوم</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {stats.totalStudents}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">في {stats.totalClasses} فصول مبرمجة</p>
        </div>

        {/* Present */}
        <div className="bg-white border border-emerald-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-2">
            <span>الحاضرون</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums">
            {stats.presentCount}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">طالب مسجل حضور</p>
        </div>

        {/* Absent */}
        <div className="bg-white border border-rose-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-bold mb-2">
            <span>الغائبون</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 tabular-nums">
            {stats.absentCount}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1">يحتاجون متابعة هاتفية</p>
        </div>

        {/* Submission Progress */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>اكتمال الرصد</span>
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {stats.recordedClassesCount} / {stats.totalClasses}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-slate-900 h-1.5 rounded-full transition-all"
              style={{ width: `${stats.totalClasses > 0 ? (stats.recordedClassesCount / stats.totalClasses) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Classes Progress Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">متابعة تسجيل فصول اليوم</h3>
            <p className="text-xs text-slate-500">حالة رصد الحضور لكل معلمة وفصل</p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">
            {scheduledClasses.length} فصول
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/75 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">الفصل الدراسي</th>
                <th className="py-3 px-4">المعلمة</th>
                <th className="py-3 px-4">حالة الرصد</th>
                <th className="py-3 px-4">الطلاب</th>
                <th className="py-3 px-4">حاضر</th>
                <th className="py-3 px-4">غائب</th>
                <th className="py-3 px-4">وقت التسجيل</th>
                <th className="py-3 px-4 text-left">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scheduledClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
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
                    <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {cls.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {cls.teacherName || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {isRecorded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            تم الرصد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            بانتظار التسجيل
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 tabular-nums">
                        {cls.students?.length || 0}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700 tabular-nums">
                        {isRecorded ? present : '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-rose-700 tabular-nums">
                        {isRecorded ? absent : '-'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                        {timeStr}
                      </td>
                      <td className="py-3 px-4 text-left">
                        <button
                          type="button"
                          onClick={() => onViewClass && onViewClass(cls.id)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          عرض الكشف
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

      {/* All Absentees School-Wide Card */}
      <div className="bg-white border border-rose-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-rose-100 bg-rose-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-950">
              قائمة الطلاب الغائبين في المدرسة اليوم ({absenteesList.length} طالب/طالبة)
            </h3>
          </div>
          <span className="text-xs text-rose-700 font-medium">
            تواصل فوري مع أولياء الأمور
          </span>
        </div>

        {absenteesList.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800">لا يوجد غياب مسجل اليوم!</p>
            <p className="text-xs text-slate-400 mt-0.5">نسبة الحضور مكتملة أو لم يتم رصد غائبين حتى الآن.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {absenteesList.map((item, idx) => {
              const waUrl = getWhatsAppLink(item.student, item.classInfo.name);

              return (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center tabular-nums shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.student.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{item.classInfo.name}</span>
                        <span className="text-slate-300 mx-1.5">•</span>
                        <span>المعلمة: {item.classInfo.teacherName}</span>
                        {item.student.nationalId && (
                          <>
                            <span className="text-slate-300 mx-1.5">•</span>
                            <span className="font-mono text-slate-500">قيد: {item.student.nationalId}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Phone & WhatsApp */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.student.phone ? (
                      <>
                        <a
                          href={`tel:${item.student.phone}`}
                          className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 inline-flex items-center gap-1.5 transition-colors"
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
                            className="h-8 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>مراسلة واتساب</span>
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">لا يوجد رقم مسجل</span>
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
