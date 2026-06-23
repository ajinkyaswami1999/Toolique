import { useState } from 'react';
import { GraduationCap, Sparkles, Trash2, Plus, RefreshCw } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

const gradePoints: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'D': 4,
  'F': 0,
};

export default function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Course 1', grade: 'O', credits: 4 },
    { id: '2', name: 'Course 2', grade: 'A', credits: 3 },
    { id: '3', name: 'Course 3', grade: 'B+', credits: 3 },
  ]);

  const [prevCGPA, setPrevCGPA] = useState<number>(0);
  const [prevCredits, setPrevCredits] = useState<number>(0);

  const handleAddCourse = () => {
    const newId = String(courses.length + 1);
    setCourses((prev) => [
      ...prev,
      { id: newId, name: `Course ${newId}`, grade: 'A', credits: 3 },
    ]);
  };

  const handleRemoveCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCourseChange = (id: string, field: keyof Course, value: any) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Calculations
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalPoints = courses.reduce((sum, c) => sum + (gradePoints[c.grade] || 0) * c.credits, 0);
  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  // Cumulative CGPA calculation
  let cgpa = sgpa;
  let overallCredits = totalCredits;
  if (prevCredits > 0 && prevCGPA > 0) {
    overallCredits = totalCredits + prevCredits;
    cgpa = (totalPoints + prevCGPA * prevCredits) / overallCredits;
  }

  const handleReset = () => {
    setCourses([
      { id: '1', name: 'Course 1', grade: 'O', credits: 4 },
      { id: '2', name: 'Course 2', grade: 'A', credits: 3 },
      { id: '3', name: 'Course 3', grade: 'B+', credits: 3 },
    ]);
    setPrevCGPA(0);
    setPrevCredits(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Course List Form */}
      <div className="lg:col-span-2 saas-card p-6 space-y-6 text-left">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <span>Semester Courses</span>
          </h3>
          <button
            onClick={handleAddCourse}
            className="saas-button-primary px-3 py-1.5 text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Course</span>
          </button>
        </div>

        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="grid grid-cols-12 gap-3 items-center bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
              <div className="col-span-6">
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
                  className="w-full saas-input text-xs px-2.5 py-1.5"
                  placeholder="Course Name"
                />
              </div>
              <div className="col-span-3">
                <select
                  value={course.grade}
                  onChange={(e) => handleCourseChange(course.id, 'grade', e.target.value)}
                  className="w-full saas-select text-xs px-2 py-1.5"
                >
                  {Object.keys(gradePoints).map((g) => (
                    <option key={g} value={g}>
                      {g} ({gradePoints[g]} Pts)
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={course.credits}
                  onChange={(e) => handleCourseChange(course.id, 'credits', Math.max(1, Number(e.target.value)))}
                  className="w-full saas-input text-xs px-2 py-1.5 text-center"
                  placeholder="Credits"
                />
              </div>
              <div className="col-span-1 text-right">
                <button
                  onClick={() => handleRemoveCourse(course.id)}
                  disabled={courses.length <= 1}
                  className="p-1 text-zinc-400 hover:text-red-500 disabled:opacity-30 transition"
                  title="Remove Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CGPA Cumulative settings */}
        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Cumulative CGPA Calculation (Optional)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Previous CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={prevCGPA === 0 ? '' : prevCGPA}
                onChange={(e) => setPrevCGPA(Math.min(10, Math.max(0, Number(e.target.value))))}
                className="w-full saas-input text-xs px-3 py-2"
                placeholder="e.g. 8.5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-650 dark:text-zinc-350">Previous Earned Credits</label>
              <input
                type="number"
                min="0"
                value={prevCredits === 0 ? '' : prevCredits}
                onChange={(e) => setPrevCredits(Math.max(0, Number(e.target.value)))}
                className="w-full saas-input text-xs px-3 py-2"
                placeholder="e.g. 60"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:text-indigo-500 hover:border-indigo-500/30 flex items-center gap-1.5 transition duration-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>
        </div>
      </div>

      {/* Results panel */}
      <div className="space-y-6 text-left">
        <div className="saas-card p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Academic Performance</span>
          </h3>

          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Semester GPA (SGPA)</span>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {sgpa > 0 ? sgpa.toFixed(2) : '0.00'}
              </p>
            </div>

            {prevCredits > 0 && prevCGPA > 0 && (
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500">Cumulative GPA (CGPA)</span>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {cgpa > 0 ? cgpa.toFixed(2) : '0.00'}
                </p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <span>Semester Credits</span>
                <span className="text-zinc-850 dark:text-zinc-250">{totalCredits}</span>
              </div>
              {prevCredits > 0 && (
                <div className="flex justify-between items-center text-xs font-bold text-zinc-650 dark:text-zinc-400">
                  <span>Total Cumulative Credits</span>
                  <span className="text-zinc-850 dark:text-zinc-250">{overallCredits}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
