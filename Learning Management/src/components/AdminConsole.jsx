import React, { useState } from 'react';
import { 
  ShieldCheck, Users, BookOpen, CheckCircle2, Rocket, Github, 
  ExternalLink, Layers, Search, Filter, Award, Flame, UserCheck 
} from 'lucide-react';
import { sound } from '../utils/sound';

export default function AdminConsole({ creators, courses, learners, submissions }) {
  const [adminTab, setAdminTab] = useState('learners'); // 'learners' | 'creators' | 'courses'
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate Executive Platform Analytics
  const totalCreators = creators.length;
  const totalCourses = courses.length;
  const totalLearners = learners.length;
  const totalCompletedCourses = learners.reduce((acc, curr) => acc + curr.completedCoursesCount, 0);
  const totalShippedProducts = learners.reduce((acc, curr) => acc + curr.shippedProductsCount, 0);

  const filteredLearners = learners.filter(
    (l) => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      
      {/* Executive Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 lg:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>SYSTEM 3: ADMIN CONSOLE & ECOSYSTEM ENGINE</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-heading font-extrabold text-slate-900">
            Platform Executive Control Center
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Audit course creators, live courses, learner progression metrics, and all shipped AI product GitHub repositories.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-mono font-bold shrink-0">
          ● Platform System Status: OPTIMAL
        </div>
      </div>

      {/* Executive KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Signed Up Creators</div>
          <div className="text-2xl font-heading font-extrabold text-purple-600 flex items-center gap-1.5">
            <Users className="w-5 h-5 text-purple-500" /> {totalCreators}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Live Standardized Courses</div>
          <div className="text-2xl font-heading font-extrabold text-cyan-600 flex items-center gap-1.5">
            <BookOpen className="w-5 h-5 text-cyan-500" /> {totalCourses}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Signed Up Learners</div>
          <div className="text-2xl font-heading font-extrabold text-indigo-600 flex items-center gap-1.5">
            <UserCheck className="w-5 h-5 text-indigo-500" /> {totalLearners}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Completed Courses</div>
          <div className="text-2xl font-heading font-extrabold text-amber-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-amber-500" /> {totalCompletedCourses}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Total AI Products Shipped</div>
          <div className="text-2xl font-heading font-extrabold text-emerald-600 flex items-center gap-1.5">
            <Rocket className="w-5 h-5 text-emerald-500" /> {totalShippedProducts}
          </div>
        </div>

      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setAdminTab('learners');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              adminTab === 'learners'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            👤 Learners Activity & Shipped Products ({learners.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setAdminTab('creators');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              adminTab === 'creators'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            👨‍🏫 Course Creators Directory ({creators.length})
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setAdminTab('courses');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              adminTab === 'courses'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            📚 Live Courses Registry ({courses.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search learners or creators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* TAB 1: LEARNERS ACTIVITY & SHIPPED PRODUCTS AUDIT TABLE (Requirement 3) */}
      {adminTab === 'learners' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-bold text-slate-900">
                Learners Activity & Shipped AI Products Registry
              </h3>
              <p className="text-xs text-slate-500">
                Audit enrolled learners, course completions, shipped products, and live GitHub repo links.
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl border border-emerald-200 font-bold">
              {filteredLearners.length} Registered Learners
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-heading font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Learner Profile</th>
                  <th className="px-5 py-3.5">Signed Up</th>
                  <th className="px-5 py-3.5">Streak & XP</th>
                  <th className="px-5 py-3.5">Courses Completed</th>
                  <th className="px-5 py-3.5">Products Built</th>
                  <th className="px-5 py-3.5">Pushed GitHub & Demo Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {filteredLearners.map((learner) => (
                  <tr key={learner.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Learner Info */}
                    <td className="px-5 py-4">
                      <div className="font-heading font-bold text-slate-900 text-sm">{learner.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{learner.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {learner.role}
                      </span>
                    </td>

                    {/* Signed Up Date */}
                    <td className="px-5 py-4 font-mono text-slate-600">
                      {learner.joinedDate}
                    </td>

                    {/* Streak & XP */}
                    <td className="px-5 py-4 font-mono">
                      <div className="text-amber-600 font-bold">🔥 {learner.streakDays} Days</div>
                      <div className="text-indigo-600 font-bold">{learner.xp} XP</div>
                    </td>

                    {/* Completed Courses */}
                    <td className="px-5 py-4 font-mono">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                        {learner.completedCoursesCount} / {learner.enrolledCoursesCount} Completed
                      </span>
                    </td>

                    {/* Shipped Products Count */}
                    <td className="px-5 py-4 font-mono">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                        🚀 {learner.shippedProductsCount} Shipped
                      </span>
                    </td>

                    {/* Pushed GitHub Links */}
                    <td className="px-5 py-4 space-y-2">
                      {learner.shippedProjects?.map((proj, idx) => (
                        <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                          <div className="font-heading font-bold text-slate-900">{proj.title}</div>
                          <div className="flex items-center gap-3 text-[11px] font-mono">
                            <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-semibold flex items-center gap-1">
                              <Github className="w-3 h-3" /> GitHub Repository
                            </a>
                            {proj.demoUrl && (
                              <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COURSE CREATORS DIRECTORY */}
      {adminTab === 'creators' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-bold text-slate-900">
                Registered Course Creators & Examiners
              </h3>
              <p className="text-xs text-slate-500">
                Manage signed up product managers and AI course creators.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-heading font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Creator Profile</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5">Live Courses</th>
                  <th className="px-5 py-3.5">Total Students</th>
                  <th className="px-5 py-3.5">Satisfaction Rating</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {creators.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="font-heading font-bold text-slate-900 text-sm">{c.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{c.email}</div>
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono mt-1 inline-block">
                        {c.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">{c.joinedDate}</td>
                    <td className="px-5 py-4 font-mono font-bold text-cyan-600">{c.liveCoursesCount} Courses</td>
                    <td className="px-5 py-4 font-mono text-slate-700">{c.totalStudents} Learners</td>
                    <td className="px-5 py-4 font-mono font-bold text-amber-600">⭐ {c.rating} / 5.0</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-[11px]">
                        ● {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE COURSES REGISTRY */}
      {adminTab === 'courses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-heading font-bold text-slate-900">
                Live Standardized Courses Registry
              </h3>
              <p className="text-xs text-slate-500">
                Audit all live courses adhering to the 8-part PRD structure.
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
                    {course.category} • {course.level}
                  </span>
                  <h4 className="text-base font-heading font-bold text-slate-900 mt-1">{course.title}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">Author: {course.creatorName} • Enrolled: {course.enrolledCount} learners</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
                    {course.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
