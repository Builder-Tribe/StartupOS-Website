import React, { useState } from 'react';
import Header from './components/Header';
import NavigationTabs from './components/NavigationTabs';
import LearnerPortal from './components/LearnerPortal';
import CreatorStudio from './components/CreatorStudio';
import AdminConsole from './components/AdminConsole';
import PublicShowcase from './components/PublicShowcase';
import AITutorDrawer from './components/AITutorDrawer';

import { 
  CREATORS_DATABASE, 
  LEARNERS_DATABASE, 
  STANDARDIZED_COURSES, 
  INITIAL_SUBMISSIONS, 
  PUBLIC_SHOWCASE 
} from './data/abLmsData';

export default function App() {
  // Current System / User Role: 'LEARNER' | 'CREATOR' | 'ADMIN'
  const [currentRole, setCurrentRole] = useState('LEARNER');
  
  // Active View Tab
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'submit' | 'review' | 'showcase'

  // Datasets
  const [creators, setCreators] = useState(CREATORS_DATABASE);
  const [learners, setLearners] = useState(LEARNERS_DATABASE);
  const [courses, setCourses] = useState(STANDARDIZED_COURSES);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [showcaseProjects, setShowcaseProjects] = useState(PUBLIC_SHOWCASE);

  const [isAITutorOpen, setIsAITutorOpen] = useState(false);

  const [userStats, setUserStats] = useState({
    xp: 7250,
    streak: 14,
    projectsShipped: 2
  });

  const handlePublishNewCourse = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev]);
  };

  const handleSubmitNewProject = (newSub) => {
    setSubmissions((prev) => [newSub, ...prev]);
    
    // Update active learner profile
    setLearners((prev) =>
      prev.map((l) => {
        if (l.id === 'learner-1') {
          return {
            ...l,
            shippedProductsCount: l.shippedProductsCount + 1,
            shippedProjects: [
              {
                title: newSub.projectTitle,
                githubUrl: newSub.githubUrl,
                demoUrl: newSub.liveDemoUrl,
                tools: newSub.toolsUsed,
                shippedDate: newSub.submittedDate,
                reviewStatus: newSub.status
              },
              ...l.shippedProjects
            ]
          };
        }
        return l;
      })
    );

    setUserStats((prev) => ({
      ...prev,
      xp: prev.xp + 500,
      projectsShipped: prev.projectsShipped + 1
    }));
  };

  const handleSaveHumanReview = (submissionId, reviewData) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        return {
          ...s,
          status: 'REVIEWED',
          humanReview: reviewData
        };
      })
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* System & Role Switcher Header */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userStats={userStats}
      />

      {/* Main Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
      />

      {/* Main Active System View */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 w-full flex-1">
        
        {/* SYSTEM 3: ADMIN CONSOLE SYSTEM (Triggered when role === 'ADMIN') */}
        {currentRole === 'ADMIN' ? (
          <AdminConsole
            creators={creators}
            courses={courses}
            learners={learners}
            submissions={submissions}
          />
        ) : currentRole === 'CREATOR' ? (
          /* SYSTEM 2: COURSE CREATOR SYSTEM (Triggered when role === 'CREATOR') */
          <CreatorStudio
            courses={courses}
            submissions={submissions}
            onPublishNewCourse={handlePublishNewCourse}
            onSaveHumanReview={handleSaveHumanReview}
          />
        ) : (
          /* SYSTEM 1: LEARNER LMS SYSTEM (Triggered when role === 'LEARNER') */
          <>
            {activeTab === 'builder' && (
              <LearnerPortal
                courses={courses}
                submissions={submissions}
                onToggleAITutor={() => setIsAITutorOpen(true)}
                onSubmitProject={handleSubmitNewProject}
                userStats={userStats}
              />
            )}

            {activeTab === 'submit' && (
              <LearnerPortal
                courses={courses}
                submissions={submissions}
                onToggleAITutor={() => setIsAITutorOpen(true)}
                onSubmitProject={handleSubmitNewProject}
                userStats={userStats}
              />
            )}

            {activeTab === 'review' && (
              <ReviewDashboard
                submissions={submissions}
                onSaveHumanReview={handleSaveHumanReview}
                currentRole={currentRole}
              />
            )}

            {activeTab === 'showcase' && (
              <PublicShowcase showcaseProjects={showcaseProjects} />
            )}
          </>
        )}

      </main>

      {/* Floating Context-Aware AI Tutor Drawer */}
      <AITutorDrawer
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        currentLessonContext={{ title: 'Lesson 1.1: Drafting AI Prompt Architecture' }}
      />

      {/* Clean Modern Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            AB-LMS Platform Suite © 2026 • 3 Core Systems: Learner LMS | Creator Studio | Admin Console
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] font-semibold text-slate-600">
            <span>Antigravity</span>
            <span>•</span>
            <span>Claude Code</span>
            <span>•</span>
            <span>Cursor</span>
            <span>•</span>
            <span>Replit</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
