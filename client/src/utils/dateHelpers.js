// Arabic Date & Schedule Helpers

export const SCHEDULE_GROUPS = {
  SAT_MON_WED: {
    id: 'SAT_MON_WED',
    name: 'مجموعة (السبت - الإثنين - الأربعاء)',
    shortName: 'سبت / إثنين / أربعاء',
    days: [6, 1, 3] // 6: Sat, 1: Mon, 3: Wed
  },
  SUN_TUE_THU: {
    id: 'SUN_TUE_THU',
    name: 'مجموعة (الأحد - الثلاثاء - الخميس)',
    shortName: 'أحد / ثلاثاء / خميس',
    days: [0, 2, 4] // 0: Sun, 2: Tue, 4: Thu
  }
};

const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatArabicDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const dayName = ARABIC_DAYS[d.getDay()];
  const dayNum = d.getDate();
  const monthName = ARABIC_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}، ${dayNum} ${monthName} ${year}`;
}

export function getScheduleForDate(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const day = d.getDay(); // 0 is Sunday, 6 is Saturday

  if (day === 5) {
    return {
      group: 'WEEKEND',
      name: 'عطلة نهاية الأسبوع (الجمعة)',
      isWeekend: true
    };
  }

  if (day === 6 || day === 1 || day === 3) {
    return {
      group: 'SAT_MON_WED',
      name: SCHEDULE_GROUPS.SAT_MON_WED.name,
      shortName: SCHEDULE_GROUPS.SAT_MON_WED.shortName,
      isWeekend: false
    };
  }

  return {
    group: 'SUN_TUE_THU',
    name: SCHEDULE_GROUPS.SUN_TUE_THU.name,
    shortName: SCHEDULE_GROUPS.SUN_TUE_THU.shortName,
    isWeekend: false
  };
}
