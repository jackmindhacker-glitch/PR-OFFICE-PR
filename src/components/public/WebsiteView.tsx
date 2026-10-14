import React, { useState } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { HeroSection } from './HeroSection';
import { PublicCourses } from './PublicCourses';
import { AboutSection } from './AboutSection';
import { FeaturesSection } from './FeaturesSection';
import { ContactSection } from './ContactSection';
import { PublicFooter } from './PublicFooter';
import { OnlineAdmissionModal } from './OnlineAdmissionModal';
import { AcademySettings, Course, Student, Teacher } from '../../types/academy';

interface WebsiteViewProps {
  settings: AcademySettings;
  courses: Course[];
  teachers: Teacher[];
  isUnlocked: boolean;
  onOpenPortal: () => void;
  onSaveOnlineAdmission: (student: Student) => void;
}

export const WebsiteView: React.FC<WebsiteViewProps> = ({
  settings,
  courses,
  teachers,
  isUnlocked,
  onOpenPortal,
  onSaveOnlineAdmission,
}) => {
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [selectedCourseForAdmission, setSelectedCourseForAdmission] = useState<Course | { title: string; price: number; duration: string } | null>(null);

  const handleOpenAdmissionWithCourse = (course: Course | { title: string; price: number; duration: string }) => {
    setSelectedCourseForAdmission(course);
    setIsAdmissionModalOpen(true);
  };

  const handleOpenGeneralAdmission = () => {
    setSelectedCourseForAdmission(null);
    setIsAdmissionModalOpen(true);
  };

  const handleScrollToCourses = () => {
    const el = document.getElementById('courses');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Public Sticky Navigation */}
      <PublicNavbar
        settings={settings}
        isUnlocked={isUnlocked}
        onOpenPortal={onOpenPortal}
        onOpenAdmissionModal={handleOpenGeneralAdmission}
      />

      {/* Hero Banner Section */}
      <HeroSection
        settings={settings}
        onOpenAdmissionModal={handleOpenGeneralAdmission}
        onBrowseCourses={handleScrollToCourses}
      />

      {/* Courses Showcase Section */}
      <PublicCourses
        courses={courses}
        teachers={teachers}
        onSelectCourseForAdmission={handleOpenAdmissionWithCourse}
      />

      {/* About Founder & Vision */}
      <AboutSection />

      {/* Why Choose PR Academy */}
      <FeaturesSection
        onOpenAdmissionModal={handleOpenGeneralAdmission}
      />

      {/* Contact & Studio Location */}
      <ContactSection settings={settings} />

      {/* Footer */}
      <PublicFooter
        settings={settings}
        onOpenPortal={onOpenPortal}
        onOpenAdmissionModal={handleOpenGeneralAdmission}
      />

      {/* Online Admission Application Modal */}
      {isAdmissionModalOpen && (
        <OnlineAdmissionModal
          courses={courses}
          preSelectedCourse={selectedCourseForAdmission}
          academyPhone={settings.phone}
          onSaveAdmission={(student) => {
            onSaveOnlineAdmission(student);
          }}
          onClose={() => {
            setIsAdmissionModalOpen(false);
            setSelectedCourseForAdmission(null);
          }}
        />
      )}
    </div>
  );
};
