import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import TeacherView from './components/TeacherView';
import PrincipalDashboard from './components/PrincipalDashboard';
import ClassManager from './components/ClassManager';
import PhoneConnectModal from './components/PhoneConnectModal';
import { api } from './services/api';
import { getTodayDateString } from './utils/dateHelpers';

export default function App() {
  const [currentTab, setCurrentTab] = useState('teacher'); // 'teacher' | 'principal' | 'classes'
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  
  // School Data State
  const [schoolName, setSchoolName] = useState('مدرسة قطوف الخير');
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [isOnline, setIsOnline] = useState(false);
  const [lanUrl, setLanUrl] = useState('');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      const res = await api.getSchoolData();
      if (res && res.data) {
        setSchoolName(res.data.schoolName || 'المدرسة النموذجية الحديثة');
        setTeachers(res.data.teachers || []);
        setClasses(res.data.classes || []);
        setAttendanceData(res.data.attendance || {});
        setIsOnline(res.isOnline);
      }

      // Check server IP
      const statusRes = await api.checkStatus();
      if (statusRes.status === 'ok') {
        setLanUrl(statusRes.lanUrl);
        setIsOnline(true);
      }
    } catch (e) {
      console.error('Error loading school data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh every 8 seconds to synchronize between teachers & principal
    const timer = setInterval(() => {
      loadData();
    }, 8000);

    return () => clearInterval(timer);
  }, [loadData]);

  // Handler: Save Attendance
  const handleSaveAttendance = async ({ date, classId, records, recordedBy }) => {
    // Optimistic state update
    setAttendanceData(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [classId]: {
          recordedAt: new Date().toISOString(),
          recordedBy,
          records
        }
      }
    }));

    await api.saveAttendance({ date, classId, records, recordedBy });
  };

  // Handler: Save Class (add or update)
  const handleSaveClass = async (classData) => {
    const saved = await api.saveClass(classData);
    setClasses(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  // Handler: Delete Class
  const handleDeleteClass = async (classId) => {
    await api.deleteClass(classId);
    setClasses(prev => prev.filter(c => c.id !== classId));
  };

  // Handler: Add Teacher
  const handleAddTeacher = async (teacherData) => {
    const saved = await api.addTeacher(teacherData);
    setTeachers(prev => [...prev, saved]);
  };

  // Handler: Update Teacher
  const handleUpdateTeacher = async (teacherId, teacherData) => {
    await api.updateTeacher(teacherId, teacherData);
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, ...teacherData } : t));
    if (teacherData.name) {
      setClasses(prev => prev.map(c => c.teacherId === teacherId ? { ...c, teacherName: teacherData.name } : c));
    }
  };

  // Handler: Delete Teacher
  const handleDeleteTeacher = async (teacherId) => {
    await api.deleteTeacher(teacherId);
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
  };

  // Handler: Save Student (Add or Edit)
  const handleSaveStudent = async (classId, studentData) => {
    const saved = await api.saveStudent(classId, studentData);
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const students = [...(c.students || [])];
        const sIdx = students.findIndex(s => s.id === saved.id);
        if (sIdx !== -1) students[sIdx] = saved;
        else students.push(saved);
        students.sort((a, b) => a.name.localeCompare(b.name, 'ar', { sensitivity: 'base' }));
        return { ...c, students };
      }
      return c;
    }));
    return saved;
  };

  // Handler: Delete Student
  const handleDeleteStudent = async (classId, studentId) => {
    await api.deleteStudent(classId, studentId);
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return { ...c, students: (c.students || []).filter(s => s.id !== studentId) };
      }
      return c;
    }));
  };

  // Handler: Update School Name
  const handleUpdateSchoolName = async (newName) => {
    if (!newName) return;
    await api.updateSchoolName(newName);
    setSchoolName(newName);
  };

  // Switch to teacher view with specific class selected
  const handleViewClass = (classId) => {
    setCurrentTab('teacher');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">جارِ تحميل نظام الحضور والغياب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedDate={selectedDate}
        schoolName={schoolName}
        isOnline={isOnline}
        lanUrl={lanUrl}
        onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
      />

      <main className="flex-1 pb-16">
        {currentTab === 'teacher' && (
          <TeacherView
            classes={classes}
            teachers={teachers}
            attendanceData={attendanceData}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onSaveAttendance={handleSaveAttendance}
          />
        )}

        {currentTab === 'principal' && (
          <PrincipalDashboard
            classes={classes}
            teachers={teachers}
            attendanceData={attendanceData}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            schoolName={schoolName}
            onViewClass={handleViewClass}
          />
        )}

        {currentTab === 'classes' && (
          <ClassManager
            classes={classes}
            teachers={teachers}
            schoolName={schoolName}
            onSaveClass={handleSaveClass}
            onDeleteClass={handleDeleteClass}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onUpdateSchoolName={handleUpdateSchoolName}
          />
        )}
      </main>

      <PhoneConnectModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        lanUrl={lanUrl}
      />
    </div>
  );
}
