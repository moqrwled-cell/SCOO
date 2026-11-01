import React, { useState, useRef, useMemo } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  Plus, 
  Trash2, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Edit2,
  Edit3,
  X,
  User,
  Calendar,
  Phone,
  Save,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  ArrowRightLeft,
  Search,
  Filter
} from 'lucide-react';
import { parseExcelFile, downloadSampleExcel } from '../utils/excelParser';
import { StudentAvatar } from './VisualCharts';

export default function ClassManager({ 
  classes, 
  teachers, 
  schoolName,
  onSaveClass, 
  onDeleteClass, 
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onSaveStudent,
  onDeleteStudent,
  onUpdateSchoolName
}) {
  const fileInputRef = useRef(null);

  // Tabs within Management: 'classes' | 'teachers' | 'all_students' | 'excel'
  const [activeSubTab, setActiveSubTab] = useState('classes');

  // School Name Edit State
  const [editingSchoolName, setEditingSchoolName] = useState(false);
  const [currentSchoolName, setCurrentSchoolName] = useState(schoolName || 'مدرسة قطوف الخير');

  // Class Edit / Add Modal
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null); // null = new, string = edit
  const [classFormName, setClassFormName] = useState('');
  const [classFormTeacherId, setClassFormTeacherId] = useState('');
  const [classFormSchedule, setClassFormSchedule] = useState('SAT_MON_WED');

  // Teacher Edit / Add Modal
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [teacherFormName, setTeacherFormName] = useState('');
  const [teacherFormPhone, setTeacherFormPhone] = useState('');

  // Manage Students Modal (for a specific class)
  const [activeClassStudents, setActiveClassStudents] = useState(null); // class object or null
  const [studentSearch, setStudentSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState(null); // null = add new, student obj = edit
  const [studentFormName, setStudentFormName] = useState('');
  const [studentFormId, setStudentFormId] = useState('');
  const [studentFormPhone, setStudentFormPhone] = useState('');
  const [showStudentForm, setShowStudentForm] = useState(false);

  // Transfer Student Modal
  const [transferringStudent, setTransferringStudent] = useState(null); // { student, fromClassId } or null
  const [transferTargetClassId, setTransferTargetClassId] = useState('');

  // All Students SubTab Filters
  const [allStudentsSearch, setAllStudentsSearch] = useState('');
  const [allStudentsClassFilter, setAllStudentsClassFilter] = useState('all');
  const [newStudentModalOpen, setNewStudentModalOpen] = useState(false);
  const [newStudentClassId, setNewStudentClassId] = useState(classes[0]?.id || '');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  // Excel Upload State
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [targetClassId, setTargetClassId] = useState('new');
  const [importClassName, setImportClassName] = useState('');
  const [importTeacherId, setImportTeacherId] = useState('');
  const [importSchedule, setImportSchedule] = useState('SAT_MON_WED');

  // Total school students count
  const totalStudentsCount = useMemo(() => {
    return classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);
  }, [classes]);

  // Master flattened students list with class info
  const allFlattenedStudents = useMemo(() => {
    const list = [];
    classes.forEach(c => {
      (c.students || []).forEach(st => {
        list.push({
          ...st,
          classId: c.id,
          className: c.name,
          teacherName: c.teacherName,
          schedule: c.schedule
        });
      });
    });
    list.sort((a, b) => a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' }));
    return list;
  }, [classes]);

  // ---------------- Handlers for School Name ----------------
  const handleSaveSchoolName = () => {
    if (!currentSchoolName.trim()) return;
    onUpdateSchoolName(currentSchoolName.trim());
    setEditingSchoolName(false);
  };

  // ---------------- Handlers for Classes ----------------
  const handleOpenNewClass = () => {
    setEditingClassId(null);
    setClassFormName('');
    setClassFormTeacherId(teachers[0]?.id || '');
    setClassFormSchedule('SAT_MON_WED');
    setClassModalOpen(true);
  };

  const handleOpenEditClass = (cls) => {
    setEditingClassId(cls.id);
    setClassFormName(cls.name);
    setClassFormTeacherId(cls.teacherId || '');
    setClassFormSchedule(cls.schedule || 'SAT_MON_WED');
    setClassModalOpen(true);
  };

  const handleSaveClassForm = async (e) => {
    e.preventDefault();
    if (!classFormName.trim()) return;

    const teacherObj = teachers.find(t => t.id === classFormTeacherId);
    const existingClass = classes.find(c => c.id === editingClassId);

    const payload = {
      id: editingClassId || undefined,
      name: classFormName.trim(),
      teacherId: classFormTeacherId,
      teacherName: teacherObj ? teacherObj.name : 'غير محدد',
      schedule: classFormSchedule,
      students: existingClass ? existingClass.students : []
    };

    await onSaveClass(payload);
    setClassModalOpen(false);
  };

  // ---------------- Handlers for Teachers ----------------
  const handleOpenNewTeacher = () => {
    setEditingTeacherId(null);
    setTeacherFormName('');
    setTeacherFormPhone('');
    setTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (t) => {
    setEditingTeacherId(t.id);
    setTeacherFormName(t.name);
    setTeacherFormPhone(t.phone || '');
    setTeacherModalOpen(true);
  };

  const handleSaveTeacherForm = async (e) => {
    e.preventDefault();
    if (!teacherFormName.trim()) return;

    if (editingTeacherId) {
      await onUpdateTeacher(editingTeacherId, {
        name: teacherFormName.trim(),
        phone: teacherFormPhone.trim()
      });
    } else {
      await onAddTeacher({
        name: teacherFormName.trim(),
        phone: teacherFormPhone.trim()
      });
    }
    setTeacherModalOpen(false);
  };

  // ---------------- Handlers for Students ----------------
  const handleOpenClassStudents = (cls) => {
    setActiveClassStudents(cls);
    setStudentSearch('');
    setShowStudentForm(false);
  };

  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentFormName('');
    setStudentFormId('');
    setStudentFormPhone('');
    setShowStudentForm(true);
  };

  const handleOpenEditStudent = (st) => {
    setEditingStudent(st);
    setStudentFormName(st.name);
    setStudentFormId(st.nationalId || '');
    setStudentFormPhone(st.phone || '');
    setShowStudentForm(true);
  };

  const handleSaveStudentForm = async (e) => {
    e.preventDefault();
    if (!studentFormName.trim() || !activeClassStudents) return;

    const studentPayload = {
      id: editingStudent ? editingStudent.id : undefined,
      name: studentFormName.trim(),
      nationalId: studentFormId.trim(),
      phone: studentFormPhone.trim()
    };

    const saved = await onSaveStudent(activeClassStudents.id, studentPayload);

    // Update active class state directly for instant view update
    setActiveClassStudents(prev => {
      if (!prev) return null;
      const students = [...(prev.students || [])];
      const sIdx = students.findIndex(s => s.id === (saved?.id || studentPayload.id));
      if (sIdx !== -1) {
        students[sIdx] = saved || { ...studentPayload, id: students[sIdx].id };
      } else {
        students.push(saved || studentPayload);
      }
      students.sort((a, b) => a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' }));
      return { ...prev, students };
    });
    setShowStudentForm(false);
  };

  const handleDeleteStudentAction = async (classId, studentId) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب نهائياً من قاعدة البيانات؟')) {
      await onDeleteStudent(classId, studentId);
      if (activeClassStudents) {
        setActiveClassStudents(prev => {
          if (!prev) return null;
          return {
            ...prev,
            students: (prev.students || []).filter(s => s.id !== studentId)
          };
        });
      }
    }
  };

  // ---------------- Handlers for Transferring Student ----------------
  const handleOpenTransferModal = (student, fromClassId) => {
    setTransferringStudent({ student, fromClassId });
    const otherClass = classes.find(c => c.id !== fromClassId);
    setTransferTargetClassId(otherClass ? otherClass.id : fromClassId);
  };

  const handleConfirmTransfer = async (e) => {
    e.preventDefault();
    if (!transferringStudent || !transferTargetClassId || transferTargetClassId === transferringStudent.fromClassId) {
      setTransferringStudent(null);
      return;
    }

    const { student } = transferringStudent;
    await onSaveStudent(transferTargetClassId, {
      id: student.id,
      name: student.name,
      nationalId: student.nationalId || student.national_id || '',
      phone: student.phone || ''
    });

    setTransferringStudent(null);
  };

  // ---------------- Handlers for Quick New Student from Master Directory ----------------
  const handleSaveNewStudentFromMaster = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentClassId) return;

    await onSaveStudent(newStudentClassId, {
      name: newStudentName.trim(),
      nationalId: newStudentId.trim(),
      phone: newStudentPhone.trim()
    });

    setNewStudentName('');
    setNewStudentId('');
    setNewStudentPhone('');
    setNewStudentModalOpen(false);
  };

  // ---------------- Handlers for Excel Import ----------------
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError('');

    try {
      const result = await parseExcelFile(file);
      setParsedData(result);
      
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
      setImportClassName(cleanFileName !== 'نموذج_طلاب_مدرسة_قطوف_الخير' ? cleanFileName : 'فصل جديد');
      setImportTeacherId(teachers[0]?.id || '');
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'حدث خطأ أثناء قراءة ملف الإكسل. تأكد من صحة الملف.');
      setParsedData(null);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData || !parsedData.students || parsedData.students.length === 0) {
      setUploadError('لا توجد بيانات طلاب للاستيراد');
      return;
    }

    try {
      if (targetClassId === 'new') {
        const teacherObj = teachers.find(t => t.id === importTeacherId);
        const newClass = {
          name: importClassName.trim() || 'فصل جديد',
          teacherId: importTeacherId,
          teacherName: teacherObj ? teacherObj.name : 'غير محدد',
          schedule: importSchedule,
          students: parsedData.students
        };
        await onSaveClass(newClass);
      } else {
        const existing = classes.find(c => c.id === targetClassId);
        if (existing) {
          const mergedStudents = [...(existing.students || [])];
          parsedData.students.forEach(st => {
            if (!mergedStudents.some(e => e.name === st.name)) {
              mergedStudents.push(st);
            }
          });
          mergedStudents.sort((a, b) => a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' }));

          await onSaveClass({
            ...existing,
            students: mergedStudents
          });
        }
      }

      setParsedData(null);
      setActiveSubTab('classes');
    } catch (err) {
      console.error(err);
      setUploadError('فشل حفظ الفصل في قاعدة البيانات');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner: School Name & Management Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            {editingSchoolName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentSchoolName}
                  onChange={(e) => setCurrentSchoolName(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-slate-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveSchoolName}
                  className="p-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  حفظ
                </button>
                <button
                  onClick={() => {
                    setCurrentSchoolName(schoolName);
                    setEditingSchoolName(false);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {schoolName || 'مدرسة قطوف الخير'}
                </h2>
                <button
                  onClick={() => setEditingSchoolName(true)}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  title="تعديل اسم المدرسة"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              تحرير وإدارة كاملة للمدير
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة كافة الفصول، المعلمات، والطلاب مع الحفظ السحابي الدائم في Supabase.
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('classes')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'classes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            إدارة الفصول ({classes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('teachers')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'teachers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            إدارة المعلمات ({teachers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('all_students')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'all_students'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            سجل الطلاب الشامل ({totalStudentsCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('excel')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'excel'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            رفع ملفات الإكسل
          </button>
        </div>
      </div>

      {/* ================= SUB-TAB 1: CLASSES MANAGEMENT ================= */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">قائمة الفصول المدرسية</h3>
              <p className="text-xs text-slate-500">نظام صف واحد لكل معلمة يتناوب كل 3 أيام</p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewClass}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فصل جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map(cls => (
              <div 
                key={cls.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">{cls.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        المعلمة المسؤولة: <strong className="text-slate-900 font-bold">{cls.teacherName || '-'}</strong>
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      cls.schedule === 'SAT_MON_WED'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {cls.schedule === 'SAT_MON_WED' ? 'سبت / إثنين / أربعاء' : 'أحد / ثلاثاء / خميس'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>عدد الطلاب: <strong className="text-slate-900 tabular-nums">{cls.students?.length || 0}</strong> طالب</span>
                  </div>
                </div>

                {/* Actions: Edit Class, Manage Students, Delete */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenClassStudents(cls)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>تعديل الطلاب ({cls.students?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditClass(cls)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="تعديل اسم الفصل والمعلمة والجدول"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`تحذير نهائي: هل أنت متأكد من حذف فصل "${cls.name}" نهائياً؟ سيتم حذفه من قاعدة البيانات وسحابة Supabase.`)) {
                        onDeleteClass(cls.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    title="حذف الفصل نهائياً"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: TEACHERS MANAGEMENT ================= */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">قائمة معلمات المدرسة</h3>
              <p className="text-xs text-slate-500">إضافة وتعديل وحذف بيانات المعلمات وتكليف الفصول</p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewTeacher}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة معلمة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map(t => {
              const teacherClass = classes.find(c => c.teacherId === t.id);

              return (
                <div 
                  key={t.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center">
                      {t.name[0] || 'م'}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{t.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.phone ? (
                          <span className="font-mono tabular-nums">{t.phone}</span>
                        ) : (
                          <span className="italic">بدون هاتف</span>
                        )}
                        {teacherClass && (
                          <span className="block text-[11px] text-emerald-700 font-semibold mt-0.5">
                            مسؤولة عن: {teacherClass.name}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditTeacher(t)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="تعديل اسم وهاتف المعلمة"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف المعلمة "${t.name}" نهائياً؟`)) {
                          onDeleteTeacher(t.id);
                        }
                      }}
                      className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                      title="حذف المعلمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: MASTER ALL STUDENTS DIRECTORY ================= */}
      {activeSubTab === 'all_students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">سجل الطلاب الشامل لجميع الفصول</h3>
              <p className="text-xs text-slate-500">
                عرض ونقل وتعديل وحذف أي طالب في المدرسة ({totalStudentsCount} طالب/طالبة)
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewStudentClassId(classes[0]?.id || '');
                setNewStudentName('');
                setNewStudentId('');
                setNewStudentPhone('');
                setNewStudentModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة طالب جديد للمدرسة</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="ابحث بالاسم، رقم القيد، أو رقم الهاتف..."
                value={allStudentsSearch}
                onChange={(e) => setAllStudentsSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={allStudentsClassFilter}
                onChange={(e) => setAllStudentsClassFilter(e.target.value)}
                className="h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none w-full sm:w-auto font-medium"
              >
                <option value="all">كل الفصول ({classes.length})</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.students?.length || 0})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Master Students Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">اسم الطالب</th>
                    <th className="py-3 px-4">الفصل الحالي</th>
                    <th className="py-3 px-4">المعلمة</th>
                    <th className="py-3 px-4 font-mono">رقم القيد</th>
                    <th className="py-3 px-4 font-mono">هاتف ولي الأمر</th>
                    <th className="py-3 px-4 text-left">إجراءات المدير</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const filtered = allFlattenedStudents.filter(st => {
                      const matchClass = allStudentsClassFilter === 'all' || st.classId === allStudentsClassFilter;
                      const q = allStudentsSearch.trim().toLowerCase();
                      const matchQuery = !q || 
                        st.name.toLowerCase().includes(q) || 
                        (st.nationalId || '').includes(q) || 
                        (st.phone || '').includes(q);
                      return matchClass && matchQuery;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-400">
                            لا يوجد طلاب مطابقين لخيارات البحث أو الفلترة.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((st, i) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <StudentAvatar name={st.name} className="w-7 h-7 text-[10px]" />
                            <span>{st.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            {st.className}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {st.teacherName}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                          {st.nationalId || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                          {st.phone || '-'}
                        </td>
                        <td className="py-3 px-4 text-left">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Transfer Student Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenTransferModal(st, st.classId)}
                              className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-1"
                              title="نقل الطالب إلى فصل دراسي آخر"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>نقل الفصل</span>
                            </button>

                            {/* Edit Student */}
                            <button
                              type="button"
                              onClick={() => {
                                const clsObj = classes.find(c => c.id === st.classId);
                                setActiveClassStudents(clsObj);
                                handleOpenEditStudent(st);
                              }}
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              title="تعديل بيانات الطالب"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Student */}
                            <button
                              type="button"
                              onClick={() => handleDeleteStudentAction(st.classId, st.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                              title="حذف الطالب نهائياً"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: EXCEL UPLOADER ================= */}
      {activeSubTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-slate-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file-upload-sub"
            />

            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-slate-800 mb-1">
              اسحب ملف الإكسل هنا، أو انقر للاختيار من جهازك
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              يدعم ملفات (.xlsx, .xls, .csv). يقوم النظام تلقائياً بفرز وترتيب أسماء الطلاب أبجدياً (أ - ي).
            </p>

            <div className="flex items-center justify-center gap-3">
              <label
                htmlFor="excel-file-upload-sub"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer shadow-xs transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isProcessing ? 'جارِ القراءة...' : 'اختيار ملف الإكسل'}</span>
              </label>

              <button
                type="button"
                onClick={downloadSampleExcel}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل نموذج جاهز</span>
              </button>
            </div>

            {uploadError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          {/* Parsed Preview */}
          {parsedData && (
            <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-md space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      تمت قراءة الملف بنجاح ({parsedData.totalRows} طالب/طالبة)
                    </h3>
                    <p className="text-xs text-slate-500">
                      تم ترتيب الأسماء أبجدياً تلقائياً (أ - ي)
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setParsedData(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">مكان حفظ الطلاب:</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="new">+ إنشاء صف جديد من هذا الملف</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>تحديث طلاب صف: {c.name}</option>
                    ))}
                  </select>
                </div>

                {targetClassId === 'new' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفصل:</label>
                    <input
                      type="text"
                      placeholder="مثلاً: فصل أ. ندى"
                      value={importClassName}
                      onChange={(e) => setImportClassName(e.target.value)}
                      className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المعلمة المسؤولة:</label>
                  <select
                    value={importTeacherId}
                    onChange={(e) => setImportTeacherId(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نظام دوام الفصل:</label>
                  <select
                    value={importSchedule}
                    onChange={(e) => setImportSchedule(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                  >
                    <option value="SAT_MON_WED">مجموعة (السبت - الإثنين - الأربعاء)</option>
                    <option value="SUN_TUE_THU">مجموعة (الأحد - الثلاثاء - الخميس)</option>
                  </select>
                </div>
              </div>

              {/* Confirm */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setParsedData(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 text-sm font-extrabold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  تأكيد وحفظ الفصل
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: EDIT / ADD CLASS ================= */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative space-y-4">
            <button
              onClick={() => setClassModalOpen(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900">
              {editingClassId ? 'تعديل بيانات الفصل' : 'إضافة فصل دراسي جديد'}
            </h3>

            <form onSubmit={handleSaveClassForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الفصل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: فصل أ. ندى"
                  value={classFormName}
                  onChange={(e) => setClassFormName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المعلمة المسؤولة:</label>
                <select
                  value={classFormTeacherId}
                  onChange={(e) => setClassFormTeacherId(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نظام الدوام (كل 3 أيام):</label>
                <select
                  value={classFormSchedule}
                  onChange={(e) => setClassFormSchedule(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                >
                  <option value="SAT_MON_WED">مجموعة (السبت - الإثنين - الأربعاء)</option>
                  <option value="SUN_TUE_THU">مجموعة (الأحد - الثلاثاء - الخميس)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT / ADD TEACHER ================= */}
      {teacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl relative space-y-4">
            <button
              onClick={() => setTeacherModalOpen(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900">
              {editingTeacherId ? 'تعديل بيانات المعلمة' : 'إضافة معلمة جديدة'}
            </h3>

            <form onSubmit={handleSaveTeacherForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المعلمة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: أ. فاطمة"
                  value={teacherFormName}
                  onChange={(e) => setTeacherFormName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثلاً: 0599111001"
                  value={teacherFormPhone}
                  onChange={(e) => setTeacherFormPhone(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTeacherModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  حفظ المعلمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANAGE STUDENTS OF A SPECIFIC CLASS ================= */}
      {activeClassStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>إدارة طلاب: {activeClassStudents.name}</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                    {activeClassStudents.students?.length || 0} طالب
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  المعلمة: {activeClassStudents.teacherName} • مرتبة أبجدياً (أ - ي)
                </p>
              </div>

              <button
                onClick={() => setActiveClassStudents(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Add / Edit Inline Form */}
            {showStudentForm && (
              <form onSubmit={handleSaveStudentForm} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    {editingStudent ? `تعديل بيانات الطالب: ${editingStudent.name}` : '+ إضافة طالب جديد للصف'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowStudentForm(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم الطالب:</label>
                    <input
                      type="text"
                      required
                      placeholder="الاسم الكامل"
                      value={studentFormName}
                      onChange={(e) => setStudentFormName(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم القيد:</label>
                    <input
                      type="text"
                      placeholder="رقم القيد أو الهوية"
                      value={studentFormId}
                      onChange={(e) => setStudentFormId(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">هاتف ولي الأمر:</label>
                    <input
                      type="text"
                      placeholder="رقم الواتساب / الهاتف"
                      value={studentFormPhone}
                      onChange={(e) => setStudentFormPhone(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                  >
                    {editingStudent ? 'تحديث بيانات الطالب' : 'إضافة الطالب للصف'}
                  </button>
                </div>
              </form>
            )}

            {/* Search & Actions Toolbar */}
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="ابحث عن طالب في هذا الفصل بالاسم أو الرقم..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />

              {!showStudentForm && (
                <button
                  type="button"
                  onClick={handleOpenAddStudent}
                  className="h-9 px-3.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shrink-0 inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>طالب جديد</span>
                </button>
              )}
            </div>

            {/* Students Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-2.5">م</th>
                    <th className="p-2.5">اسم الطالب (أبجدياً)</th>
                    <th className="p-2.5">رقم القيد</th>
                    <th className="p-2.5">هاتف ولي الأمر</th>
                    <th className="p-2.5 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const sorted = [...(activeClassStudents.students || [])].sort((a, b) => 
                      a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' })
                    );
                    const filtered = studentSearch.trim()
                      ? sorted.filter(s => 
                          s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          (s.nationalId || '').includes(studentSearch)
                        )
                      : sorted;

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400">
                            لا يوجد طلاب مطابقين.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((st, i) => (
                      <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 font-bold text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                          <StudentAvatar name={st.name} className="w-6 h-6 text-[10px]" />
                          <span>{st.name}</span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600 tabular-nums">{st.nationalId || '-'}</td>
                        <td className="p-2.5 font-mono text-slate-600 tabular-nums">{st.phone || '-'}</td>
                        <td className="p-2.5 text-left">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenTransferModal(st, activeClassStudents.id)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="نقل الطالب لفصل آخر"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditStudent(st)}
                              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                              title="تعديل بيانات الطالب"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudentAction(activeClassStudents.id, st.id)}
                              className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                              title="حذف الطالب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveClassStudents(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TRANSFER STUDENT TO ANOTHER CLASS ================= */}
      {transferringStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setTransferringStudent(null)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <span>نقل الطالب إلى فصل آخر</span>
            </h3>

            <p className="text-xs text-slate-500">
              اختر الفصل الجديد الذي ترغب بنقل الطالب <strong className="text-slate-900 font-bold">"{transferringStudent.student.name}"</strong> إليه:
            </p>

            <form onSubmit={handleConfirmTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الفصل المستهدف الجديد:</label>
                <select
                  value={transferTargetClassId}
                  onChange={(e) => setTransferTargetClassId(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id} disabled={c.id === transferringStudent.fromClassId}>
                      {c.name} {c.id === transferringStudent.fromClassId ? '(الفصل الحالي)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferringStudent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs"
                >
                  تأكيد النقل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD NEW STUDENT FROM MASTER DIRECTORY ================= */}
      {newStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setNewStudentModalOpen(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900">
              إضافة طالب جديد إلى المدرسة
            </h3>

            <form onSubmit={handleSaveNewStudentFromMaster} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر الفصل:</label>
                <select
                  value={newStudentClassId}
                  onChange={(e) => setNewStudentClassId(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب الرباعي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: يوسف أحمد الصالح"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهوية / القيد (اختياري):</label>
                <input
                  type="text"
                  placeholder="مثلاً: 1099"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">هاتف ولي الأمر (واتساب):</label>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="مثلاً: 0599000100"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  حفظ الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
