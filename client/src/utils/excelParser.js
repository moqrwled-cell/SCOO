import * as XLSX from 'xlsx';

// Smart column matching dictionary
const FIELD_KEYWORDS = {
  name: ['اسم الطالب', 'الاسم', 'اسم', 'طالب', 'الاسم الثلاثي', 'الاسم الكامل', 'name', 'student_name', 'student'],
  nationalId: ['رقم القيد', 'الرقم المدرسي', 'رقم الهوية', 'الهوية', 'القيد', 'رقم التسجيل', 'كود الطالب', 'id', 'student_id', 'code'],
  phone: ['رقم الهاتف', 'هاتف ولي الأمر', 'جوال', 'الهاتف', 'تلفون', 'موبايل', 'رقم الأب', 'رقم الأم', 'phone', 'mobile', 'guardian_phone']
};

/**
 * Parses an Excel or CSV file buffer and attempts to extract student rows
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Take the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert sheet to array of rows (header: 1 gives array of arrays)
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (!rows || rows.length < 2) {
          throw new Error('الملف فارغ أو لا يحتوي على صفوف كافية');
        }

        // Find the header row (first non-empty row)
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
          if (rows[i] && rows[i].some(cell => typeof cell === 'string' && cell.trim() !== '')) {
            headerRowIdx = i;
            break;
          }
        }

        const headers = rows[headerRowIdx].map(h => (h !== undefined && h !== null ? String(h).trim() : ''));
        
        // Detect column indices
        const mapping = detectColumns(headers);

        // Extract student records
        const students = [];
        for (let r = headerRowIdx + 1; r < rows.length; r++) {
          const row = rows[r];
          if (!row || row.length === 0) continue;

          const rawName = mapping.nameIdx !== -1 && row[mapping.nameIdx] !== undefined 
            ? String(row[mapping.nameIdx]).trim() 
            : '';

          // Skip if name is empty
          if (!rawName) continue;

          const rawId = mapping.nationalIdIdx !== -1 && row[mapping.nationalIdIdx] !== undefined 
            ? String(row[mapping.nationalIdIdx]).trim() 
            : String(r);

          const rawPhone = mapping.phoneIdx !== -1 && row[mapping.phoneIdx] !== undefined 
            ? String(row[mapping.phoneIdx]).replace(/[^\d+]/g, '') 
            : '';

          students.push({
            id: 's_' + Date.now() + '_' + r,
            name: rawName,
            nationalId: rawId,
            phone: rawPhone
          });
        }

        resolve({
          sheetName,
          totalRows: students.length,
          headers,
          mapping,
          students
        });
      } catch (err) {
        console.error('Error parsing excel:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

function detectColumns(headers) {
  let nameIdx = -1;
  let nationalIdIdx = -1;
  let phoneIdx = -1;

  headers.forEach((header, idx) => {
    const cleanHeader = header.toLowerCase().replace(/[\s_\-]/g, '');

    // Check name
    if (nameIdx === -1) {
      if (FIELD_KEYWORDS.name.some(k => cleanHeader.includes(k.toLowerCase().replace(/[\s_\-]/g, '')))) {
        nameIdx = idx;
      }
    }

    // Check ID
    if (nationalIdIdx === -1) {
      if (FIELD_KEYWORDS.nationalId.some(k => cleanHeader.includes(k.toLowerCase().replace(/[\s_\-]/g, '')))) {
        nationalIdIdx = idx;
      }
    }

    // Check Phone
    if (phoneIdx === -1) {
      if (FIELD_KEYWORDS.phone.some(k => cleanHeader.includes(k.toLowerCase().replace(/[\s_\-]/g, '')))) {
        phoneIdx = idx;
      }
    }
  });

  // Fallback: if nameIdx not found, pick first string column
  if (nameIdx === -1 && headers.length > 0) {
    nameIdx = 0;
  }

  return { nameIdx, nationalIdIdx, phoneIdx };
}

/**
 * Downloads a sample clean Excel template for teachers to fill
 */
export function downloadSampleExcel() {
  const sampleData = [
    { 'اسم الطالب': 'أحمد إبراهيم منصور', 'رقم القيد': '101', 'هاتف ولي الأمر': '0599112233' },
    { 'اسم الطالب': 'فاطمة محمود الكردي', 'رقم القيد': '102', 'هاتف ولي الأمر': '0599223344' },
    { 'اسم الطالب': 'عمر سامر البيطار', 'رقم القيد': '103', 'هاتف ولي الأمر': '0599334455' },
    { 'اسم الطالب': 'سارة خالد النجار', 'رقم القيد': '104', 'هاتف ولي الأمر': '0599445566' }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Set RTL direction on sheet
  worksheet['!views'] = [{ rightToLeft: true }];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلاب');
  XLSX.writeFile(workbook, 'نموذج_قائمة_الطلاب.xlsx');
}

/**
 * Exports school or class attendance report to Excel
 */
export function exportAttendanceReport({ date, classes, attendance, schoolName }) {
  const exportRows = [];

  classes.forEach(cls => {
    const classAtt = attendance && attendance[cls.id];
    const records = (classAtt && classAtt.records) || {};

    cls.students.forEach((student, index) => {
      const statusRaw = records[student.id] || 'unmarked';
      let statusArabic = 'لم يُسجل';
      if (statusRaw === 'present') statusArabic = 'حاضر';
      if (statusRaw === 'absent') statusArabic = 'غائب';
      if (statusRaw === 'late') statusArabic = 'متأخر';
      if (statusRaw === 'excused') statusArabic = 'غياب مبرر';

      exportRows.push({
        'م': index + 1,
        'الصف': cls.name,
        'المعلمة': cls.teacherName || '-',
        'اسم الطالب': student.name,
        'رقم القيد': student.nationalId || '-',
        'حالة الحضور': statusArabic,
        'هاتف ولي الأمر': student.phone || '-',
        'تاريخ التسجيل': date
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  worksheet['!views'] = [{ rightToLeft: true }];
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // م
    { wch: 25 }, // الصف
    { wch: 18 }, // المعلمة
    { wch: 25 }, // اسم الطالب
    { wch: 12 }, // رقم القيد
    { wch: 14 }, // حالة الحضور
    { wch: 15 }, // هاتف ولي الأمر
    { wch: 12 }  // تاريخ
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `تقرير الحضور ${date}`);
  XLSX.writeFile(workbook, `تقرير_حضور_${date}.xlsx`);
}
