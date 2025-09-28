// // import React, { useState, useEffect } from 'react';
// // import { useParams, Link, useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import { format } from 'date-fns';

// // function AdminTestReport() {
// //   const { performanceId } = useParams();
// //   const navigate = useNavigate();
// //   const [report, setReport] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState('');

// //   useEffect(() => {
// //     fetchPerformanceReport();
// //   }, [performanceId]);

// //   const fetchPerformanceReport = async () => {
// //     try {
// //       setError('');
// //       const response = await axios.get(`/api/tests/performance/${performanceId}`);
// //       setReport(response.data.data);
// //       console.log(response.data.data);
// //     } catch (error) {
// //       console.error('Error fetching performance report:', error);
// //       setError('Failed to load performance report');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const toggleQuestion = (questionIndex) => {
// //     setReport(prev => {
// //       const newExpanded = new Set(prev.expandedQuestions || new Set());
// //       if (newExpanded.has(questionIndex)) {
// //         newExpanded.delete(questionIndex);
// //       } else {
// //         newExpanded.add(questionIndex);
// //       }
// //       return { ...prev, expandedQuestions: newExpanded };
// //     });
// //   };

// //   if (loading) {
// //     return (
// //       <div className="flex justify-center items-center h-screen">
// //         <div className="text-xl">Loading report...</div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 p-4">
// //         <div className="max-w-6xl mx-auto">
// //           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
// //             {error}
// //           </div>
// //           <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
// //             ← Back to Student Management
// //           </Link>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!report) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 p-4">
// //         <div className="max-w-6xl mx-auto">
// //           <div className="text-center">No report data found</div>
// //           <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
// //             ← Back to Student Management
// //           </Link>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const { student, performance, test, analytics } = report;
// //   const score = test ? (performance.score / test.questions.length) * 100 : 0;

// //   // Analysis functions
// //   const getDetailedQuestionAnalysis = () => {
// //     if (!test || !test.questions) return [];
    
// //     return test.questions.map((question, index) => {
// //       const studentAnswer = performance.answers.find(a => 
// //         a.question && a.question.toString() === question._id.toString()
// //       );
      
// //       const correctOption = question.options.find(opt => opt.isCorrect);
// //       const studentSelectedOption = studentAnswer?.selectedOption;

// //       return {
// //         questionNumber: index + 1,
// //         questionText: question.text,
// //         questionImage: question.image,
// //         subject: question.subject,
// //         chapter: question.chapter,
// //         options: question.options,
// //         correctOption: correctOption?.text,
// //         studentAnswer: studentSelectedOption,
// //         isCorrect: studentAnswer?.correct || false,
// //         timeSpent: studentAnswer?.timeSpent || 0,
// //         hint: question.hint,
// //         approach: question.approach,
// //         steps: question.steps
// //       };
// //     });
// //   };

// //   const questionAnalysis = getDetailedQuestionAnalysis();

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-4">
// //       <div className="max-w-6xl mx-auto">
// //         {/* Navigation */}
// //         <div className="flex justify-between items-center mb-4">
// //           <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500">
// //             ← Back to Student Management
// //           </Link>
// //           <button
// //             onClick={() => navigate(-1)}
// //             className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
// //           >
// //             Back
// //           </button>
// //         </div>

// //         {/* Student Info Header */}
// //         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
// //           <div className="flex justify-between items-start">
// //             <div>
// //               <h1 className="text-2xl font-bold text-gray-900 mb-2">{test?.title} - Test Report</h1>
// //               <p className="text-gray-600">
// //                 Student: <span className="font-semibold">{student.name}</span> ({student.email})
// //               </p>
// //               <p className="text-gray-600">
// //                 Taken on: {performance ? format(new Date(performance.dateTaken), 'MMMM d, yyyy • h:mm a') : 'N/A'}
// //               </p>
// //             </div>
// //             <div className="text-right">
// //               <div className="text-2xl font-bold text-indigo-600">{score.toFixed(1)}%</div>
// //               <div className="text-sm text-gray-600">Overall Score</div>
// //             </div>
// //           </div>

// //           {/* Stats Grid */}
// //           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
// //             <div className="text-center p-4 bg-blue-50 rounded-lg">
// //               <div className="text-2xl font-bold text-blue-600">
// //                 {performance.score}/{test?.questions.length || 0}
// //               </div>
// //               <div className="text-blue-800">Correct Answers</div>
// //             </div>
// //             <div className="text-center p-4 bg-green-50 rounded-lg">
// //               <div className="text-2xl font-bold text-green-600">
// //                 {Math.floor(performance.timeTaken / 60)}m {performance.timeTaken % 60}s
// //               </div>
// //               <div className="text-green-800">Time Taken</div>
// //             </div>
// //             <div className="text-center p-4 bg-purple-50 rounded-lg">
// //               <div className="text-2xl font-bold text-purple-600">
// //                 {analytics.overallAccuracy.toFixed(1)}%
// //               </div>
// //               <div className="text-purple-800">Accuracy</div>
// //             </div>
// //             <div className="text-center p-4 bg-orange-50 rounded-lg">
// //               <div className="text-2xl font-bold text-orange-600">
// //                 {Math.floor(analytics.averageTimePerQuestion)}s
// //               </div>
// //               <div className="text-orange-800">Avg Time/Ques</div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //           {/* Subject-wise Performance */}
// //           <div className="bg-white rounded-lg shadow p-6">
// //             <h2 className="text-xl font-bold mb-4">Subject-wise Performance</h2>
// //             <div className="space-y-4">
// //               {Object.entries(analytics.subjectWise).map(([subject, stats], index) => (
// //                 <div key={index} className="border rounded-lg p-4">
// //                   <div className="flex justify-between items-center mb-2">
// //                     <span className="font-semibold">{subject}</span>
// //                     <span className="text-lg font-bold">
// //                       {((stats.correct / stats.total) * 100).toFixed(1)}%
// //                     </span>
// //                   </div>
// //                   <div className="w-full bg-gray-200 rounded-full h-2">
// //                     <div 
// //                       className="h-2 rounded-full bg-indigo-600"
// //                       style={{ width: `${(stats.correct / stats.total) * 100}%` }}
// //                     ></div>
// //                   </div>
// //                   <div className="text-sm text-gray-600 mt-1">
// //                     {stats.correct}/{stats.total} correct • Avg time: {Math.floor(stats.timeSpent/stats.total)}s
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>

// //           {/* Weak Areas */}
// //           <div className="bg-white rounded-lg shadow p-6">
// //             <h2 className="text-xl font-bold mb-4">Areas Needing Improvement</h2>
// //             <div className="space-y-3">
// //               {Object.entries(analytics.chapterWise)
// //                 .filter(([_, data]) => data.correct === 0 && data.total >= 2)
// //                 .slice(0, 5)
// //                 .map(([chapter, data], index) => (
// //                   <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
// //                     <div className="font-semibold">{chapter}</div>
// //                     <div className="text-sm text-gray-600">{data.subject}</div>
// //                     <div className="text-sm">
// //                       Accuracy: 0% (0/{data.total})
// //                     </div>
// //                   </div>
// //                 ))}
// //               {Object.entries(analytics.chapterWise).filter(([_, data]) => data.correct === 0 && data.total >= 2).length === 0 && (
// //                 <p className="text-gray-500">No major weak areas identified</p>
// //               )}
// //             </div>
// //           </div>

// //           {/* Detailed Question Analysis */}
// //           <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
// //             <h2 className="text-xl font-bold mb-4">Detailed Question Analysis</h2>
// //             <div className="space-y-4">
// //               {questionAnalysis.map((item, index) => (
// //                 <div key={index} className={`border rounded-lg overflow-hidden ${
// //                   item.isCorrect ? 'border-green-200' : 'border-red-200'
// //                 }`}>
// //                   {/* Question Header */}
// //                   <div 
// //                     className={`p-4 cursor-pointer flex justify-between items-center ${
// //                       item.isCorrect ? 'bg-green-50' : 'bg-red-50'
// //                     }`}
// //                     onClick={() => toggleQuestion(index)}
// //                   >
// //                     <div className="flex items-center space-x-3">
// //                       <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
// //                         item.isCorrect ? 'bg-green-500' : 'bg-red-500'
// //                       }`}>
// //                         {item.questionNumber}
// //                       </span>
// //                       <div>
// //                         <span className="font-semibold">Question {item.questionNumber}</span>
// //                         <span className={`ml-2 px-2 py-1 rounded text-xs ${
// //                           item.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
// //                         }`}>
// //                           {item.isCorrect ? 'Correct' : 'Incorrect'}
// //                         </span>
// //                       </div>
// //                     </div>
// //                     <div className="text-sm text-gray-600">
// //                       Time: {item.timeSpent}s • {item.subject}
// //                     </div>
// //                     <svg 
// //                       className={`w-5 h-5 transform transition-transform ${
// //                         report.expandedQuestions?.has(index) ? 'rotate-180' : ''
// //                       }`}
// //                       fill="none" 
// //                       stroke="currentColor" 
// //                       viewBox="0 0 24 24"
// //                     >
// //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
// //                     </svg>
// //                   </div>

// //                   {/* Expanded Content */}
// //                   {report.expandedQuestions?.has(index) && (
// //                     <div className="p-4 border-t">
// //                       {/* Question Text */}
// //                       <div className="mb-4">
// //                         <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
// //                         <p className="text-gray-800">{item.questionText}</p>
// //                         {item.questionImage && (
// //                           <img 
// //                             src={item.questionImage} 
// //                             alt="Question diagram" 
// //                             className="mt-2 max-w-xs max-h-40 rounded border"
// //                           />
// //                         )}
// //                       </div>

// //                       {/* Options */}
// //                       <div className="mb-4">
// //                         <h4 className="font-medium text-gray-900 mb-2">Options:</h4>
// //                         <div className="grid gap-2">
// //                           {item.options.map((option, optIndex) => {
// //                             const isCorrect = option.isCorrect;
// //                             const isStudentAnswer = option.text === item.studentAnswer;
                            
// //                             let bgColor = 'bg-gray-50';
// //                             let borderColor = 'border-gray-200';
                            
// //                             if (isCorrect) {
// //                               bgColor = 'bg-green-50';
// //                               borderColor = 'border-green-200';
// //                             } else if (isStudentAnswer && !isCorrect) {
// //                               bgColor = 'bg-red-50';
// //                               borderColor = 'border-red-200';
// //                             }

// //                             return (
// //                               <div 
// //                                 key={optIndex}
// //                                 className={`p-3 rounded border-2 ${bgColor} ${borderColor}`}
// //                               >
// //                                 <div className="flex items-center justify-between">
// //                                   <span>{option.text}</span>
// //                                   <div className="flex space-x-2">
// //                                     {isCorrect && (
// //                                       <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
// //                                         Correct Answer
// //                                       </span>
// //                                     )}
// //                                     {isStudentAnswer && (
// //                                       <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
// //                                         Student's Answer
// //                                       </span>
// //                                     )}
// //                                   </div>
// //                                 </div>
// //                               </div>
// //                             );
// //                           })}
// //                         </div>
// //                       </div>

// //                       {/* Solution Section */}
// //                       {(item.hint || item.approach || item.steps) && (
// //                         <div className="bg-blue-50 p-4 rounded-lg">
// //                           <h4 className="font-medium text-blue-900 mb-2">Solution:</h4>
// //                           {item.hint && (
// //                             <div className="mb-2">
// //                               <strong>Hint:</strong> {item.hint}
// //                             </div>
// //                           )}
// //                           {item.approach && (
// //                             <div className="mb-2">
// //                               <strong>Approach:</strong> {item.approach}
// //                             </div>
// //                           )}
// //                           {item.steps && item.steps.length > 0 && (
// //                             <div>
// //                               <strong>Steps:</strong>
// //                               <ol className="list-decimal list-inside mt-1">
// //                                 {item.steps.map((step, stepIndex) => (
// //                                   <li key={stepIndex} className="text-sm">{step}</li>
// //                                 ))}
// //                               </ol>
// //                             </div>
// //                           )}
// //                         </div>
// //                       )}
// //                     </div>
// //                   )}
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default AdminTestReport;














// import React, { useState, useEffect } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { format } from 'date-fns';

// function AdminTestReport() {
//   const { performanceId } = useParams();
//   const navigate = useNavigate();
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchPerformanceReport();
//   }, [performanceId]);

//   const fetchPerformanceReport = async () => {
//     try {
//       setError('');
//       setLoading(true);
      
//       console.log('Fetching performance report for ID:', performanceId);
      
//       const response = await axios.get(`/api/tests/performance/${performanceId}`);
//       setReport(response.data.data);
//     } catch (error) {
//       console.error('Error fetching performance report:', error);
      
//       if (error.response?.status === 404) {
//         setError('Performance report not found. The test attempt may have been deleted or the ID is incorrect.');
//       } else {
//         setError('Failed to load performance report: ' + (error.response?.data?.message || error.message));
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Debug function to see all performances
//   const debugPerformances = async () => {
//     try {
//       const response = await axios.get('/api/tests/debug/performances');
//       console.log('All performances in database:', response.data.data);
//     } catch (error) {
//       console.error('Debug error:', error);
//     }
//   };

//   // Call debug on component mount to see what's available
//   useEffect(() => {
//     debugPerformances();
//   }, []);

//   const toggleQuestion = (questionIndex) => {
//     setReport(prev => {
//       const newExpanded = new Set(prev?.expandedQuestions || new Set());
//       if (newExpanded.has(questionIndex)) {
//         newExpanded.delete(questionIndex);
//       } else {
//         newExpanded.add(questionIndex);
//       }
//       return { ...prev, expandedQuestions: newExpanded };
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-xl">Loading report for ID: {performanceId}...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4">
//         <div className="max-w-6xl mx-auto">
//           <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
//             <strong>Error:</strong> {error}
//           </div>
//           <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
//             <strong>Performance ID:</strong> {performanceId}
//             <br />
//             <strong>Note:</strong> Check browser console for debug information
//           </div>
//           <button 
//             onClick={debugPerformances}
//             className="bg-blue-600 text-white px-4 py-2 rounded mr-4"
//           >
//             Debug Performances
//           </button>
//           <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500">
//             ← Back to Student Management
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (!report) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-4">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center">No report data found</div>
//           <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
//             ← Back to Student Management
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const { student, performance, test, analytics } = report;
//   const score = test && test.questions ? (performance.score / test.questions.length) * 100 : 0;

//   // Analysis functions
//   const getDetailedQuestionAnalysis = () => {
//     if (!test || !test.questions) return [];
    
//     return test.questions.map((question, index) => {
//       const studentAnswer = performance.answers.find(a => 
//         a.question && a.question.toString() === question._id.toString()
//       );
      
//       const correctOption = question.options.find(opt => opt.isCorrect);
//       const studentSelectedOption = studentAnswer?.selectedOption;

//       return {
//         questionNumber: index + 1,
//         questionText: question.text,
//         questionImage: question.image,
//         subject: question.subject,
//         chapter: question.chapter,
//         options: question.options,
//         correctOption: correctOption?.text,
//         studentAnswer: studentSelectedOption,
//         isCorrect: studentAnswer?.correct || false,
//         timeSpent: studentAnswer?.timeSpent || 0,
//         hint: question.hint,
//         approach: question.approach,
//         steps: question.steps
//       };
//     });
//   };

//   const questionAnalysis = getDetailedQuestionAnalysis();

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-6xl mx-auto">
//         {/* Navigation */}
//         <div className="flex justify-between items-center mb-4">
//           <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500">
//             ← Back to Student Management
//           </Link>
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
//           >
//             Back
//           </button>
//         </div>

//         {/* Student Info Header */}
//         <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                 {test?.title || 'Test Report'} - Performance Analysis
//               </h1>
//               <p className="text-gray-600">
//                 Student: <span className="font-semibold">{student.name}</span> ({student.email})
//               </p>
//               <p className="text-gray-600">
//                 Performance ID: <code className="text-sm">{performance._id}</code>
//               </p>
//               <p className="text-gray-600">
//                 Taken on: {performance.dateTaken ? format(new Date(performance.dateTaken), 'MMMM d, yyyy • h:mm a') : 'N/A'}
//               </p>
//             </div>
//             <div className="text-right">
//               <div className="text-2xl font-bold text-indigo-600">{score.toFixed(1)}%</div>
//               <div className="text-sm text-gray-600">Overall Score</div>
//             </div>
//           </div>

//           {/* Rest of your component remains the same... */}
//         </div>
        
//         {/* Rest of your JSX remains the same */}
//       </div>
//     </div>
//   );
// }

// export default AdminTestReport;



import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

function AdminTestReport() {
  const { performanceId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  useEffect(() => {
    fetchPerformanceReport();
  }, [performanceId]);

  const fetchPerformanceReport = async () => {
    try {
      setError('');
      setLoading(true);
      
      console.log('Fetching performance report for ID:', performanceId);
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/performance/${performanceId}`);
      setReport(response.data.data);
    } catch (error) {
      console.error('Error fetching performance report:', error);
      setError('Failed to load performance report: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionIndex) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionIndex)) {
      newExpanded.delete(questionIndex);
    } else {
      newExpanded.add(questionIndex);
    }
    setExpandedQuestions(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
          <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Student Management
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">No report data found</div>
          <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
            ← Back to Student Management
          </Link>
        </div>
      </div>
    );
  }

  const { student, performance, test, analytics } = report;
  const score = test && test.questions ? (performance.score / test.questions.length) * 100 : 0;

  // Analysis functions (same as TestReport component)
  const getSubjectPerformance = () => {
    const subjectStats = {};
    
    test.questions.forEach((question, index) => {
      const answer = performance.answers.find(a => 
        a.question && a.question.toString() === question._id.toString()
      );
      
      if (!subjectStats[question.subject]) {
        subjectStats[question.subject] = { correct: 0, total: 0, timeSpent: 0 };
      }
      
      subjectStats[question.subject].total++;
      if (answer?.correct) subjectStats[question.subject].correct++;
      if (answer?.timeSpent) subjectStats[question.subject].timeSpent += answer.timeSpent;
    });

    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      accuracy: (stats.correct / stats.total) * 100,
      averageTime: stats.timeSpent / stats.total
    }));
  };

  const getWeakAreas = () => {
    const topicStats = {};
    
    test.questions.forEach((question, index) => {
      const answer = performance.answers.find(a => 
        a.question && a.question.toString() === question._id.toString()
      );
      const key = `${question.subject}-${question.chapter}-${question.subTopic}`;
      
      if (!topicStats[key]) {
        topicStats[key] = {
          subject: question.subject,
          chapter: question.chapter,
          subTopic: question.subTopic,
          correct: 0,
          total: 0
        };
      }
      
      topicStats[key].total++;
      if (answer?.correct) topicStats[key].correct++;
    });

    return Object.values(topicStats)
      .filter(stat => stat.total >= 2)
      .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
      .slice(0, 5);
  };

  const getTimeAnalysis = () => {
    return performance.answers.map((answer, index) => ({
      question: index + 1,
      timeSpent: answer.timeSpent,
      correct: answer.correct
    })) || [];
  };

  const getDetailedQuestionAnalysis = () => {
    return test.questions.map((question, index) => {
      const studentAnswer = performance.answers.find(a => 
        a.question && a.question.toString() === question._id.toString()
      );
      
      const correctOption = question.options.find(opt => opt.isCorrect);
      const studentSelectedOption = studentAnswer?.selectedOption;

      return {
        questionNumber: index + 1,
        questionText: question.text,
        questionImage: question.image,
        subject: question.subject,
        chapter: question.chapter,
        options: question.options,
        correctOption: correctOption?.text,
        studentAnswer: studentSelectedOption,
        isCorrect: studentAnswer?.correct || false,
        timeSpent: studentAnswer?.timeSpent || 0,
        hint: question.hint,
        approach: question.approach,
        steps: question.steps
      };
    });
  };

  const subjectPerformance = getSubjectPerformance();
  const weakAreas = getWeakAreas();
  const timeAnalysis = getTimeAnalysis();
  const questionAnalysis = getDetailedQuestionAnalysis();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/admin/students" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
          ← Back to Student Management
        </Link>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title} - Performance Report</h1>
          <p className="text-gray-600 mb-2">
            Student: <span className="font-semibold">{student.name}</span> ({student.email})
          </p>
          <p className="text-gray-600 mb-6">
            Taken on {performance ? format(new Date(performance.dateTaken), 'MMMM d, yyyy • h:mm a') : 'N/A'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{score.toFixed(1)}%</div>
              <div className="text-blue-800">Overall Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {performance.answers.filter(a => a.correct).length}/{test.questions.length}
              </div>
              <div className="text-green-800">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor(performance.timeTaken / 60)}m {performance.timeTaken % 60}s
              </div>
              <div className="text-purple-800">Time Taken</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {((performance.answers.filter(a => a.correct).length / test.questions.length) * 100).toFixed(1)}%
              </div>
              <div className="text-orange-800">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject-wise Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Subject-wise Performance</h2>
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{subject.subject}</span>
                    <span className="text-lg font-bold">{subject.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${subject.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Average time: {Math.floor(subject.averageTime)}s per question
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weak Areas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Areas Needing Improvement</h2>
            <div className="space-y-3">
              {weakAreas.length > 0 ? (
                weakAreas.map((area, index) => (
                  <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="font-semibold">{area.subTopic}</div>
                    <div className="text-sm text-gray-600">
                      {area.chapter} • {area.subject}
                    </div>
                    <div className="text-sm">
                      Accuracy: {((area.correct / area.total) * 100).toFixed(1)}% ({area.correct}/{area.total})
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Not enough data to identify weak areas</p>
              )}
            </div>
          </div>

          {/* Time Analysis */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Time Spent per Question</h2>
            <div className="grid grid-cols-10 gap-2">
              {timeAnalysis.map((item, index) => (
                <div key={index} className="text-center">
                  <div className={`h-16 rounded flex items-center justify-center ${
                    item.correct ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div>
                      <div className="font-semibold">Q{index + 1}</div>
                      <div className="text-xs">{item.timeSpent}s</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 mr-2"></div>
                <span className="text-sm">Correct Answer</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 mr-2"></div>
                <span className="text-sm">Incorrect Answer</span>
              </div>
            </div>
          </div>

          {/* Detailed Question Analysis */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Detailed Question Analysis</h2>
            <div className="space-y-4">
              {questionAnalysis.map((item, index) => (
                <div key={index} className={`border rounded-lg overflow-hidden ${
                  item.isCorrect ? 'border-green-200' : 'border-red-200'
                }`}>
                  {/* Question Header */}
                  <div 
                    className={`p-4 cursor-pointer flex justify-between items-center ${
                      item.isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                    onClick={() => toggleQuestion(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {item.questionNumber}
                      </span>
                      <div>
                        <span className="font-semibold">Question {item.questionNumber}</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          item.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Time: {item.timeSpent}s • {item.subject}
                    </div>
                    <svg 
                      className={`w-5 h-5 transform transition-transform ${
                        expandedQuestions.has(index) ? 'rotate-180' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Expanded Content */}
                  {expandedQuestions.has(index) && (
                    <div className="p-4 border-t">
                      {/* Question Text */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                        <p className="text-gray-800">{item.questionText}</p>
                        {item.questionImage && (
                          <img 
                            src={item.questionImage} 
                            alt="Question diagram" 
                            className="mt-2 max-w-xs max-h-40 rounded border"
                          />
                        )}
                      </div>

                      {/* Options */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Options:</h4>
                        <div className="grid gap-2">
                          {item.options.map((option, optIndex) => {
                            const isCorrect = option.isCorrect;
                            const isStudentAnswer = option.text === item.studentAnswer;
                            
                            let bgColor = 'bg-gray-50';
                            let borderColor = 'border-gray-200';
                            
                            if (isCorrect) {
                              bgColor = 'bg-green-50';
                              borderColor = 'border-green-200';
                            } else if (isStudentAnswer && !isCorrect) {
                              bgColor = 'bg-red-50';
                              borderColor = 'border-red-200';
                            }

                            return (
                              <div 
                                key={optIndex}
                                className={`p-3 rounded border-2 ${bgColor} ${borderColor}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option.text}</span>
                                  <div className="flex space-x-2">
                                    {isCorrect && (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                        Correct Answer
                                      </span>
                                    )}
                                    {isStudentAnswer && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        Student's Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Solution Section */}
                      {(item.hint || item.approach || item.steps) && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Solution:</h4>
                          {item.hint && (
                            <div className="mb-2">
                              <strong>Hint:</strong> {item.hint}
                            </div>
                          )}
                          {item.approach && (
                            <div className="mb-2">
                              <strong>Approach:</strong> {item.approach}
                            </div>
                          )}
                          {item.steps && item.steps.length > 0 && (
                            <div>
                              <strong>Steps:</strong>
                              <ol className="list-decimal list-inside mt-1">
                                {item.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-sm">{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <Link
            to="/admin/students"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Back to Student Management
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminTestReport;