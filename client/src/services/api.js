// Resilient API client with automatic LocalStorage sync fallback

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'school_attendance_offline_db';

// Fallback initial data in case server is not running
const FALLBACK_DATA = {
  schoolName: "المدرسة النموذجية الحديثة",
  teachers: [
    { id: "t1", name: "أ. منى العبدالله", phone: "0599111001" },
    { id: "t2", name: "أ. ريم الشريف", phone: "0599111002" },
    { id: "t3", name: "أ. هبة القدسي", phone: "0599111003" }
  ],
  classes: [
    {
      id: "c1",
      name: "الصف الأول (أ) - مجموعة السبت/الإثنين/الأربعاء",
      teacherId: "t1",
      teacherName: "أ. منى العبدالله",
      schedule: "SAT_MON_WED",
      students: [
        { id: "s101", name: "إبراهيم خليل النجار", nationalId: "202401", phone: "0599000101" },
        { id: "s102", name: "أحمد محمود العاصي", nationalId: "202402", phone: "0599000102" },
        { id: "s103", name: "آية حمزة القواسمي", nationalId: "202403", phone: "0599000103" },
        { id: "s104", name: "براء عبد الرحمن صبيح", nationalId: "202404", phone: "0599000104" },
        { id: "s105", name: "تسنيم جميل البرغوثي", nationalId: "202405", phone: "0599000105" },
        { id: "s106", name: "جود زياد المصري", nationalId: "202406", phone: "0599000106" },
        { id: "s107", name: "حمزة طارق الدجاني", nationalId: "202407", phone: "0599000107" },
        { id: "s108", name: "خالد وليد التميمي", nationalId: "202408", phone: "0599000108" },
        { id: "s109", name: "دانيا سامر الخطيب", nationalId: "202409", phone: "0599000109" },
        { id: "s110", name: "رامي حسام عريقات", nationalId: "202410", phone: "0599000110" }
      ]
    },
    {
      id: "c2",
      name: "الصف الأول (ب) - مجموعة الأحد/الثلاثاء/الخميس",
      teacherId: "t1",
      teacherName: "أ. منى العبدالله",
      schedule: "SUN_TUE_THU",
      students: [
        { id: "s201", name: "سارة أيمن الجعبري", nationalId: "202421", phone: "0599000201" },
        { id: "s202", name: "سيف الدين عماد حنون", nationalId: "202422", phone: "0599000202" },
        { id: "s203", name: "شهد فادي البيطار", nationalId: "202423", phone: "0599000203" },
        { id: "s204", name: "طارق زياد الكردي", nationalId: "202424", phone: "0599000204" },
        { id: "s205", name: "عمر فاروق الشوا", nationalId: "202425", phone: "0599000205" },
        { id: "s206", name: "فاطمة عيسى الزعبي", nationalId: "202426", phone: "0599000206" },
        { id: "s207", name: "كريم ماهر الأيوبي", nationalId: "202427", phone: "0599000207" },
        { id: "s208", name: "ليان نضال الصالحي", nationalId: "202428", phone: "0599000208" }
      ]
    },
    {
      id: "c3",
      name: "الصف الثاني (أ) - مجموعة السبت/الإثنين/الأربعاء",
      teacherId: "t2",
      teacherName: "أ. ريم الشريف",
      schedule: "SAT_MON_WED",
      students: [
        { id: "s301", name: "مايا بسام العوضي", nationalId: "202431", phone: "0599000301" },
        { id: "s302", name: "محمد وسيم الدحدوح", nationalId: "202432", phone: "0599000302" },
        { id: "s303", name: "مريم إياد شاهين", nationalId: "202433", phone: "0599000303" },
        { id: "s304", name: "نور الدين هشام عابد", nationalId: "202434", phone: "0599000304" },
        { id: "s305", name: "هاشم فراس البنا", nationalId: "202435", phone: "0599000305" }
      ]
    },
    {
      id: "c4",
      name: "الصف الثاني (ب) - مجموعة الأحد/الثلاثاء/الخميس",
      teacherId: "t2",
      teacherName: "أ. ريم الشريف",
      schedule: "SUN_TUE_THU",
      students: [
        { id: "s401", name: "ياسمين كمال حداد", nationalId: "202441", phone: "0599000401" },
        { id: "s402", name: "يوسف بشير حجازي", nationalId: "202442", phone: "0599000402" },
        { id: "s403", name: "آدم مصعب السمان", nationalId: "202443", phone: "0599000403" },
        { id: "s404", name: "ريتاج نزار غنام", nationalId: "202444", phone: "0599000404" }
      ]
    }
  ],
  attendance: {}
};

function getLocalData() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(FALLBACK_DATA));
      return FALLBACK_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    return FALLBACK_DATA;
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
  // Check backend server status
  async checkStatus() {
    try {
      const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(2000) });
      if (!res.ok) throw new Error('Server returned ' + res.status);
      return await res.json();
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  },

  // Load complete school data
  async getSchoolData() {
    try {
      const res = await fetch(`${API_BASE}/school-data`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        saveLocalData(data);
        return { data, isOnline: true };
      }
    } catch (e) {
      console.warn('Backend unavailable, falling back to LocalStorage:', e.message);
    }
    return { data: getLocalData(), isOnline: false };
  },

  // Save class (create or update)
  async saveClass(classData) {
    try {
      const res = await fetch(`${API_BASE}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const saved = await res.json();
        // Update local copy too
        const local = getLocalData();
        const idx = (local.classes || []).findIndex(c => c.id === saved.id);
        if (idx !== -1) local.classes[idx] = saved;
        else (local.classes = local.classes || []).push(saved);
        saveLocalData(local);
        return saved;
      }
    } catch (e) {
      console.warn('Backend unavailable for saveClass, saving locally:', e.message);
    }

    // Local fallback
    const local = getLocalData();
    local.classes = local.classes || [];
    let saved = { ...classData };
    if (!saved.id) saved.id = 'c_' + Date.now();
    const idx = local.classes.findIndex(c => c.id === saved.id);
    if (idx !== -1) local.classes[idx] = saved;
    else local.classes.push(saved);
    saveLocalData(local);
    return saved;
  },

  // Delete class
  async deleteClass(classId) {
    try {
      await fetch(`${API_BASE}/classes/${classId}`, { method: 'DELETE', signal: AbortSignal.timeout(3000) });
    } catch (e) {
      console.warn('Backend delete failed, deleting locally:', e.message);
    }
    const local = getLocalData();
    local.classes = (local.classes || []).filter(c => c.id !== classId);
    saveLocalData(local);
    return true;
  },

  // Add teacher
  async addTeacher(teacherData) {
    try {
      const res = await fetch(`${API_BASE}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const saved = await res.json();
        const local = getLocalData();
        (local.teachers = local.teachers || []).push(saved);
        saveLocalData(local);
        return saved;
      }
    } catch (e) {
      console.warn('Backend addTeacher failed, saving locally:', e.message);
    }
    const local = getLocalData();
    const newT = { id: 't_' + Date.now(), ...teacherData };
    (local.teachers = local.teachers || []).push(newT);
    saveLocalData(local);
    return newT;
  },

  // Save Attendance
  async saveAttendance({ date, classId, records, recordedBy, notes }) {
    const payload = { date, classId, records, recordedBy, notes };
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const result = await res.json();
        // Sync local
        const local = getLocalData();
        local.attendance = local.attendance || {};
        local.attendance[date] = local.attendance[date] || {};
        local.attendance[date][classId] = result.attendance;
        saveLocalData(local);
        return result;
      }
    } catch (e) {
      console.warn('Backend saveAttendance failed, saving locally:', e.message);
    }

    // Local fallback
    const local = getLocalData();
    local.attendance = local.attendance || {};
    local.attendance[date] = local.attendance[date] || {};
    local.attendance[date][classId] = {
      recordedAt: new Date().toISOString(),
      recordedBy: recordedBy || 'المعلمة',
      records,
      notes: notes || ''
    };
    saveLocalData(local);
    return { success: true, date, classId, attendance: local.attendance[date][classId] };
  }
};
