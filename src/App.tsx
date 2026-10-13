import React, { useState, useEffect } from 'react';
import { StorageService } from './utils/storage';
import {
  Teacher,
  Course,
  Student,
  PaymentRecord,
  TeacherPayout,
  AcademySettings,
  PaymentMethod,
} from './types/academy';
import { PinScreen } from './components/PinScreen';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CoursesView } from './components/CoursesView';
import { StudentsView } from './components/StudentsView';
import { PaymentsView } from './components/PaymentsView';
import { TeachersSalaryView } from './components/TeachersSalaryView';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentPaymentModal } from './components/StudentPaymentModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ReceiptModal, ReceiptModalProps } from './components/ReceiptModal';
import { Toast, ToastMessage } from './components/Toast';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { SettingsModal } from './components/SettingsModal';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  setAccessToken,
} from './utils/firebaseAuth';
import { GoogleDriveService, DriveFileInfo } from './utils/googleDrive';
import { User } from 'firebase/auth';
import { Download, RefreshCw, Lock, Settings, Cloud } from 'lucide-react';

export default function App() {
  // PIN lock authentication state (default pin: '1996')
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return StorageService.isSessionUnlocked();
  });

  const [currentPin, setCurrentPin] = useState<string>(() => StorageService.getPin());

  // Core Academy Data State
  const [teachers, setTeachers] = useState<Teacher[]>(() => StorageService.getTeachers());
  const [courses, setCourses] = useState<Course[]>(() => StorageService.getCourses());
  const [students, setStudents] = useState<Student[]>(() => StorageService.getStudents());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => StorageService.getPayments());
  const [payouts, setPayouts] = useState<TeacherPayout[]>(() => StorageService.getPayouts());
  const [settings, setSettings] = useState<AcademySettings>(() => StorageService.getSettings());

  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals
  const [isStudentFormOpen, setIsStudentFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [paymentDetailStudent, setPaymentDetailStudent] = useState<Student | null>(null);
  const [whatsappStudent, setWhatsappStudent] = useState<Student | null>(null);
  const [receiptModalData, setReceiptModalData] = useState<ReceiptModalProps | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Google Drive & Auth State
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [driveFile, setDriveFile] = useState<DriveFileInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Reset confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: Date.now().toString(), type, message });
  };

  // Sync to StorageService
  useEffect(() => {
    StorageService.saveTeachers(teachers);
  }, [teachers]);

  useEffect(() => {
    StorageService.saveCourses(courses);
  }, [courses]);

  useEffect(() => {
    StorageService.saveStudents(students);
  }, [students]);

  useEffect(() => {
    StorageService.savePayments(payments);
  }, [payments]);

  useEffect(() => {
    StorageService.savePayouts(payouts);
  }, [payouts]);

  // Firebase auth state change listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        // Check for existing Drive backup
        GoogleDriveService.findBackupFile(token)
          .then((file) => setDriveFile(file))
          .catch(() => {});
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Google Drive Connect
  const handleConnectGoogle = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        showToast(`Google Drive attach ho gaya (${res.user.email})!`);

        // Check if backup already exists on Drive
        try {
          const file = await GoogleDriveService.findBackupFile(res.accessToken);
          if (file) {
            setDriveFile(file);
          }
        } catch {}
      }
    } catch (err: any) {
      showToast('Google Sign-in fail ho gaya: ' + (err.message || 'Error'), 'error');
    }
  };

  const handleDisconnectGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
    setDriveFile(null);
    showToast('Google Drive disconnect ho gaya.', 'info');
  };

  // Sync / Save Data to Google Drive
  const handleSyncToDrive = async () => {
    let token = googleToken;
    if (!token) {
      try {
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
          setGoogleUser(res.user);
          setGoogleToken(res.accessToken);
        } else {
          return;
        }
      } catch (err: any) {
        showToast('Pehle Google Account connect karein', 'error');
        return;
      }
    }

    setIsSyncing(true);
    try {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        academyName: settings.academyName,
        teachers,
        courses,
        students,
        payments,
        payouts,
        settings,
      };

      const fileInfo = await GoogleDriveService.saveBackupToDrive(backupData, token);
      setDriveFile(fileInfo);
      showToast('Google Drive par data safalta-purvak save ho gaya!');
    } catch (err: any) {
      showToast('Drive upload mein error: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Restore Data from Google Drive
  const handleRestoreFromDrive = async () => {
    if (!googleToken) {
      showToast('Pehle Google account se login karein', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const data = await GoogleDriveService.loadBackupFromDrive(googleToken);
      if (data && data.teachers && data.courses && data.students) {
        setTeachers(data.teachers);
        setCourses(data.courses);
        setStudents(data.students);
        if (data.payments) setPayments(data.payments);
        if (data.payouts) setPayouts(data.payouts);
        if (data.settings) setSettings(data.settings);

        StorageService.saveTeachers(data.teachers);
        StorageService.saveCourses(data.courses);
        StorageService.saveStudents(data.students);
        if (data.payments) StorageService.savePayments(data.payments);
        if (data.payouts) StorageService.savePayouts(data.payouts);
        if (data.settings) StorageService.saveSettings(data.settings);

        showToast('Google Drive se data safalta-purvak load aur restore ho gaya!');
      } else {
        showToast('Drive file format amanya hai.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Drive restore failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle PIN unlock
  const handlePinSuccess = () => {
    StorageService.unlockSession();
    setIsUnlocked(true);
    showToast('PR ACADEMY Portal mein aapka swagat hai!');
  };

  const handleLockApp = () => {
    StorageService.lockSession();
    setIsUnlocked(false);
  };

  // Course handlers
  const handleSaveCourse = (savedCourse: Course) => {
    setCourses((prev) => {
      const idx = prev.findIndex((c) => c.id === savedCourse.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedCourse;
        return next;
      }
      return [savedCourse, ...prev];
    });
    showToast(`Course "${savedCourse.title}" save ho gaya!`);
  };

  const handleDeleteCourse = (id: string) => {
    const crs = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    showToast(`Course "${crs?.title || ''}" delete ho gaya!`);
  };

  // Student handlers
  const handleOpenNewAdmission = () => {
    setEditingStudent(null);
    setIsStudentFormOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentFormOpen(true);
  };

  const handleSaveStudent = (
    savedStudent: Student,
    initialPayment?: { amount: number; method: PaymentMethod; remarks?: string }
  ) => {
    const isNew = !students.some((s) => s.id === savedStudent.id);

    setStudents((prev) => {
      const idx = prev.findIndex((s) => s.id === savedStudent.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = savedStudent;
        return next;
      }
      return [savedStudent, ...prev];
    });

    if (initialPayment && initialPayment.amount > 0) {
      const selectedCourse = courses.find((c) => c.id === savedStudent.courseId);
      const teacherShareAmount = Math.round(initialPayment.amount * 0.5); // 50% Auto Share

      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        studentId: savedStudent.id,
        studentName: savedStudent.fullName,
        courseTitle: selectedCourse ? selectedCourse.title : 'Course',
        amount: initialPayment.amount,
        paymentMethod: initialPayment.method,
        date: new Date().toISOString(),
        receiptNo: `PRA-REC-${Math.floor(100 + Math.random() * 900)}`,
        remarks: initialPayment.remarks || 'Admission enrollment fee',
        teacherId: selectedCourse?.teacherId || '',
        teacherShareAmount,
      };

      setPayments((prev) => [newPayment, ...prev]);
    }

    showToast(
      isNew
        ? `${savedStudent.fullName} ka admission safalta-purvak ho gaya!`
        : `${savedStudent.fullName} ki details update ho gayi!`
    );
  };

  const handleDeleteStudent = (id: string) => {
    const st = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setPayments((prev) => prev.filter((p) => p.studentId !== id));
    showToast(`Student "${st?.fullName || ''}" ka record delete ho gaya!`);
  };

  // Payment Handlers
  const handleAddPayment = (paymentData: Omit<PaymentRecord, 'id' | 'receiptNo'>) => {
    const newRecord: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNo: `PRA-REC-${Math.floor(100 + Math.random() * 900)}`,
    };

    setPayments((prev) => [newRecord, ...prev]);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === paymentData.studentId) {
          const newPaid = s.paidAmount + paymentData.amount;
          const newStatus =
            newPaid >= s.totalFee ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';
          return {
            ...s,
            paidAmount: newPaid,
            status: newStatus,
          };
        }
        return s;
      })
    );

    if (paymentDetailStudent && paymentDetailStudent.id === paymentData.studentId) {
      setPaymentDetailStudent((prev) => {
        if (!prev) return null;
        const newPaid = prev.paidAmount + paymentData.amount;
        return {
          ...prev,
          paidAmount: newPaid,
          status: newPaid >= prev.totalFee ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending',
        };
      });
    }

    showToast(`Payment ${newRecord.receiptNo} safalta-purvak jama ho gayi!`);
  };

  const handleEditPayment = (updated: PaymentRecord) => {
    setPayments((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Payment ${updated.receiptNo} update ho gayi!`);
  };

  const handleDeletePayment = (id: string) => {
    const p = payments.find((item) => item.id === id);
    if (p) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === p.studentId) {
            const nextPaid = Math.max(0, s.paidAmount - p.amount);
            const nextStatus =
              nextPaid >= s.totalFee ? 'Paid' : nextPaid > 0 ? 'Partial' : 'Pending';
            return {
              ...s,
              paidAmount: nextPaid,
              status: nextStatus,
            };
          }
          return s;
        })
      );

      if (paymentDetailStudent && paymentDetailStudent.id === p.studentId) {
        setPaymentDetailStudent((prev) => {
          if (!prev) return null;
          const nextPaid = Math.max(0, prev.paidAmount - p.amount);
          return {
            ...prev,
            paidAmount: nextPaid,
            status: nextPaid >= prev.totalFee ? 'Paid' : nextPaid > 0 ? 'Partial' : 'Pending',
          };
        });
      }
    }

    setPayments((prev) => prev.filter((item) => item.id !== id));

    if (receiptModalData && receiptModalData.type === 'fee' && receiptModalData.payment.id === id) {
      setReceiptModalData(null);
    }

    showToast(`Payment receipt ${p?.receiptNo || ''} delete ho gayi!`);
  };

  // Teacher Handlers
  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers((prev) => [...prev, newTeacher]);
    showToast(`Teacher "${newTeacher.name}" add ho gaye!`);
  };

  const handleEditTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t)));
    showToast(`Teacher "${updatedTeacher.name}" details update ho gayi!`);
  };

  const handleDeleteTeacher = (id: string) => {
    const tch = teachers.find((t) => t.id === id);
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    showToast(`Teacher "${tch?.name || ''}" record delete ho gaya!`);
  };

  const handleRecordTeacherPayout = (payoutData: Omit<TeacherPayout, 'id'>) => {
    const newPayout: TeacherPayout = {
      ...payoutData,
      id: `payout-${Date.now()}`,
    };
    setPayouts((prev) => [newPayout, ...prev]);
    showToast(`Salary Payout ${newPayout.referenceNo || ''} confirm ho gaya!`);
  };

  const handleDeletePayout = (id: string) => {
    setPayouts((prev) => prev.filter((p) => p.id !== id));
    if (receiptModalData && receiptModalData.type === 'payout' && receiptModalData.payout.id === id) {
      setReceiptModalData(null);
    }
    showToast('Salary payout voucher delete ho gaya!');
  };

  // Receipt Modal handlers
  const handleOpenFeeReceipt = (payment: PaymentRecord, student?: Student) => {
    const st = student || students.find((s) => s.id === payment.studentId);
    const crs = courses.find((c) => c.id === st?.courseId);

    setReceiptModalData({
      type: 'fee',
      payment,
      student: st,
      course: crs,
      settings,
      onClose: () => setReceiptModalData(null),
      onDeleteReceipt: handleDeletePayment,
    });
  };

  const handleOpenPayoutVoucher = (payout: TeacherPayout, teacher: Teacher) => {
    setReceiptModalData({
      type: 'payout',
      payout,
      teacher,
      settings,
      onClose: () => setReceiptModalData(null),
      onDeletePayout: handleDeletePayout,
    });
  };

  // Export / Backup to offline JSON
  const handleExportData = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PR_ACADEMY_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data backup download ho gaya!');
  };

  const handleImportLocalBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const success = StorageService.importBackup(text);
        if (success) {
          setTeachers(StorageService.getTeachers());
          setCourses(StorageService.getCourses());
          setStudents(StorageService.getStudents());
          setPayments(StorageService.getPayments());
          setPayouts(StorageService.getPayouts());
          setSettings(StorageService.getSettings());
          showToast('Backup file safalta-purvak restore ho gayi!');
        } else {
          showToast('Invalid backup file', 'error');
        }
      } catch {
        showToast('File read karne mein error', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    StorageService.resetAll();
    setTeachers(StorageService.getTeachers());
    setCourses(StorageService.getCourses());
    setStudents(StorageService.getStudents());
    setPayments(StorageService.getPayments());
    setPayouts(StorageService.getPayouts());
    setSettings(StorageService.getSettings());
    setIsResetConfirmOpen(false);
    showToast('Sabhi sample aur demo records clear ho gaye — Clean portal ready!');
  };

  const handleSaveSettings = (newSettings: AcademySettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    showToast('Settings update ho gayi!');
  };

  const handleUpdatePin = (newPin: string) => {
    StorageService.setPin(newPin);
    setCurrentPin(newPin);
    showToast('Access PIN code safalta-purvak update ho gaya!');
  };

  // If locked, render PIN screen (1996)
  if (!isUnlocked) {
    return <PinScreen correctPin={currentPin} onSuccess={handlePinSuccess} />;
  }

  const pendingDueCount = students.filter((s) => s.totalFee > s.paidAmount).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] pb-16 lg:pb-8">
      {/* Top Navbar with Settings & Google status */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLockApp={handleLockApp}
        onQuickAdmission={handleOpenNewAdmission}
        onAddCourse={() => setActiveTab('courses')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isGoogleConnected={!!googleUser}
        pendingDueCount={pendingDueCount}
      />

      {/* Main App Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            courses={courses}
            teachers={teachers}
            payments={payments}
            payouts={payouts}
            onNavigate={(tab) => setActiveTab(tab)}
            onQuickAdmission={handleOpenNewAdmission}
            onAddCourse={() => setActiveTab('courses')}
            onOpenWhatsApp={(student) => setWhatsappStudent(student)}
            onViewReceipt={(p) => handleOpenFeeReceipt(p)}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            teachers={teachers}
            students={students}
            onSaveCourse={handleSaveCourse}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

        {activeTab === 'students' && (
          <StudentsView
            students={students}
            courses={courses}
            teachers={teachers}
            payments={payments}
            onAddStudent={handleOpenNewAdmission}
            onEditStudent={handleOpenEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onOpenWhatsApp={(student) => setWhatsappStudent(student)}
            onOpenPaymentModal={(student) => setPaymentDetailStudent(student)}
            onViewReceipt={(payment, student) => handleOpenFeeReceipt(payment, student)}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            payments={payments}
            students={students}
            courses={courses}
            teachers={teachers}
            onAddPayment={handleAddPayment}
            onEditPayment={handleEditPayment}
            onDeletePayment={handleDeletePayment}
            onViewReceipt={(p) => handleOpenFeeReceipt(p)}
          />
        )}

        {activeTab === 'teachers' && (
          <TeachersSalaryView
            teachers={teachers}
            courses={courses}
            students={students}
            payments={payments}
            payouts={payouts}
            onAddTeacher={handleAddTeacher}
            onEditTeacher={handleEditTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onRecordPayout={handleRecordTeacherPayout}
            onDeletePayout={handleDeletePayout}
            onViewPayoutVoucher={handleOpenPayoutVoucher}
          />
        )}
      </main>

      {/* Footer bar with backup and settings */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-4 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PR ACADEMY</span>
            <span>• Dance, Meditation, Acting, Guitar Management</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-amber-600 transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              <span>Google Drive Storage</span>
              {googleUser && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
              title="Backup Data JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Backup</span>
            </button>
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600"
              title="Clear All Records (Clean State)"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Clear Data</span>
            </button>
            <button
              onClick={handleLockApp}
              className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold"
            >
              <Lock className="h-3 w-3" />
              <span>Lock Portal</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isStudentFormOpen && (
        <StudentFormModal
          initialStudent={editingStudent}
          courses={courses}
          teachers={teachers}
          onSave={handleSaveStudent}
          onClose={() => setIsStudentFormOpen(false)}
        />
      )}

      {paymentDetailStudent && (
        <StudentPaymentModal
          student={paymentDetailStudent}
          course={courses.find((c) => c.id === paymentDetailStudent.courseId)}
          teacher={teachers.find(
            (t) =>
              t.id ===
              courses.find((c) => c.id === paymentDetailStudent.courseId)?.teacherId
          )}
          payments={payments}
          onAddPayment={handleAddPayment}
          onDeletePayment={handleDeletePayment}
          onViewReceipt={(p) => handleOpenFeeReceipt(p, paymentDetailStudent)}
          onClose={() => setPaymentDetailStudent(null)}
        />
      )}

      {whatsappStudent && (
        <WhatsAppModal
          student={whatsappStudent}
          course={courses.find((c) => c.id === whatsappStudent.courseId)}
          onClose={() => setWhatsappStudent(null)}
        />
      )}

      {receiptModalData && <ReceiptModal {...receiptModalData} />}

      {/* Settings & Google Drive Storage Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          currentPin={currentPin}
          googleUser={googleUser}
          googleToken={googleToken}
          driveFile={driveFile}
          isSyncing={isSyncing}
          onSaveSettings={handleSaveSettings}
          onUpdatePin={handleUpdatePin}
          onConnectGoogle={handleConnectGoogle}
          onDisconnectGoogle={handleDisconnectGoogle}
          onSyncToDrive={handleSyncToDrive}
          onRestoreFromDrive={handleRestoreFromDrive}
          onExportLocalBackup={handleExportData}
          onImportLocalBackup={handleImportLocalBackup}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Confirmation Modal for Resetting Data */}
      <ConfirmDeleteModal
        isOpen={isResetConfirmOpen}
        title="Sabhi Data Clear Karein?"
        message="Kya aap sach mein sabhi records ko clear karke clean fresh state banana chahte hain? Sabhi sample demo records hat jayenge."
        confirmButtonText="Haan, Clear Karein"
        onConfirm={handleResetConfirm}
        onClose={() => setIsResetConfirmOpen(false)}
      />

      {/* Operation Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
