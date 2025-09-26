// import React, { useState, useEffect } from 'react';
// import { Link, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { format } from 'date-fns';

// function StudentManagement() {
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const fetchStudents = async () => {
//     try {
//       const response = await axios.get(`/api/tests/students`);
//       setStudents(response.data.data);
     
//     } catch (error) {
//       console.error('Error fetching students:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStudentDetails = async (studentId) => {
//     try {
//       const response = await axios.get(`/api/tests/students/${studentId}`);
//       setSelectedStudent(response.data.data);
//     } catch (error) {
//       console.error('Error fetching student details:', error);
//     }
//   };

//   if (loading) {
//     return <div className="flex justify-center py-8">Loading students...</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <Link to="/admin" className="text-indigo-600 hover:text-indigo-500">
//             ← Back to Admin Panel
//           </Link>
//           <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Students List */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow">
//               <div className="px-6 py-4 border-b">
//                 <h2 className="text-lg font-semibold">All Students ({students.length})</h2>
//               </div>
//               <div className="divide-y max-h-96 overflow-y-auto">
//                 {students.map(student => (
//                   <div
//                     key={student._id}
//                     className={`p-4 cursor-pointer hover:bg-gray-50 ${
//                       selectedStudent?._id === student._id ? 'bg-blue-50' : ''
//                     }`}
//                     onClick={() => fetchStudentDetails(student._id)}
//                   >
//                     <div className="font-medium text-gray-900">{student.name}</div>
//                     <div className="text-sm text-gray-600">{student.email}</div>
//                     <div className="text-sm text-gray-500">
//                       Tests Taken: {student.performance?.length || 0}
//                     </div>
//                     <div className="text-xs text-gray-400">
//                       Joined: {format(new Date(student.createdAt), 'MMM d, yyyy')}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Student Details */}
//           <div className="lg:col-span-2">
//             {selectedStudent ? (
//               <StudentDetails student={selectedStudent} />
//             ) : (
//               <div className="bg-white rounded-lg shadow p-6 text-center">
//                 <p className="text-gray-500">Select a student to view details</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Student Details Component
// function StudentDetails({ student }) {
//   const [expandedTest, setExpandedTest] = useState(null);

//   const getOverallStats = () => {
//     const totalTests = student.performance.length;
//     const totalQuestions = student.performance.reduce((acc, perf) => 
//       acc + (perf.answers?.length || 0), 0
//     );
//     const correctAnswers = student.performance.reduce((acc, perf) => 
//       acc + (perf.answers?.filter(a => a.correct).length || 0), 0
//     );
//     const totalTimeSpent = student.performance.reduce((acc, perf) => 
//       acc + (perf.timeTaken || 0), 0
//     );

//     return {
//       totalTests,
//       averageScore: totalTests > 0 ? 
//         (student.performance.reduce((acc, perf) => acc + perf.score, 0) / totalTests) : 0,
//       accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
//       averageTimePerTest: totalTests > 0 ? totalTimeSpent / totalTests : 0
//     };
//   };

//   const stats = getOverallStats();

//   return (
//     <div className="space-y-6">
//       {/* Student Info Card */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
//             <p className="text-gray-600">{student.email}</p>
//             <p className="text-sm text-gray-500">Role: {student.role}</p>
//           </div>
//           <div className="text-right">
//             <div className="text-2xl font-bold text-indigo-600">
//               {stats.averageScore.toFixed(1)}%
//             </div>
//             <div className="text-sm text-gray-600">Average Score</div>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-4 gap-4 mt-4">
//           <div className="text-center p-3 bg-blue-50 rounded">
//             <div className="text-lg font-bold text-blue-600">{stats.totalTests}</div>
//             <div className="text-sm text-blue-800">Tests Taken</div>
//           </div>
//           <div className="text-center p-3 bg-green-50 rounded">
//             <div className="text-lg font-bold text-green-600">{stats.accuracy.toFixed(1)}%</div>
//             <div className="text-sm text-green-800">Accuracy</div>
//           </div>
//           <div className="text-center p-3 bg-purple-50 rounded">
//             <div className="text-lg font-bold text-purple-600">
//               {Math.floor(stats.averageTimePerTest / 60)}m
//             </div>
//             <div className="text-sm text-purple-800">Avg Time/Test</div>
//           </div>
//           <div className="text-center p-3 bg-orange-50 rounded">
//             <div className="text-lg font-bold text-orange-600">
//               {student.performance.reduce((acc, perf) => acc + perf.score, 0)}
//             </div>
//             <div className="text-sm text-orange-800">Total Score</div>
//           </div>
//         </div>
//       </div>

//       {/* Performance History */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="px-6 py-4 border-b">
//           <h3 className="text-lg font-semibold">Test Performance History</h3>
//         </div>
//         <div className="divide-y">
//           {student.performance.map((performance, index) => (
//             <div key={performance._id} className="p-4">
//               <div 
//                 className="flex justify-between items-center cursor-pointer"
//                 onClick={() => setExpandedTest(expandedTest === index ? null : index)}
//               >
//                 <div>
//                   <div className="font-medium">{performance.test?.title}</div>
//                   <div className="text-sm text-gray-600">
//                     {format(new Date(performance.dateTaken), 'MMM d, yyyy • h:mm a')}
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {performance.test?.subjects?.join(', ')} • {performance.test?.type}
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-lg font-bold text-indigo-600">
//                     {((performance.score / performance.answers?.length) * 100).toFixed(1)}%
//                   </div>
//                   <div className="text-sm text-gray-600">
//                     {performance.score}/{performance.answers?.length} correct
//                   </div>
//                   <div className="text-sm text-gray-500">
//                     {Math.floor(performance.timeTaken / 60)}m {performance.timeTaken % 60}s
//                   </div>
//                 </div>
//                 <svg 
//                   className={`w-5 h-5 transform transition-transform ${
//                     expandedTest === index ? 'rotate-180' : ''
//                   }`}
//                   fill="none" 
//                   stroke="currentColor" 
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//               </div>

//               {/* Expanded Test Details */}
//               {expandedTest === index && (
//                 <div className="mt-4 pl-4 border-l-2 border-indigo-200">
//                   <div className="grid grid-cols-3 gap-4 mb-4">
//                     <div className="text-center p-2 bg-gray-50 rounded">
//                       <div className="font-medium">Subject-wise Performance</div>
//                       {(() => {
//                         const subjectStats = {};
//                         performance.answers?.forEach(answer => {
//                           const subject = answer.question?.subject;
//                           if (!subjectStats[subject]) {
//                             subjectStats[subject] = { correct: 0, total: 0 };
//                           }
//                           subjectStats[subject].total++;
//                           if (answer.correct) subjectStats[subject].correct++;
//                         });

//                         return Object.entries(subjectStats).map(([subject, stats]) => (
//                           <div key={subject} className="text-sm mt-1">
//                             <span className="font-medium">{subject}: </span>
//                             <span>{stats.correct}/{stats.total}</span>
//                             <span className="text-gray-500 ml-2">
//                               ({((stats.correct / stats.total) * 100).toFixed(1)}%)
//                             </span>
//                           </div>
//                         ));
//                       })()}
//                     </div>

//                     <div className="text-center p-2 bg-gray-50 rounded">
//                       <div className="font-medium">Time Analysis</div>
//                       <div className="text-sm mt-1">
//                         Avg Time/Question: {Math.floor(
//                           performance.timeTaken / (performance.answers?.length || 1)
//                         )}s
//                       </div>
//                       <div className="text-sm mt-1">
//                         Efficiency: {((performance.score / performance.answers?.length) * 100).toFixed(1)}%
//                       </div>
//                     </div>

//                     <div className="text-center p-2 bg-gray-50 rounded">
//                       <div className="font-medium">Question Breakdown</div>
//                       <div className="text-sm mt-1">
//                         Correct: <span className="text-green-600">{performance.score}</span>
//                       </div>
//                       <div className="text-sm mt-1">
//                         Incorrect: <span className="text-red-600">
//                           {(performance.answers?.length || 0) - performance.score}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

                

//                   <Link
//   to={`/admin/report/${performance._id}`}  // Use performance._id, not test._id
//   className="inline-block bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
// >
//   View Detailed Report
// </Link>

//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StudentManagement;



import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`/api/tests/students`);
      setStudents(response.data.data);
      setFilteredStudents(response.data.data); // Initialize filtered students with all students
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`/api/tests/students/${studentId}`);
      setSelectedStudent(response.data.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return <div className="flex justify-center py-8">Loading students...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/admin" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Admin Panel
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              {/* Search Bar Header */}
              <div className="px-6 py-4 border-b">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">All Students ({filteredStudents.length})</h2>
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {searchTerm && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-2 text-sm text-gray-600">
                    Showing {filteredStudents.length} of {students.length} students
                  </div>
                )}
              </div>

              {/* Students List */}
              <div className="divide-y max-h-96 overflow-y-auto">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <div
                      key={student._id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedStudent?._id === student._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => fetchStudentDetails(student._id)}
                    >
                      <div className="font-medium text-gray-900">
                        {highlightSearchTerm(student.name, searchTerm)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {highlightSearchTerm(student.email, searchTerm)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Tests Taken: {student.performance?.length || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Joined: {format(new Date(student.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    {searchTerm ? 'No students found matching your search.' : 'No students found.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <StudentDetails student={selectedStudent} />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">
                  {filteredStudents.length > 0 
                    ? "Select a student to view details" 
                    : "No students available to display"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to highlight search terms
function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

// Student Details Component (keep this the same)
function StudentDetails({ student }) {
  const [expandedTest, setExpandedTest] = useState(null);

  const getOverallStats = () => {
    const totalTests = student.performance.length;
    const totalQuestions = student.performance.reduce((acc, perf) => 
      acc + (perf.answers?.length || 0), 0
    );
    const correctAnswers = student.performance.reduce((acc, perf) => 
      acc + (perf.answers?.filter(a => a.correct).length || 0), 0
    );
    const totalTimeSpent = student.performance.reduce((acc, perf) => 
      acc + (perf.timeTaken || 0), 0
    );

    return {
      totalTests,
      averageScore: totalTests > 0 ? 
        (student.performance.reduce((acc, perf) => acc + perf.score, 0) / totalTests) : 0,
      accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      averageTimePerTest: totalTests > 0 ? totalTimeSpent / totalTests : 0
    };
  };

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Student Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-gray-600">{student.email}</p>
            <p className="text-sm text-gray-500">Role: {student.role}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.averageScore.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">{stats.totalTests}</div>
            <div className="text-sm text-blue-800">Tests Taken</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">{stats.accuracy.toFixed(1)}%</div>
            <div className="text-sm text-green-800">Accuracy</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <div className="text-lg font-bold text-purple-600">
              {Math.floor(stats.averageTimePerTest / 60)}m
            </div>
            <div className="text-sm text-purple-800">Avg Time/Test</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded">
            <div className="text-lg font-bold text-orange-600">
              {student.performance.reduce((acc, perf) => acc + perf.score, 0)}
            </div>
            <div className="text-sm text-orange-800">Total Score</div>
          </div>
        </div>
      </div>

      {/* Performance History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Test Performance History</h3>
        </div>
        <div className="divide-y">
          {student.performance.map((performance, index) => (
            <div key={performance._id} className="p-4">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedTest(expandedTest === index ? null : index)}
              >
                <div>
                  <div className="font-medium">{performance.test?.title}</div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(performance.dateTaken), 'MMM d, yyyy • h:mm a')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {performance.test?.subjects?.join(', ')} • {performance.test?.type}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">
                    {((performance.score / performance.answers?.length) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {performance.score}/{performance.answers?.length} correct
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.floor(performance.timeTaken / 60)}m {performance.timeTaken % 60}s
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${
                    expandedTest === index ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded Test Details */}
              {expandedTest === index && (
                <div className="mt-4 pl-4 border-l-2 border-indigo-200">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">Subject-wise Performance</div>
                      {(() => {
                        const subjectStats = {};
                        performance.answers?.forEach(answer => {
                          const subject = answer.question?.subject;
                          if (!subjectStats[subject]) {
                            subjectStats[subject] = { correct: 0, total: 0 };
                          }
                          subjectStats[subject].total++;
                          if (answer.correct) subjectStats[subject].correct++;
                        });

                        return Object.entries(subjectStats).map(([subject, stats]) => (
                          <div key={subject} className="text-sm mt-1">
                            <span className="font-medium">{subject}: </span>
                            <span>{stats.correct}/{stats.total}</span>
                            <span className="text-gray-500 ml-2">
                              ({((stats.correct / stats.total) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        ));
                      })()}
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">Time Analysis</div>
                      <div className="text-sm mt-1">
                        Avg Time/Question: {Math.floor(
                          performance.timeTaken / (performance.answers?.length || 1)
                        )}s
                      </div>
                      <div className="text-sm mt-1">
                        Efficiency: {((performance.score / performance.answers?.length) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-medium">Question Breakdown</div>
                      <div className="text-sm mt-1">
                        Correct: <span className="text-green-600">{performance.score}</span>
                      </div>
                      <div className="text-sm mt-1">
                        Incorrect: <span className="text-red-600">
                          {(performance.answers?.length || 0) - performance.score}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/student-test-report/${performance._id}`}
                    className="inline-block bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
                  >
                    View Detailed Report
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentManagement;