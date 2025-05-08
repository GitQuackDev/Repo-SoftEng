import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react'

export default function LessonPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    let ignore = false;
    const fetchLesson = async () => {
      try {
        // Fetch the course to get the latest lessons and progress
        const courseRes = await fetch(`http://localhost:5000/api/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const courseData = await courseRes.json();
        if (!courseData.data) throw new Error('No course data');
        // Find the lesson in the course
        const lessonData = (courseData.data.lessons || []).find(l => l._id === lessonId);
        if (!lessonData) throw new Error('Lesson not found');
        if (ignore) return;
        setLesson(lessonData);
        // Map saved completedSteps (stepIds) to indexes in actionSteps for the logged-in student
        const stepIds = (lessonData.actionSteps || []).map(s => s.stepId);
        let completed = [];
        if (Array.isArray(lessonData.progress)) {
          let userId = null;
          try {
            const jwt = JSON.parse(atob(token.split('.')[1]));
            userId = jwt.id;
          } catch (e) {}
          // Always compare as string
          const userProgress = lessonData.progress.find(
            p => p.student && String(p.student) === String(userId)
          );
          if (userProgress && Array.isArray(userProgress.completedSteps)) {
            completed = userProgress.completedSteps
              .map(sid => stepIds.indexOf(sid))
              .filter(idx => idx !== -1);
          }
        }
        setCompletedSteps(completed);
      } catch {
        setLesson(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
    return () => { ignore = true };
  }, [courseId, lessonId, loading])

  if (loading) return <div className="p-6 text-base text-slate-500 font-sans">Loading lesson...</div>
  if (!lesson) return <div className="p-6 text-base text-red-600 font-sans">Lesson not found.</div>

  const steps = lesson.actionSteps || []
  const allCompleted = completedSteps.length === steps.length && steps.length > 0
  const progress = steps.length ? Math.round((completedSteps.length / steps.length) * 100) : 0

  const renderMedia = step => (
    <>
      {/* Render YouTube videos */}
      {step.youtubeLinks && step.youtubeLinks.filter(l => l.trim()).map((link, idx) => (
        <div key={idx} className="my-4">
          <iframe
            width="100%"
            height="320"
            src={link.replace('watch?v=', 'embed/')}
            title={`YouTube video ${idx + 1}`}
            frameBorder="0"
            allowFullScreen
            className="rounded-xl"
          ></iframe>
        </div>
      ))}
      {/* Render images */}
      {step.files && step.files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).map((file, idx) => (
        <img
          key={idx}
          src={`http://localhost:5000${file}`}
          alt="Step resource"
          className="rounded-xl my-4 max-h-72 object-contain border border-indigo-900"
        />
      ))}
    </>
  )

  // Save progress to backend
  const saveProgress = async (newCompletedSteps) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/course/${courseId}/lesson/${lessonId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedSteps: newCompletedSteps.map(idx => steps[idx]?.stepId).filter(Boolean) })
      });
      if (!res.ok) throw new Error('Failed to save progress');
      setLoading(true); // trigger re-fetch
      return true;
    } catch (err) {
      alert('Could not save progress. Please try again.');
      return false;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8 max-w-7xl mx-auto bg-slate-50 font-sans">
      {/* Sidebar Progress */}
      <aside className="w-full md:w-72 mb-6 md:mb-0 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex-shrink-0">
        <button
          className="flex items-center gap-2 mb-5 text-sky-600 hover:text-sky-700 font-medium text-sm transition-colors"
          onClick={() => navigate(`/student/course/${courseId}`)}
        >
          <ArrowLeft className="w-4 h-4" /> Go Back to Lessons
        </button>
        <div className="mb-4">
          <div className="text-xs mb-1 font-semibold text-slate-600">Lesson Progress</div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-green-600 text-xs font-bold">{progress}% Completed</div>
        </div>
        <nav className="flex flex-col gap-1.5">
          {steps.map((step, idx) => (
            <button
              key={step.stepId || idx}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 ${
                activeStep === idx 
                  ? 'bg-sky-100 text-sky-700 shadow-sm' 
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              {completedSteps.includes(idx)
                ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                : <Circle className="w-5 h-5 text-slate-400 flex-shrink-0" />}
              <span className="truncate">{step.title}</span>
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-white rounded-xl shadow-lg p-6 md:p-8 border border-slate-200 min-h-[450px]">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-xl md:text-2xl font-bold text-sky-700">{activeStep + 1}. {steps[activeStep]?.title}</div>
          {completedSteps.includes(activeStep) && <CheckCircle className="w-6 h-6 text-green-500" />}
        </div>
        {renderMedia(steps[activeStep] || {})}
        <div className="text-slate-700 text-base mb-4 prose max-w-none prose-sm prose-slate">
          {steps[activeStep]?.description?.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {steps[activeStep]?.resourceUrl && (
          <a href={steps[activeStep].resourceUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline text-sm block mb-3 font-medium">Resource Link</a>
        )}
        {/* Attachments */}
        {steps[activeStep]?.files && steps[activeStep].files.filter(f => !/\.(jpg|jpeg|png|gif|webp)$/i.test(f)).length > 0 && (
          <div className="mt-4">
            <div className="font-semibold text-slate-700 mb-1.5 text-sm">Attachments</div>
            <ul className="space-y-1">
              {steps[activeStep].files.filter(f => !/\.(jpg|jpeg|png|gif|webp)$/i.test(f)).map((file, idx) => (
                <li key={idx}>
                  <a href={`http://localhost:5000${file}`} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-sky-700 underline text-xs font-medium">{file.split('/').pop()}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Mark as complete button */}
        {!completedSteps.includes(activeStep) && (
          <button
            className="mt-6 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={async () => {
              const newCompleted = [...completedSteps, activeStep];
              const ok = await saveProgress(newCompleted);
              if (ok) setCompletedSteps(newCompleted);
            }}
          >
            Mark as Complete
          </button>
        )}
        {allCompleted && (
          <div className="mt-6 text-green-600 font-bold text-base flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> All steps completed!
          </div>
        )}
      </main>
    </div>
  )
}
