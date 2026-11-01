import { supabase } from './supabaseClient';

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'qutoof_alkhair_attendance_db_v2';

// Standard 5 Teachers & Classes for Qutoof Al-Khair School
export const DEFAULT_SCHOOL_DATA = {
  schoolName: "مدرسة قطوف الخير",
  teachers: [
    { id: "t_nada", name: "أ. ندى", phone: "0599111001" },
    { id: "t_nesreen", name: "أ. نسرين", phone: "0599111002" },
    { id: "t_maram", name: "أ. مرام", phone: "0599111003" },
    { id: "t_aseel", name: "أ. أسيل", phone: "0599111004" },
    { id: "t_fatima", name: "أ. فاطمة", phone: "0599111005" }
  ],
  classes: [
    {
      id: "c_nada",
      name: "فصل أ. ندى",
      teacherId: "t_nada",
      teacherName: "أ. ندى",
      schedule: "SAT_MON_WED",
      students: [
        { id: "s101", name: "إبراهيم خليل النجار", nationalId: "1001", phone: "0599000101" },
        { id: "s102", name: "أحمد محمود العاصي", nationalId: "1002", phone: "0599000102" },
        { id: "s103", name: "آية حمزة القواسمي", nationalId: "1003", phone: "0599000103" },
        { id: "s104", name: "براء عبد الرحمن صبيح", nationalId: "1004", phone: "0599000104" },
        { id: "s105", name: "تسنيم جميل البرغوثي", nationalId: "1005", phone: "0599000105" },
        { id: "s106", name: "جود زياد المصري", nationalId: "1006", phone: "0599000106" },
        { id: "s107", name: "حمزة طارق الدجاني", nationalId: "1007", phone: "0599000107" },
        { id: "s108", name: "خالد وليد التميمي", nationalId: "1008", phone: "0599000108" }
      ]
    },
    {
      id: "c_nesreen",
      name: "فصل أ. نسرين",
      teacherId: "t_nesreen",
      teacherName: "أ. نسرين",
      schedule: "SUN_TUE_THU",
      students: [
        { id: "s201", name: "دانيا سامر الخطيب", nationalId: "2001", phone: "0599000201" },
        { id: "s202", name: "رامي حسام عريقات", nationalId: "2002", phone: "0599000202" },
        { id: "s203", name: "سارة أيمن الجعبري", nationalId: "2003", phone: "0599000203" },
        { id: "s204", name: "سيف الدين عماد حنون", nationalId: "2004", phone: "0599000204" },
        { id: "s205", name: "شهد فادي البيطار", nationalId: "2005", phone: "0599000205" },
        { id: "s206", name: "طارق زياد الكردي", nationalId: "2006", phone: "0599000206" }
      ]
    },
    {
      id: "c_maram",
      name: "فصل أ. مرام",
      teacherId: "t_maram",
      teacherName: "أ. مرام",
      schedule: "SAT_MON_WED",
      students: [
        { id: "s301", name: "عمر فاروق الشوا", nationalId: "3001", phone: "0599000301" },
        { id: "s302", name: "فاطمة عيسى الزعبي", nationalId: "3002", phone: "0599000302" },
        { id: "s303", name: "كريم ماهر الأيوبي", nationalId: "3003", phone: "0599000303" },
        { id: "s304", name: "ليان نضال الصالحي", nationalId: "3004", phone: "0599000304" },
        { id: "s305", name: "مايا بسام العوضي", nationalId: "3005", phone: "0599000305" }
      ]
    },
    {
      id: "c_aseel",
      name: "فصل أ. أسيل",
      teacherId: "t_aseel",
      teacherName: "أ. أسيل",
      schedule: "SUN_TUE_THU",
      students: [
        { id: "s401", name: "محمد وسيم الدحدوح", nationalId: "4001", phone: "0599000401" },
        { id: "s402", name: "مريم إياد شاهين", nationalId: "4002", phone: "0599000402" },
        { id: "s403", name: "نور الدين هشام عابد", nationalId: "4003", phone: "0599000403" },
        { id: "s404", name: "هاشم فراس البنا", nationalId: "4004", phone: "0599000404" }
      ]
    },
    {
      id: "c_fatima",
      name: "فصل أ. فاطمة",
      teacherId: "t_fatima",
      teacherName: "أ. فاطمة",
      schedule: "SAT_MON_WED",
      students: [
        { id: "s501", name: "آدم مصعب السمان", nationalId: "5001", phone: "0599000501" },
        { id: "s502", name: "ريتاج نزار غنام", nationalId: "5002", phone: "0599000502" },
        { id: "s503", name: "ياسمين كمال حداد", nationalId: "5003", phone: "0599000503" },
        { id: "s504", name: "يوسف بشير حجازي", nationalId: "5004", phone: "0599000504" }
      ]
    }
  ],
  attendance: {}
};

function getLocalData() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SCHOOL_DATA));
      return DEFAULT_SCHOOL_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SCHOOL_DATA;
  }
}

function saveLocalData(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

export const api = {
  // Check backend server & Supabase status
  async checkStatus() {
    let supabaseOk = false;
    try {
      const { error } = await supabase.from('teachers').select('id').limit(1);
      if (!error) supabaseOk = true;
    } catch (e) {
      supabaseOk = false;
    }

    try {
      const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const json = await res.json();
        return { ...json, supabase: supabaseOk };
      }
    } catch (e) {
      // Local server not running
    }

    return { 
      status: 'ok', 
      supabase: supabaseOk, 
      localIp: 'localhost', 
      lanUrl: window.location.origin 
    };
  },

  // Load complete school data
  async getSchoolData() {
    // 1. Try Supabase Cloud DB
    try {
      const [tRes, cRes, sRes, aRes] = await Promise.all([
        supabase.from('teachers').select('*'),
        supabase.from('classes').select('*'),
        supabase.from('students').select('*'),
        supabase.from('attendance').select('*')
      ]);

      if (!tRes.error && !cRes.error && !sRes.error) {
        const teachers = tRes.data && tRes.data.length > 0 ? tRes.data : DEFAULT_SCHOOL_DATA.teachers;
        const rawClasses = cRes.data && cRes.data.length > 0 ? cRes.data : DEFAULT_SCHOOL_DATA.classes;
        const allStudents = sRes.data || [];

        // Group students into classes and sort alphabetically
        const classes = rawClasses.map(cls => {
          const clsStudents = (allStudents.length > 0
            ? allStudents.filter(st => st.class_id === cls.id)
            : (cls.students || [])
          ).map(st => ({
            id: st.id,
            name: st.name,
            nationalId: st.national_id || st.nationalId,
            phone: st.phone
          }));

          clsStudents.sort((a, b) => a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' }));

          return {
            id: cls.id,
            name: cls.name,
            teacherId: cls.teacher_id || cls.teacherId,
            teacherName: cls.teacher_name || cls.teacherName,
            schedule: cls.schedule || 'SAT_MON_WED',
            students: clsStudents
          };
        });

        // Group attendance by date and class
        const attendance = {};
        if (aRes.data) {
          aRes.data.forEach(row => {
            const date = row.date;
            const classId = row.class_id;
            attendance[date] = attendance[date] || {};
            attendance[date][classId] = attendance[date][classId] || {
              recordedAt: row.recorded_at,
              recordedBy: row.recorded_by,
              records: {}
            };
            attendance[date][classId].records[row.student_id] = row.status;
          });
        }

        const cloudData = {
          schoolName: "مدرسة قطوف الخير",
          teachers,
          classes,
          attendance
        };
        saveLocalData(cloudData);
        return { data: cloudData, isOnline: true, source: 'supabase' };
      }
    } catch (e) {
      console.warn('Supabase query failed, trying local server:', e);
    }

    // 2. Try Local Node.js Express server
    try {
      const res = await fetch(`${API_BASE}/school-data`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const data = await res.json();
        saveLocalData(data);
        return { data, isOnline: true, source: 'local_server' };
      }
    } catch (e) {
      // Server unavailable
    }

    // 3. Fallback to LocalStorage
    return { data: getLocalData(), isOnline: false, source: 'local_storage' };
  },

  // Save Attendance (Supports Supabase + Local)
  async saveAttendance({ date, classId, records, recordedBy }) {
    // 1. Save to Supabase Cloud
    try {
      const rowsToInsert = Object.entries(records).map(([studentId, status]) => ({
        id: `${date}_${classId}_${studentId}`,
        date,
        class_id: classId,
        student_id: studentId,
        status,
        recorded_by: recordedBy || 'معلمة الصف',
        recorded_at: new Date().toISOString()
      }));

      await supabase.from('attendance').upsert(rowsToInsert, { onConflict: 'date,class_id,student_id' });
    } catch (e) {
      console.warn('Supabase attendance save failed:', e);
    }

    // 2. Save to local Express server if available
    try {
      await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, classId, records, recordedBy }),
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {
      // Ignore
    }

    // 3. Save to LocalStorage
    const local = getLocalData();
    local.attendance = local.attendance || {};
    local.attendance[date] = local.attendance[date] || {};
    local.attendance[date][classId] = {
      recordedAt: new Date().toISOString(),
      recordedBy: recordedBy || 'معلمة الصف',
      records
    };
    saveLocalData(local);

    return { success: true, date, classId, attendance: local.attendance[date][classId] };
  },

  // Save Class (Add or Update)
  async saveClass(classData) {
    const classId = classData.id || ('c_' + Date.now());
    const sortedStudents = [...(classData.students || [])].sort((a, b) => 
      a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' })
    );

    const fullClass = {
      ...classData,
      id: classId,
      students: sortedStudents
    };

    // Try Supabase
    try {
      await supabase.from('classes').upsert({
        id: classId,
        name: fullClass.name,
        teacher_id: fullClass.teacherId || null,
        teacher_name: fullClass.teacherName,
        schedule: fullClass.schedule
      });

      if (sortedStudents.length > 0) {
        const studentRows = sortedStudents.map(st => ({
          id: st.id,
          class_id: classId,
          name: st.name,
          national_id: st.nationalId || null,
          phone: st.phone || null
        }));
        await supabase.from('students').upsert(studentRows);
      }
    } catch (e) {
      console.warn('Supabase saveClass failed:', e);
    }

    // Try Local Server
    try {
      await fetch(`${API_BASE}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullClass),
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {
      // Ignore
    }

    // LocalStorage
    const local = getLocalData();
    local.classes = local.classes || [];
    const idx = local.classes.findIndex(c => c.id === classId);
    if (idx !== -1) local.classes[idx] = fullClass;
    else local.classes.push(fullClass);
    saveLocalData(local);

    return fullClass;
  },

  // Delete Class
  async deleteClass(classId) {
    try {
      await supabase.from('classes').delete().eq('id', classId);
    } catch (e) {
      console.warn('Supabase deleteClass failed:', e);
    }

    try {
      await fetch(`${API_BASE}/classes/${classId}`, { method: 'DELETE', signal: AbortSignal.timeout(2000) });
    } catch (e) {
      // Ignore
    }

    const local = getLocalData();
    local.classes = (local.classes || []).filter(c => c.id !== classId);
    saveLocalData(local);
    return true;
  },

  // Add Teacher
  async addTeacher(teacherData) {
    const teacherId = teacherData.id || ('t_' + Date.now());
    const newT = { ...teacherData, id: teacherId };

    try {
      await supabase.from('teachers').upsert(newT);
    } catch (e) {
      console.warn('Supabase addTeacher failed:', e);
    }

    try {
      await fetch(`${API_BASE}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newT),
        signal: AbortSignal.timeout(2000)
      });
    } catch (e) {
      // Ignore
    }

    const local = getLocalData();
    local.teachers = local.teachers || [];
    local.teachers.push(newT);
    saveLocalData(local);
    return newT;
  }
};
