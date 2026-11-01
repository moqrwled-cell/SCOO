import React, { useState, useRef } from 'react';
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
  ArrowUpDown
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

  // Tabs within Management: 'classes' | 'teachers' | 'excel'
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

  // Excel Upload State
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [targetClassId, setTargetClassId] = useState('new');
  const [importClassName, setImportClassName] = useState('');
  const [importTeacherId, setImportTeacherId] = useState('');
  const [importSchedule, setImportSchedule] = useState('SAT_MON_WED');

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

  const handleDeleteStudentAction = async (studentId) => {
    if (!activeClassStudents) return;
    if (confirm('هل أنت متأكد من حذف هذا الطالب من الفصل؟')) {
      await onDeleteStudent(activeClassStudents.id, studentId);
      // Immediately remove student from modal view
      setActiveClassStudents(prev => {
        if (!prev) return null;
        return {
          ...prev,
          students: (prev.students || []).filter(s => s.id !== studentId)
        };
      });
    }
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

    if (targetClassId === 'new' && !importClassName.trim()) {
      setUploadError('يرجى إدخال اسم الفصل');
      return;
    }

    const teacherObj = teachers.find(t => t.id === importTeacherId);

    const classPayload = {
      id: targetClassId === 'new' ? undefined : targetClassId,
      name: targetClassId === 'new' ? importClassName.trim() : (classes.find(c => c.id === targetClassId)?.name || importClassName),
      teacherId: importTeacherId,
      teacherName: teacherObj ? teacherObj.name : 'غير محدد',
      schedule: importSchedule,
      students: parsedData.students
    };

    await onSaveClass(classPayload);
    setParsedData(null);
    setImportClassName('');
    setUploadError('');
    alert('تم حفظ الفصل والطلاب بنجاح في قاعدة البيانات!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: School Header & Name Editor */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            {editingSchoolName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentSchoolName}
                  onChange={(e) => setCurrentSchoolName(e.target.value)}
                  className="px-3 py-1 text-base font-extrabold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleSaveSchoolName}
                  className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold"
                >
                  حفظ
                </button>
                <button
                  type="button"
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
              لوحة التحكم والإدارة الشاملة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إمكانية التعديل والإضافة والحذف الكاملة لكافة الفصول، المعلمات، والطلاب مع الحفظ السحابي في Supabase.
          </p>
        </div>

        {/* Sub-Navigation Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('classes')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'classes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            إدارة الفصول والطلاب ({classes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('teachers')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'teachers'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            إدارة المعلمات ({teachers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('excel')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'excel'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            رفع ملفات الإكسل
          </button>
        </div>
      </div>

      {/* ================= SECTION 1: CLASSES MANAGEMENT ================= */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">قائمة الفصول المدرسية</h3>
              <p className="text-xs text-slate-500">نظام صف واحد لكل معلمة كل 3 أيام</p>
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
                      if (confirm(`هل أنت متأكد من حذف فصل "${cls.name}" وكافة طلابه؟`)) {
                        onDeleteClass(cls.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    title="حذف الفصل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: TEACHERS MANAGEMENT ================= */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">قائمة معلمات مدرسة قطوف الخير</h3>
              <p className="text-xs text-slate-500">إضافة وتعديل وحذف بيانات المعلمات</p>
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
                        if (confirm(`هل أنت متأكد من حذف المعلمة "${t.name}"؟`)) {
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

      {/* ================= SECTION 3: EXCEL UPLOADER ================= */}
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

      {/* ================= MODAL: MANAGE STUDENTS OF CLASS ================= */}
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
                              onClick={() => handleOpenEditStudent(st)}
                              className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded"
                              title="تعديل بيانات الطالب"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudentAction(st.id)}
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
    </div>
  );
}
