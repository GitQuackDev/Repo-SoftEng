import React from 'react'
export default function StudentList({ students, grades, onRemove }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 mt-6"> {/* Added mt-6 for margin-top */}
      <h2 className="text-xl font-semibold text-indigo-700 mb-4">Enrolled Students</h2> {/* Removed dark mode for heading */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs text-gray-500 uppercase"> {/* Removed dark mode for table header */}
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Grade</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const gradeObj = grades.find(g => g.student._id === student._id)
              return (
                <tr key={student._id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors"> {/* Removed dark mode for table row */}
                  <td className="py-2 px-2 text-gray-700">{student.name}</td> {/* Removed dark mode for table cell */}
                  <td className="py-2 px-2 text-gray-600">{student.email}</td> {/* Removed dark mode for table cell */}
                  <td className="py-2 px-2 text-indigo-600">{gradeObj?.grade ?? '-'}</td> {/* Removed dark mode for table cell */}
                  <td className="py-2 px-2 text-gray-700">{gradeObj?.status ?? '-'}</td> {/* Removed dark mode for table cell */}
                  <td className="py-2 px-2">
                    <button onClick={() => onRemove(student._id)} className="text-red-500 hover:underline text-xs">Remove</button> {/* Removed dark mode for button */}
                  </td>
                </tr>
              )
            })}
            {!students.length && (
              <tr><td colSpan={5} className="text-gray-500 text-center py-4">No students enrolled yet.</td></tr> /* Removed dark mode for empty state */
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}