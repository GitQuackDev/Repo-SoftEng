import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Flame, CheckCircle, BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

export default function StudentDashboard({ course }) {
  const user = JSON.parse(localStorage.getItem('user')) || {}
  // Derive the correct user ID (handle both ._id and .id)
  const userId = String(user._id || user.id || '')

  // Helper to get progress entry for current user
  const getProgress = (lesson) => {
    if (!Array.isArray(lesson.progress)) return null;
    return lesson.progress.find(p => {
      if (!p.student) return false;
      let sid;
      if (typeof p.student === 'object') {
        sid = p.student._id ? p.student._id : p.student.toString();
      } else {
        sid = p.student;
      }
      return String(sid) === userId;
    });
  };

  const grades = course?.grades || []
  const myGrade = grades.find(g => g.student?._id === user?._id)
  const attendance = course?.attendance || []
  const lessons = course?.lessons || []
  const submissions = course?.submissions?.filter(s => s.student?._id === user?._id) || []

  // Grade distribution for the course
  const gradeData = [
    { name: 'A (90+)', value: grades.filter(g => g.grade >= 90).length },
    { name: 'B (80-89)', value: grades.filter(g => g.grade >= 80 && g.grade < 90).length },
    { name: 'C (70-79)', value: grades.filter(g => g.grade >= 70 && g.grade < 80).length },
    { name: 'D (60-69)', value: grades.filter(g => g.grade >= 60 && g.grade < 70).length },
    { name: 'F (<60)', value: grades.filter(g => g.grade < 60).length },
  ]
  // Attendance analytics (stub)
  const attended = attendance.filter(a => a.present).length
  const totalSessions = attendance.length
  const attendanceRate = totalSessions ? Math.round((attended / totalSessions) * 100) : 0

  // --- Advanced Lesson Completion & Streak Visuals ---
  // Find completed lessons (all steps done for this student)
  // --- Fix Lesson Completion Logic ---
  const completedLessons = lessons.filter(lesson => {
    if (!lesson.open) return false;
    const progress = getProgress(lesson);
    const totalSteps = lesson.actionSteps?.map(step => step.stepId) || [];
    const completedSteps = progress?.completedSteps || [];

    // Debugging: Log comparison of actionSteps and completedSteps
    // console.log(`Lesson: ${lesson.title}`);
    // console.log('Action Steps:', totalSteps);
    // console.log('Completed Steps:', completedSteps);
    console.log('Comparing for lesson:', lesson.title, 'Total Step IDs:', totalSteps, 'Student Completed Step IDs:', completedSteps);

    return totalSteps.length > 0 && totalSteps.every(stepId => completedSteps.includes(stepId));
  });

  const incompleteLessons = lessons.filter(lesson => {
    if (!lesson.open) return false;
    const progress = getProgress(lesson);
    const totalSteps = lesson.actionSteps?.map(step => step.stepId) || [];
    const completedSteps = progress?.completedSteps || [];

    // Debugging: Log comparison of actionSteps and completedSteps
    // console.log(`Lesson: ${lesson.title}`);
    // console.log('Action Steps:', totalSteps);
    // console.log('Completed Steps:', completedSteps);
    console.log('Comparing for incomplete lesson:', lesson.title, 'Total Step IDs:', totalSteps, 'Student Completed Step IDs:', completedSteps);

    return totalSteps.length > 0 && !totalSteps.every(stepId => completedSteps.includes(stepId));
  });

  // Debugging: Log lesson data for verification
  // console.log('Lessons:', lessons);
  // console.log('Completed Lessons:', completedLessons);
  // console.log('Incomplete Lessons:', incompleteLessons);

  // --- Steps Completed Per Day (last 7 days) ---
  const stepsPerDay = useMemo(() => {
    const map = {}
    const now = new Date(); now.setHours(0,0,0,0)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i)
      map[d.toISOString().slice(0,10)] = 0
    }
    lessons.forEach(lesson => {
      const progress = getProgress(lesson);
      if (progress && Array.isArray(progress.completedSteps) && progress.lastStepCompletionDate) {
        let last = new Date(progress.lastStepCompletionDate); last.setHours(0,0,0,0)
        const key = last.toISOString().slice(0,10)
        if (map[key] !== undefined) map[key] += progress.completedSteps.length
      }
    })
    return Object.entries(map).map(([date, count]) => ({ date, count }))
  }, [lessons, userId])

  // --- Streak History (simulate for demo) ---
  const streakHistory = useMemo(() => {
    // Simulate a streak history for the last 7 days
    let streak = 0
    return stepsPerDay.map(({ date, count }) => {
      if (count > 0) streak++
      else streak = 0
      return { date, streak }
    })
  }, [stepsPerDay])

  // Lesson progress
  const openLessons = lessons.filter(l => l.open).length
  const lessonProgress = openLessons ? Math.round((completedLessons.length / openLessons) * 100) : 0

  // Submission analytics
  const totalAssignments = course?.assignments?.length || 0
  const submittedAssignments = submissions.length
  const submissionRate = totalAssignments ? Math.round((submittedAssignments / totalAssignments) * 100) : 0

  const COLORS = ['#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa']

  // --- Streak Calculation (activeStreak, maxStreak) ---
  const today = new Date(); today.setHours(0,0,0,0);
  let maxStreak = 0;
  let activeStreak = 0;
  lessons.forEach(lesson => {
    const progress = getProgress(lesson);
    if (progress && progress.streak) {
      let last = progress.lastStepCompletionDate ? new Date(progress.lastStepCompletionDate) : null;
      if (last) last.setHours(0,0,0,0);
      if (last && (today - last === 0 || today - last === 86400000)) {
        if (progress.streak > activeStreak) activeStreak = progress.streak;
      }
      if (progress.streak > maxStreak) maxStreak = progress.streak;
    }
  });

  // Attendance Chart Data
  const attendanceData = [
    { name: 'Attended', value: attended },
    { name: 'Missed', value: totalSessions - attended },
  ];

  // Lesson Completion Chart Data
  const lessonCompletionData = [
    { name: 'Completed', value: completedLessons.length },
    { name: 'Incomplete', value: openLessons - completedLessons.length },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 bg-slate-50 font-sans">
      <div className="text-3xl font-bold text-sky-700 mb-4">Course Dashboard</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 flex flex-col items-center">
          <div className="font-semibold text-sky-700 mb-3 text-lg">Attendance</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={attendanceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                <Cell key="attended" fill="#22c55e" /> {/* green-500 */}
                <Cell key="missed" fill="#ef4444" /> {/* red-500 */}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', borderColor: '#e2e8f0' }} itemStyle={{ color: '#334155' }}/>
              <Legend wrapperStyle={{ fontSize: '14px', color: '#475569' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Lesson Completion Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 flex flex-col items-center">
          <div className="font-semibold text-sky-700 mb-3 text-lg">Lesson Completion</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={lessonCompletionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                <Cell key="completed" fill="#3b82f6" /> {/* blue-500 */}
                <Cell key="incomplete" fill="#f59e0b" /> {/* amber-500 */}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px', borderColor: '#e2e8f0' }} itemStyle={{ color: '#334155' }}/>
              <Legend wrapperStyle={{ fontSize: '14px', color: '#475569' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
