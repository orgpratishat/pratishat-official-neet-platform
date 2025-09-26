// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { format } from 'date-fns';

// function AdminPanel() {
//   const [tests, setTests] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState({
//     title: '',
//     type: 'daily',
//     subjects: [],
//     duration: 60,
//     scheduleDate: '',
//     questions: [{
//       text: '',
//       image: '',
//       options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
//       subject: 'Physics',
//       chapter: '',
//       subTopic: '',
//       hint: '',
//       approach: '',
//       steps: ['']
//     }]
//   });

//   useEffect(() => {
//     fetchTests();
//   }, []);

//   const fetchTests = async () => {
//     try {
//       const response = await axios.get('/api/tests');
//       setTests(response.data.data);
//     } catch (error) {
//       console.error('Error fetching tests:', error);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await axios.post('/api/tests', formData);
//       setShowForm(false);
//       setFormData({
//         title: '',
//         type: 'daily',
//         subjects: [],
//         duration: 60,
//         scheduleDate: '',
//         questions: [{
//           text: '',
//           image: '',
//           options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
//           subject: 'Physics',
//           chapter: '',
//           subTopic: '',
//           hint: '',
//           approach: '',
//           steps: ['']
//         }]
//       });
//       fetchTests();
//     } catch (error) {
//       console.error('Error creating test:', error);
//     }
//   };

//   const handleQuestionChange = (index, field, value) => {
//     const updatedQuestions = [...formData.questions];
//     updatedQuestions[index][field] = value;
//     setFormData({ ...formData, questions: updatedQuestions });
//   };

//   const handleOptionChange = (qIndex, oIndex, field, value) => {
//     const updatedQuestions = [...formData.questions];
//     updatedQuestions[qIndex].options[oIndex][field] = value;
//     setFormData({ ...formData, questions: updatedQuestions });
//   };

//   const addQuestion = () => {
//     setFormData({
//       ...formData,
//       questions: [...formData.questions, {
//         text: '',
//         image: '',
//         options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }, { text: '', isCorrect: false }],
//         subject: 'Physics',
//         chapter: '',
//         subTopic: '',
//         hint: '',
//         approach: '',
//         steps: ['']
//       }]
//     });
//   };

//   const deleteTest = async (testId) => {
//     if (window.confirm('Are you sure you want to delete this test?')) {
//       try {
//         await axios.delete(`/api/tests/${testId}`);
//         fetchTests();
//       } catch (error) {
//         console.error('Error deleting test:', error);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500">
//             ← Back to Dashboard
//           </Link>
//           <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
//           <button
//             onClick={() => setShowForm(true)}
//             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//           >
//             Create New Test
//           </button>
//         </div>

//         {/* Test List */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="px-6 py-4 border-b">
//             <h2 className="text-lg font-semibold">Scheduled Tests</h2>
//           </div>
//           <div className="divide-y">
//             {tests.map(test => (
//               <div key={test._id} className="p-6 hover:bg-gray-50">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-semibold text-lg">{test.title}</h3>
//                     <div className="text-sm text-gray-600 mt-1">
//                       <span className={`inline-block px-2 py-1 rounded ${
//                         test.type === 'daily' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
//                       }`}>
//                         {test.type}
//                       </span>
//                       • {test.subjects.join(', ')} • {test.duration} minutes
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       Scheduled: {format(new Date(test.scheduleDate), 'MMM d, yyyy h:mm a')}
//                     </div>
//                     <div className="text-sm text-gray-600">
//                       Questions: {test.questions.length}
//                     </div>
//                   </div>
//                   <div className="flex space-x-2">
//                     <button className="text-red-600 hover:text-red-800" onClick={() => deleteTest(test._id)}>
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Create Test Modal */}
//         {showForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//             <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
//               <div className="p-6">
//                 <h2 className="text-xl font-bold mb-4">Create New Test</h2>
                
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   {/* Basic Test Info */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Test Title</label>
//                                             <input
//                         type="text"
//                         value={formData.title}
//                         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Test Type</label>
//                       <select
//                         value={formData.type}
//                         onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                       >
//                         <option value="daily">Daily Test</option>
//                         <option value="weekly">Weekly Test</option>
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
//                       <input
//                         type="number"
//                         value={formData.duration}
//                         onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
//                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700">Schedule Date & Time</label>
//                       <input
//                         type="datetime-local"
//                         value={formData.scheduleDate}
//                         onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
//                         className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">Subjects</label>
//                     <div className="mt-2 space-x-4">
//                       {['Physics', 'Chemistry', 'Biology'].map(subject => (
//                         <label key={subject} className="inline-flex items-center">
//                           <input
//                             type="checkbox"
//                             checked={formData.subjects.includes(subject)}
//                             onChange={(e) => {
//                               const subjects = e.target.checked
//                                 ? [...formData.subjects, subject]
//                                 : formData.subjects.filter(s => s !== subject);
//                               setFormData({ ...formData, subjects });
//                             }}
//                             className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                           />
//                           <span className="ml-2">{subject}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Questions */}
//                   <div>
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="text-lg font-medium">Questions</h3>
//                       <button
//                         type="button"
//                         onClick={addQuestion}
//                         className="bg-green-600 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Add Question
//                       </button>
//                     </div>

//                     {formData.questions.map((question, qIndex) => (
//                       <div key={qIndex} className="border rounded-lg p-4 mb-4">
//                         <div className="grid grid-cols-2 gap-4 mb-4">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700">Question Text</label>
//                             <textarea
//                               value={question.text}
//                               onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
//                               className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                               rows="3"
//                               required
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700">Subject</label>
//                             <select
//                               value={question.subject}
//                               onChange={(e) => handleQuestionChange(qIndex, 'subject', e.target.value)}
//                               className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                             >
//                               <option value="Physics">Physics</option>
//                               <option value="Chemistry">Chemistry</option>
//                               <option value="Biology">Biology</option>
//                             </select>
                            
//                             <div className="mt-2 grid grid-cols-2 gap-2">
//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700">Chapter</label>
//                                 <input
//                                   type="text"
//                                   value={question.chapter}
//                                   onChange={(e) => handleQuestionChange(qIndex, 'chapter', e.target.value)}
//                                   className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
//                                 />
//                               </div>
//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700">Sub-topic</label>
//                                 <input
//                                   type="text"
//                                   value={question.subTopic}
//                                   onChange={(e) => handleQuestionChange(qIndex, 'subTopic', e.target.value)}
//                                   className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Options */}
//                         <div className="mb-4">
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
//                           {question.options.map((option, oIndex) => (
//                             <div key={oIndex} className="flex items-center space-x-2 mb-2">
//                               <input
//                                 type="radio"
//                                 name={`correct-${qIndex}`}
//                                 checked={option.isCorrect}
//                                 onChange={() => {
//                                   const updatedOptions = question.options.map((opt, index) => ({
//                                     ...opt,
//                                     isCorrect: index === oIndex
//                                   }));
//                                   handleQuestionChange(qIndex, 'options', updatedOptions);
//                                 }}
//                                 className="text-indigo-600 focus:ring-indigo-500"
//                               />
//                               <input
//                                 type="text"
//                                 value={option.text}
//                                 onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
//                                 className="flex-1 border border-gray-300 rounded-md px-3 py-2"
//                                 placeholder={`Option ${oIndex + 1}`}
//                                 required
//                               />
//                             </div>
//                           ))}
//                         </div>

//                         {/* Daily Test Features */}
//                         {formData.type === 'daily' && (
//                           <div className="space-y-4">
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700">Hint</label>
//                               <input
//                                 type="text"
//                                 value={question.hint}
//                                 onChange={(e) => handleQuestionChange(qIndex, 'hint', e.target.value)}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700">Approach</label>
//                               <textarea
//                                 value={question.approach}
//                                 onChange={(e) => handleQuestionChange(qIndex, 'approach', e.target.value)}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
//                                 rows="2"
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700">Solution Steps</label>
//                               {question.steps.map((step, sIndex) => (
//                                 <div key={sIndex} className="flex space-x-2 mb-2">
//                                   <span className="w-6 h-6 bg-gray-200 rounded-full text-center text-sm leading-6">
//                                     {sIndex + 1}
//                                   </span>
//                                   <input
//                                     type="text"
//                                     value={step}
//                                     onChange={(e) => {
//                                       const updatedSteps = [...question.steps];
//                                       updatedSteps[sIndex] = e.target.value;
//                                       handleQuestionChange(qIndex, 'steps', updatedSteps);
//                                     }}
//                                     className="flex-1 border border-gray-300 rounded-md px-3 py-2"
//                                     placeholder={`Step ${sIndex + 1}`}
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() => {
//                                       const updatedSteps = question.steps.filter((_, i) => i !== sIndex);
//                                       handleQuestionChange(qIndex, 'steps', updatedSteps);
//                                     }}
//                                     className="text-red-600 hover:text-red-800"
//                                   >
//                                     Remove
//                                   </button>
//                                 </div>
//                               ))}
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   const updatedSteps = [...question.steps, ''];
//                                   handleQuestionChange(qIndex, 'steps', updatedSteps);
//                                 }}
//                                 className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm mt-2"
//                               >
//                                 Add Step
//                               </button>
//                             </div>
//                           </div>
//                         )}

//                         <button
//                           type="button"
//                           onClick={() => {
//                             const updatedQuestions = formData.questions.filter((_, i) => i !== qIndex);
//                             setFormData({ ...formData, questions: updatedQuestions });
//                           }}
//                           className="mt-2 text-red-600 hover:text-red-800 text-sm"
//                         >
//                           Remove Question
//                         </button>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="flex justify-end space-x-4">
//                     <button
//                       type="button"
//                       onClick={() => setShowForm(false)}
//                       className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//                     >
//                       Create Test
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default AdminPanel;




import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

function AdminPanel() {
  const [tests, setTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'daily',
    subjects: [],
    duration: 60,
    scheduleDate: '',
    questions: [{
      text: '',
      image: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      subject: 'Physics',
      chapter: '',
      subTopic: '',
      hint: '',
      approach: '',
      steps: ['']
    }]
  });

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/api/tests');
      setTests(response.data.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  // Cloudinary Upload Function
  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'test_preset'); // apna unsigned preset daalna
    data.append('cloud_name', 'djwkt80ss'); // apna cloud name

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/djwkt80ss/image/upload`, {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      return json.secure_url; // Uploaded image URL
    } catch (err) {
      console.error('Image upload failed:', err);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tests', formData);
      setShowForm(false);
      setFormData({
        title: '',
        type: 'daily',
        subjects: [],
        duration: 60,
        scheduleDate: '',
        questions: [{
          text: '',
          image: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          subject: 'Physics',
          chapter: '',
          subTopic: '',
          hint: '',
          approach: '',
          steps: ['']
        }]
      });
      fetchTests();
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[oIndex][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          text: '',
          image: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          subject: 'Physics',
          chapter: '',
          subTopic: '',
          hint: '',
          approach: '',
          steps: ['']
        }
      ]
    });
  };

  const deleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await axios.delete(`/api/tests/${testId}`);
        fetchTests();
      } catch (error) {
        console.error('Error deleting test:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Create New Test
          </button>
        </div>


     
<div className="flex space-x-4 mb-6">
  
  <Link
    to="/admin/students"
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
  >
    Student Management
  </Link>
</div>

        {/* Test List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Scheduled Tests</h2>
          </div>
          <div className="divide-y">
            {tests.map(test => (
              <div key={test._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{test.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className={`inline-block px-2 py-1 rounded ${
                        test.type === 'daily'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {test.type}
                      </span>
                      • {test.subjects.join(', ')} • {test.duration} minutes
                    </div>
                    <div className="text-sm text-gray-600">
                      Scheduled: {format(new Date(test.scheduleDate), 'MMM d, yyyy h:mm a')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Questions: {test.questions.length}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => deleteTest(test._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create Test Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Create New Test</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Test Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Test Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Test Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="daily">Daily Test</option>
                        <option value="weekly">Weekly Test</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: parseInt(e.target.value) })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Schedule Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.scheduleDate}
                        onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subjects</label>
                    <div className="mt-2 space-x-4">
                      {['Physics', 'Chemistry', 'Biology'].map(subject => (
                        <label key={subject} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.subjects.includes(subject)}
                            onChange={(e) => {
                              const subjects = e.target.checked
                                ? [...formData.subjects, subject]
                                : formData.subjects.filter(s => s !== subject);
                              setFormData({ ...formData, subjects });
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2">{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Questions */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Questions</h3>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Add Question
                      </button>
                    </div>

                    {formData.questions.map((question, qIndex) => (
                      <div key={qIndex} className="border rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Question Text</label>
                            <textarea
                              value={question.text}
                              onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              rows="3"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Subject</label>
                            <select
                              value={question.subject}
                              onChange={(e) => handleQuestionChange(qIndex, 'subject', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                              <option value="Physics">Physics</option>
                              <option value="Chemistry">Chemistry</option>
                              <option value="Biology">Biology</option>
                            </select>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Chapter</label>
                                <input
                                  type="text"
                                  value={question.chapter}
                                  onChange={(e) =>
                                    handleQuestionChange(qIndex, 'chapter', e.target.value)
                                  }
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Sub-topic</label>
                                <input
                                  type="text"
                                  value={question.subTopic}
                                  onChange={(e) =>
                                    handleQuestionChange(qIndex, 'subTopic', e.target.value)
                                  }
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Upload Image (Optional)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const imageUrl = await uploadImageToCloudinary(file);
                                handleQuestionChange(qIndex, 'image', imageUrl);
                              }
                            }}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />

                          {question.image && (
                            <img
                              src={question.image}
                              alt="Preview"
                              className="mt-2 h-32 object-cover rounded"
                            />
                          )}
                        </div>

                        {/* Options */}
                        <div className="mb-4 mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center space-x-2 mb-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={option.isCorrect}
                                onChange={() => {
                                  const updatedOptions = question.options.map((opt, index) => ({
                                    ...opt,
                                    isCorrect: index === oIndex,
                                  }));
                                  handleQuestionChange(qIndex, 'options', updatedOptions);
                                }}
                                className="text-indigo-600 focus:ring-indigo-500"
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) =>
                                  handleOptionChange(qIndex, oIndex, 'text', e.target.value)
                                }
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                                placeholder={`Option ${oIndex + 1}`}
                                required
                              />
                            </div>
                          ))}
                        </div>

                        {/* Daily Test Features */}
                        {formData.type === 'daily' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Hint</label>
                              <input
                                type="text"
                                value={question.hint}
                                onChange={(e) => handleQuestionChange(qIndex, 'hint', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Approach</label>
                              <textarea
                                value={question.approach}
                                onChange={(e) => handleQuestionChange(qIndex, 'approach', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                rows="2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Solution Steps</label>
                              {question.steps.map((step, sIndex) => (
                                <div key={sIndex} className="flex space-x-2 mb-2">
                                  <span className="w-6 h-6 bg-gray-200 rounded-full text-center text-sm leading-6">
                                    {sIndex + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={step}
                                    onChange={(e) => {
                                      const updatedSteps = [...question.steps];
                                      updatedSteps[sIndex] = e.target.value;
                                      handleQuestionChange(qIndex, 'steps', updatedSteps);
                                    }}
                                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                                    placeholder={`Step ${sIndex + 1}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedSteps = question.steps.filter((_, i) => i !== sIndex);
                                      handleQuestionChange(qIndex, 'steps', updatedSteps);
                                    }}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedSteps = [...question.steps, ''];
                                  handleQuestionChange(qIndex, 'steps', updatedSteps);
                                }}
                                className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm mt-2"
                              >
                                Add Step
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const updatedQuestions = formData.questions.filter((_, i) => i !== qIndex);
                            setFormData({ ...formData, questions: updatedQuestions });
                          }}
                          className="mt-2 text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Question
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Create Test
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
