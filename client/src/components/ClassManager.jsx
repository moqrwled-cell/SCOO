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
  FileText,
  User,
  Calendar,
  Layers,
  ChevronDown,
  X
} from 'lucide-react';
import { parseExcelFile, downloadSampleExcel } from '../utils/excelParser';

export default function ClassManager({ 
  classes, 
  teachers, 
  onSaveClass, 
  onDeleteClass, 
  onAddTeacher 
}) {
  const fileInputRef = useRef(null);

  // Excel Upload State
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [parsedData, setParsedData] = useState(null);

  // New Class Form State (for import or manual)
  const [formClassName, setFormClassName] = useState('');
  const [formTeacherName, setFormTeacherName] = useState('');
  const [formSchedule, setFormSchedule] = useState('SAT_MON_WED');
  const [targetClassId, setTargetClassId] = useState('new'); // 'new' or existing class ID

  // Add Teacher Modal/Inline
  const [newTeacherName, setNewTeacherName] = useState('');
  const [showAddTeacher, setShowAddTeacher] = useState(false);

  // Handle Excel File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError('');

    try {
      const result = await parseExcelFile(file);
      setParsedData(result);
      
      // Auto-suggest class name from file or sheet name
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
      setFormClassName(cleanFileName !== 'نموذج_قائمة_الطلاب' ? cleanFileName : 'فصل جديد');
      if (teachers.length > 0 && !formTeacherName) {
        setFormTeacherName(teachers[0].name);
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'حدث خطأ أثناء قراءة ملف الإكسل. تأكد من صحة الملف.');
      setParsedData(null);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Confirm Import
  const handleConfirmImport = async () => {
    if (!parsedData || !parsedData.students || parsedData.students.length === 0) {
      setUploadError('لا توجد بيانات طلاب للاستيراد');
      return;
    }

    if (targetClassId === 'new' && !formClassName.trim()) {
      setUploadError('يرجى كتابة اسم الفصل');
      return;
    }

    const teacherObj = teachers.find(t => t.name === formTeacherName);

    const classPayload = {
      id: targetClassId === 'new' ? undefined : targetClassId,
      name: targetClassId === 'new' ? formClassName.trim() : (classes.find(c => c.id === targetClassId)?.name || formClassName),
      teacherId: teacherObj ? teacherObj.id : '',
      teacherName: formTeacherName || 'غير محدد',
      schedule: formSchedule,
      students: parsedData.students
    };

    await onSaveClass(classPayload);
    setParsedData(null);
    setFormClassName('');
    setUploadError('');
    alert('تم حفظ الفصل والطلاب بنجاح!');
  };

  // Add teacher helper
  const handleCreateTeacher = async () => {
    if (!newTeacherName.trim()) return;
    await onAddTeacher({ name: newTeacherName.trim() });
    setFormTeacherName(newTeacherName.trim());
    setNewTeacherName('');
    setShowAddTeacher(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Banner & Sample Download */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">إدارة الصفوف ورفع ملفات الإكسل</h2>
          <p className="text-xs text-slate-500 mt-1">
            ارفع ملف إكسل لكل فصل لمرة واحدة فقط. يتعرف النظام تلقائياً على الأسماء وأرقام الهواتف.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadSampleExcel}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 shadow-xs transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>تحميل نموذج Excel فارغ</span>
        </button>
      </div>

      {/* Upload Box */}
      <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-slate-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
          id="excel-file-upload"
        />

        <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 mb-1">
          اسحب ملف الإكسل هنا، أو انقر للاختيار من جهازك
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          يدعم ملفات (.xlsx, .xls, .csv). لا يشترط ترتيباً محدداً للأعمدة، فالنظام يكتشف عمود "اسم الطالب" ورقم القيد والهاتف تلقائياً.
        </p>

        <label
          htmlFor="excel-file-upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 cursor-pointer shadow-xs transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{isProcessing ? 'جارِ القراءة...' : 'اختيار ملف الإكسل'}</span>
        </label>

        {uploadError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Excel Preview & Import Settings Modal/Section */}
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
                  الأعمدة المكتشفة: اسم الطالب (عمود {parsedData.mapping.nameIdx + 1}) 
                  {parsedData.mapping.nationalIdIdx !== -1 && ` • رقم القيد (عمود ${parsedData.mapping.nationalIdIdx + 1})`}
                  {parsedData.mapping.phoneIdx !== -1 && ` • الهاتف (عمود ${parsedData.mapping.phoneIdx + 1})`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setParsedData(null)}
              className="text-slate-400 hover:text-slate-600 text-sm p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                مكان حفظ الطلاب:
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                <option value="new">+ إنشاء صف جديد من هذا الملف</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>تحديث طلاب صف: {c.name}</option>
                ))}
              </select>
            </div>

            {/* Class Name (if new) */}
            {targetClassId === 'new' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم الفصل:
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: الصف الأول (أ)"
                  value={formClassName}
                  onChange={(e) => setFormClassName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                />
              </div>
            )}

            {/* Teacher */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  المعلمة المسؤولة:
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddTeacher(!showAddTeacher)}
                  className="text-[11px] font-bold text-slate-600 hover:underline"
                >
                  + معلمة جديدة
                </button>
              </div>

              {showAddTeacher ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="اسم المعلمة الجديدة"
                    value={newTeacherName}
                    onChange={(e) => setNewTeacherName(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleCreateTeacher}
                    className="px-3 h-10 bg-slate-900 text-white rounded-lg text-xs font-bold"
                  >
                    إضافة
                  </button>
                </div>
              ) : (
                <select
                  value={formTeacherName}
                  onChange={(e) => setFormTeacherName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                  <option value="غير محدد">أخرى / غير محدد</option>
                </select>
              )}
            </div>

            {/* Schedule Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                نظام دوام الفصل:
              </label>
              <select
                value={formSchedule}
                onChange={(e) => setFormSchedule(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              >
                <option value="SAT_MON_WED">مجموعة (السبت - الإثنين - الأربعاء)</option>
                <option value="SUN_TUE_THU">مجموعة (الأحد - الثلاثاء - الخميس)</option>
              </select>
            </div>
          </div>

          {/* Students Preview Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2">معاينة أول 5 طلاب من الملف:</h4>
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">م</th>
                    <th className="p-2.5">اسم الطالب المستخرج</th>
                    <th className="p-2.5">رقم القيد</th>
                    <th className="p-2.5">هاتف ولي الأمر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parsedData.students.slice(0, 5).map((st, i) => (
                    <tr key={i}>
                      <td className="p-2.5 text-slate-500 tabular-nums">{i + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{st.name}</td>
                      <td className="p-2.5 font-mono text-slate-600 tabular-nums">{st.nationalId || '-'}</td>
                      <td className="p-2.5 font-mono text-slate-600 tabular-nums">{st.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirm Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setParsedData(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              تأكيد وحفظ الفصل في النظام
            </button>
          </div>
        </div>
      )}

      {/* Existing Classes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">الفصول المسجلة حالياً ({classes.length})</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map(cls => (
            <div 
              key={cls.id}
              className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cls.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      المعلمة: <span className="font-semibold text-slate-700">{cls.teacherName || '-'}</span>
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    cls.schedule === 'SAT_MON_WED'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {cls.schedule === 'SAT_MON_WED' ? 'سبت/إثنين/أربعاء' : 'أحد/ثلاثاء/خميس'}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cls.students?.length || 0} طالب</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">ID: {cls.id}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من رغبتك في حذف ${cls.name}؟`)) {
                      onDeleteClass(cls.id);
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف الفصل</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
