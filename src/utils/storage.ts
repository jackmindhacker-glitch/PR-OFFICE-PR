import {
  Teacher,
  Course,
  Student,
  PaymentRecord,
  TeacherPayout,
  AcademySettings,
} from '../types/academy';
import {
  INITIAL_TEACHERS,
  INITIAL_COURSES,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_PAYOUTS,
  INITIAL_SETTINGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  TEACHERS: 'pr_academy_teachers_v2',
  COURSES: 'pr_academy_courses_v2',
  STUDENTS: 'pr_academy_students_v2',
  PAYMENTS: 'pr_academy_payments_v2',
  PAYOUTS: 'pr_academy_payouts_v2',
  SETTINGS: 'pr_academy_settings_v2',
  PIN_AUTH: 'pr_academy_pin_session_v1',
  CUSTOM_PIN: 'pr_academy_custom_pin_v1',
};

// Known demo IDs that must never be loaded
const DEMO_IDS = new Set([
  'std-1', 'std-2', 'std-3', 'std-4', 'std-5',
  'pay-1', 'pay-2', 'pay-3', 'pay-4',
  'payout-1',
  'tch-1', 'tch-2', 'tch-3', 'tch-4',
  'crs-1', 'crs-2', 'crs-3', 'crs-4', 'crs-5', 'crs-6',
]);

// Purge old v1 demo keys if they exist in browser
try {
  const v1Keys = [
    'pr_academy_teachers_v1',
    'pr_academy_courses_v1',
    'pr_academy_students_v1',
    'pr_academy_payments_v1',
    'pr_academy_payouts_v1',
  ];
  v1Keys.forEach((k) => localStorage.removeItem(k));
} catch {
  // Ignore in non-browser environments
}

function filterDemoItems<T>(items: T): T {
  if (Array.isArray(items)) {
    const cleaned = (items as any[]).filter((item) => !DEMO_IDS.has(item?.id));
    return cleaned as unknown as T;
  }
  return items;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const cleaned = filterDemoItems(parsed);
    return cleaned as T;
  } catch (e) {
    console.error(`Failed to read ${key} from localStorage:`, e);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write ${key} to localStorage:`, e);
  }
}

export const StorageService = {
  getTeachers: (): Teacher[] => safeGet(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS),
  saveTeachers: (data: Teacher[]) => safeSet(STORAGE_KEYS.TEACHERS, data),

  getCourses: (): Course[] => safeGet(STORAGE_KEYS.COURSES, INITIAL_COURSES),
  saveCourses: (data: Course[]) => safeSet(STORAGE_KEYS.COURSES, data),

  getStudents: (): Student[] => safeGet(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS),
  saveStudents: (data: Student[]) => safeSet(STORAGE_KEYS.STUDENTS, data),

  getPayments: (): PaymentRecord[] => safeGet(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS),
  savePayments: (data: PaymentRecord[]) => safeSet(STORAGE_KEYS.PAYMENTS, data),

  getPayouts: (): TeacherPayout[] => safeGet(STORAGE_KEYS.PAYOUTS, INITIAL_PAYOUTS),
  savePayouts: (data: TeacherPayout[]) => safeSet(STORAGE_KEYS.PAYOUTS, data),

  getSettings: (): AcademySettings => safeGet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (data: AcademySettings) => safeSet(STORAGE_KEYS.SETTINGS, data),

  // PIN security
  getPin: (): string => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_PIN) || '1996';
  },
  setPin: (newPin: string): void => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PIN, newPin);
  },
  isSessionUnlocked: (): boolean => {
    return sessionStorage.getItem(STORAGE_KEYS.PIN_AUTH) === 'unlocked_true';
  },
  unlockSession: (): void => {
    sessionStorage.setItem(STORAGE_KEYS.PIN_AUTH, 'unlocked_true');
  },
  lockSession: (): void => {
    sessionStorage.removeItem(STORAGE_KEYS.PIN_AUTH);
  },

  // Reset to initial clean state (no demo data)
  resetAll: (): void => {
    safeSet(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    safeSet(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    safeSet(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    safeSet(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    safeSet(STORAGE_KEYS.PAYOUTS, INITIAL_PAYOUTS);
    safeSet(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_PIN);
  },

  // Clear all records
  clearAll: (): void => {
    safeSet(STORAGE_KEYS.TEACHERS, []);
    safeSet(STORAGE_KEYS.COURSES, []);
    safeSet(STORAGE_KEYS.STUDENTS, []);
    safeSet(STORAGE_KEYS.PAYMENTS, []);
    safeSet(STORAGE_KEYS.PAYOUTS, []);
  },

  // Export & Import
  exportBackup: (): string => {
    const backup = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      teachers: StorageService.getTeachers(),
      courses: StorageService.getCourses(),
      students: StorageService.getStudents(),
      payments: StorageService.getPayments(),
      payouts: StorageService.getPayouts(),
      settings: StorageService.getSettings(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup: (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.teachers) && Array.isArray(data.courses) && Array.isArray(data.students)) {
        StorageService.saveTeachers(data.teachers);
        StorageService.saveCourses(data.courses);
        StorageService.saveStudents(data.students);
        if (Array.isArray(data.payments)) StorageService.savePayments(data.payments);
        if (Array.isArray(data.payouts)) StorageService.savePayouts(data.payouts);
        if (data.settings) StorageService.saveSettings(data.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};
