import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to get local network IP address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Initial Database Template
const INITIAL_DATA = {
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

// Database Read/Write Utilities
function getDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, using initial:', err);
    return INITIAL_DATA;
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving DB:', err);
    return false;
  }
}

// ----------------- API ROUTES -----------------

// Status & Network info
app.get('/api/status', (req, res) => {
  const localIp = getLocalIp();
  res.json({
    status: 'ok',
    port: PORT,
    localIp,
    lanUrl: `http://${localIp}:${PORT}`,
    currentTime: new Date().toISOString()
  });
});

// Get all data (initial load)
app.get('/api/school-data', (req, res) => {
  const db = getDB();
  res.json(db);
});

// Update school settings
app.post('/api/settings', (req, res) => {
  const db = getDB();
  const { schoolName } = req.body;
  if (schoolName) {
    db.schoolName = schoolName;
    saveDB(db);
  }
  res.json({ success: true, schoolName: db.schoolName });
});

// Teachers: list & add
app.get('/api/teachers', (req, res) => {
  const db = getDB();
  res.json(db.teachers || []);
});

app.post('/api/teachers', (req, res) => {
  const db = getDB();
  const { name, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const newTeacher = {
    id: 't_' + Date.now(),
    name: name.trim(),
    phone: phone ? phone.trim() : ''
  };
  db.teachers = db.teachers || [];
  db.teachers.push(newTeacher);
  saveDB(db);
  res.json(newTeacher);
});

// Classes: list, add, update, delete
app.get('/api/classes', (req, res) => {
  const db = getDB();
  res.json(db.classes || []);
});

app.post('/api/classes', (req, res) => {
  const db = getDB();
  const { id, name, teacherId, teacherName, schedule, students } = req.body;

  if (!name) return res.status(400).json({ error: 'Class name is required' });

  db.classes = db.classes || [];

  if (id) {
    // Update existing class
    const idx = db.classes.findIndex(c => c.id === id);
    if (idx !== -1) {
      db.classes[idx] = {
        ...db.classes[idx],
        name: name.trim(),
        teacherId: teacherId || db.classes[idx].teacherId,
        teacherName: teacherName || db.classes[idx].teacherName,
        schedule: schedule || db.classes[idx].schedule,
        students: students || db.classes[idx].students || []
      };
      saveDB(db);
      return res.json(db.classes[idx]);
    }
  }

  // Create new class
  const newClass = {
    id: id || 'c_' + Date.now(),
    name: name.trim(),
    teacherId: teacherId || '',
    teacherName: teacherName || 'غير محدد',
    schedule: schedule || 'SAT_MON_WED',
    students: students || []
  };

  db.classes.push(newClass);
  saveDB(db);
  res.json(newClass);
});

// Delete class
app.delete('/api/classes/:id', (req, res) => {
  const db = getDB();
  const classId = req.params.id;
  db.classes = (db.classes || []).filter(c => c.id !== classId);
  saveDB(db);
  res.json({ success: true, deletedId: classId });
});

// Bulk import/replace students in a class
app.post('/api/classes/:id/students', (req, res) => {
  const db = getDB();
  const classId = req.params.id;
  const { students } = req.body;

  const targetClass = (db.classes || []).find(c => c.id === classId);
  if (!targetClass) {
    return res.status(404).json({ error: 'Class not found' });
  }

  targetClass.students = students || [];
  saveDB(db);
  res.json(targetClass);
});

// Attendance: get for specific date
app.get('/api/attendance', (req, res) => {
  const db = getDB();
  const { date } = req.query; // YYYY-MM-DD
  const targetDate = date || new Date().toISOString().split('T')[0];
  const dayAttendance = (db.attendance && db.attendance[targetDate]) || {};
  res.json({
    date: targetDate,
    attendance: dayAttendance
  });
});

// Attendance: Save class attendance for a specific date
app.post('/api/attendance', (req, res) => {
  const db = getDB();
  const { date, classId, records, recordedBy, notes } = req.body;

  if (!date || !classId || !records) {
    return res.status(400).json({ error: 'Missing required attendance fields' });
  }

  db.attendance = db.attendance || {};
  db.attendance[date] = db.attendance[date] || {};

  db.attendance[date][classId] = {
    recordedAt: new Date().toISOString(),
    recordedBy: recordedBy || 'معلمة الصف',
    records, // { studentId: 'present' | 'absent' | 'late' | 'excused' }
    notes: notes || ''
  };

  saveDB(db);
  res.json({
    success: true,
    date,
    classId,
    attendance: db.attendance[date][classId]
  });
});

// Reset entire database to default or clear attendance
app.post('/api/reset', (req, res) => {
  const { mode } = req.body;
  if (mode === 'all') {
    saveDB(INITIAL_DATA);
    return res.json({ success: true, message: 'Reset all data to defaults' });
  } else if (mode === 'attendance_only') {
    const db = getDB();
    db.attendance = {};
    saveDB(db);
    return res.json({ success: true, message: 'Cleared attendance records' });
  }
  res.status(400).json({ error: 'Invalid mode' });
});

// Serve frontend build if available
const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Express 5 wildcard syntax
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`=======================================================`);
  console.log(`🏫 نظام حضور وغياب المدرسة يعمل بنجاح!`);
  console.log(`📍 الرابط المحلي: http://localhost:${PORT}`);
  console.log(`📱 رابط الجوال على شبكة المدرسة: http://${localIp}:${PORT}`);
  console.log(`=======================================================`);
});
