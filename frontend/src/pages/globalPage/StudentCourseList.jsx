import React from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

export default function StudentCourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div className="p-6 text-base text-slate-500 font-sans">Loading courses...</div>
  if (!courses.length) return <div className="p-6 text-base text-slate-500 font-sans">No courses found.</div>

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 font-sans">
      <h1 className="text-2xl font-bold text-sky-700 mb-4">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div 
            key={course._id} 
            className="bg-white rounded-xl shadow-lg flex flex-col items-stretch p-5 border border-slate-200 hover:shadow-xl hover:border-sky-300 transition-all duration-200 group"
          >
            <img
              src={course.banner
                ? course.banner.startsWith('/uploads')
                  ? `${API}${course.banner}`
                  : course.banner
                : '/default-banner.jpg'}
              alt={course.name}
              className="w-full h-40 object-cover rounded-lg mb-4 border border-slate-100 group-hover:opacity-90 transition-opacity"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-lg font-semibold text-sky-700 mb-1.5 group-hover:text-sky-600 transition-colors truncate">{course.name}</div>
                <div className="text-slate-600 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">{course.description}</div>
                <div className="text-xs text-slate-500 mb-3">Professor: {course.professor?.name || 'N/A'}</div>
              </div>
              <button
                className="w-full mt-3 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                onClick={() => navigate(`/student/course/${course._id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}