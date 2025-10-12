import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

function AdminPanel() {
  const [tests, setTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploadingStates, setUploadingStates] = useState({}); // Track uploading states
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
        { text: '', image: '', isCorrect: false },
        { text: '', image: '', isCorrect: false },
        { text: '', image: '', isCorrect: false },
        { text: '', image: '', isCorrect: false }
      ],
      subject: 'Physics',
      difficulty: 'medium',
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests`);
      setTests(response.data.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  // Cloudinary Upload Function for WebP only
  const uploadImageToCloudinary = async (file) => {
    // Check if file is WebP
    if (file.type !== 'image/webp') {
      alert('Please upload only WebP images. Other formats are not allowed.');
      return '';
    }

    // Check file size (optional: limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return '';
    }

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'test_preset');
    data.append('cloud_name', 'djwkt80ss');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/djwkt80ss/image/upload`, {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      
      if (res.ok) {
        return json.secure_url;
      } else {
        console.error('Upload failed:', json);
        alert('Image upload failed. Please try again.');
        return '';
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Image upload failed. Please check your connection and try again.');
      return '';
    }
  };

  // Validate form before submission
  const validateForm = () => {
    // Check if basic test info is filled
    if (!formData.title.trim()) {
      alert('Please enter a test title');
      return false;
    }

    if (formData.subjects.length === 0) {
      alert('Please select at least one subject');
      return false;
    }

    if (!formData.scheduleDate) {
      alert('Please select a schedule date and time');
      return false;
    }

    // Check if duration is valid
    if (formData.duration < 1) {
      alert('Please enter a valid duration');
      return false;
    }

    // Check each question and its options
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      
      // Check if question text is filled
      if (!question.text.trim()) {
        alert(`Please enter text for Question ${i + 1}`);
        return false;
      }

       if (!question.chapter.trim()) {
    alert(`Please enter chapter for Question ${i + 1}`);
    return false;
  }
  
  if (!question.subTopic.trim()) {
    alert(`Please enter sub-topic for Question ${i + 1}`);
    return false;
  }

      // Check if at least one option is marked as correct
      const hasCorrectOption = question.options.some(option => option.isCorrect);
      if (!hasCorrectOption) {
        alert(`Please mark the correct option for Question ${i + 1}`);
        return false;
      }

      // Check if all options have text
      for (let j = 0; j < question.options.length; j++) {
        const option = question.options[j];
        if (!option.text.trim()) {
          alert(`Please enter text for Option ${j + 1} in Question ${i + 1}`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/tests`, formData);
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
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false }
          ],
          subject: 'Physics',
          difficulty: 'medium',
          chapter: '',
          subTopic: '',
          hint: '',
          approach: '',
          steps: ['']
        }]
      });
      fetchTests();
      alert('Test created successfully!');
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Error creating test. Please try again.');
    }
  };

  // Handle file input change with WebP validation
  const handleImageUpload = async (event, qIndex, field, oIndex = null) => {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (file.type !== 'image/webp') {
      alert('Only WebP images are allowed. Please convert your image to WebP format.');
      event.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      event.target.value = '';
      return;
    }

    // Set uploading state
    const uploadKey = oIndex !== null ? `q${qIndex}_o${oIndex}` : `q${qIndex}_${field}`;
    setUploadingStates(prev => ({ ...prev, [uploadKey]: true }));

    const imageUrl = await uploadImageToCloudinary(file);
    
    if (imageUrl) {
      if (oIndex !== null) {
        // Update option image
        handleOptionImageChange(qIndex, oIndex, imageUrl);
      } else {
        // Update question image
        handleQuestionChange(qIndex, field, imageUrl);
      }
    }

    // Clear uploading state
    setUploadingStates(prev => ({ ...prev, [uploadKey]: false }));
    
    // Clear the input
    event.target.value = '';
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

  const handleOptionImageChange = (qIndex, oIndex, imageUrl) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[qIndex].options[oIndex].image = imageUrl;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestionImage = (qIndex) => {
    handleQuestionChange(qIndex, 'image', '');
  };

  const removeOptionImage = (qIndex, oIndex) => {
    handleOptionImageChange(qIndex, oIndex, '');
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
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false }
          ],
          subject: 'Physics',
          difficulty: 'medium',
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
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/tests/${testId}`);
        fetchTests();
        alert('Test deleted successfully!');
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Error deleting test. Please try again.');
      }
    }
  };

  const isUploading = (qIndex, field, oIndex = null) => {
    const key = oIndex !== null ? `q${qIndex}_o${oIndex}` : `q${qIndex}_${field}`;
    return uploadingStates[key] || false;
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
                    <div className="text-sm text-gray-600 mt-1">
                      Difficulty: 
                      {(() => {
                        const difficulties = test.questions.reduce((acc, q) => {
                          acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                          return acc;
                        }, {});
                        
                        return Object.entries(difficulties).map(([diff, count]) => (
                          <span key={diff} className={`ml-2 px-2 py-1 rounded text-xs ${
                            diff === 'easy' ? 'bg-green-100 text-green-800' :
                            diff === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {diff}: {count}
                          </span>
                        ));
                      })()}
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
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Create New Test</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Test Info - Frozen Section */}
                  <div className="sticky top-0 bg-white z-10 py-4 border-b shadow-sm">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Test Title *</label>
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
                        <label className="block text-sm font-medium text-gray-700">Duration (minutes) *</label>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({ ...formData, duration: parseInt(e.target.value) })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Schedule Date & Time *</label>
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
                      <label className="block text-sm font-medium text-gray-700">Subjects *</label>
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
                  </div>

                  {/* Questions */}
                  <div>
                    <div className="flex justify-between items-center mb-4 sticky top-20 bg-white z-10 py-4 border-b">
                      <h3 className="text-lg font-medium">Questions</h3>
                      <button
                        type="button"
                        onClick={addQuestion}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        Add Question
                      </button>
                    </div>

                    {formData.questions.map((question, qIndex) => (
                      <div key={qIndex} className="border rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Question Text *</label>
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

                            <div className="mt-2">
                              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                              <select
                                value={question.difficulty}
                                onChange={(e) => handleQuestionChange(qIndex, 'difficulty', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                              </select>
                            </div>

                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Chapter *</label>
                                <input
                                  type="text"
                                  value={question.chapter}
                                  onChange={(e) =>
                                    handleQuestionChange(qIndex, 'chapter', e.target.value)
                                  }
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm" required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">Sub-topic *</label>
                                <input
                                  type="text"
                                  value={question.subTopic}
                                  onChange={(e) =>
                                    handleQuestionChange(qIndex, 'subTopic', e.target.value)
                                  }
                                  className="mt-1 block w-full border border-gray-300 rounded-md px-2 py-1 text-sm" required
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Question Image Upload - WebP Only */}
                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Upload Question Image (WebP Only  - Max 5MB) (Optional)
                          </label>
                          <input
                            type="file"
                            accept=".webp,image/webp"
                            onChange={(e) => handleImageUpload(e, qIndex, 'image')}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                            disabled={isUploading(qIndex, 'image')}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Only WebP format is allowed. Convert your images to WebP before uploading.
                          </p>

                          {isUploading(qIndex, 'image') && (
                            <div className="mt-2 text-blue-600 text-sm">Uploading...</div>
                          )}

                          {question.image && !isUploading(qIndex, 'image') && (
                            <div className="mt-2 relative inline-block">
                              <img
                                src={question.image}
                                alt="Question preview"
                                className="h-32 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeQuestionImage(qIndex)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Options with Image Upload */}
                        <div className="mb-4 mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Options * (Select the correct one)
                          </label>
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="border rounded-lg p-3 mb-3 bg-white">
                              <div className="flex items-start space-x-2 mb-2">
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
                                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) =>
                                      handleOptionChange(qIndex, oIndex, 'text', e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
                                    placeholder={`Option ${oIndex + 1} text *`}
                                    required
                                  />
                                  
                                  {/* Option Image Upload */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Option Image (Optional - WebP Only)
                                    </label>
                                    <input
                                      type="file"
                                      accept=".webp,image/webp"
                                      onChange={(e) => handleImageUpload(e, qIndex, 'option', oIndex)}
                                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                      disabled={isUploading(qIndex, 'option', oIndex)}
                                    />
                                    
                                    {isUploading(qIndex, 'option', oIndex) && (
                                      <div className="text-blue-600 text-xs mt-1">Uploading...</div>
                                    )}

                                    {option.image && !isUploading(qIndex, 'option', oIndex) && (
                                      <div className="mt-2 relative inline-block">
                                        <img
                                          src={option.image}
                                          alt={`Option ${oIndex + 1} preview`}
                                          className="h-20 object-cover rounded border"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeOptionImage(qIndex, oIndex)}
                                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Hint, Approach and Steps - Optional */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Hint (Optional)</label>
                            <input
                              type="text"
                              value={question.hint}
                              onChange={(e) => handleQuestionChange(qIndex, 'hint', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              placeholder="Provide a hint for the question (optional)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Approach (Optional)</label>
                            <textarea
                              value={question.approach}
                              onChange={(e) => handleQuestionChange(qIndex, 'approach', e.target.value)}
                              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                              rows="2"
                              placeholder="Describe the approach to solve this question (optional)"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Solution Steps (Optional)</label>
                            {question.steps.map((step, sIndex) => (
                              <div key={sIndex} className="flex space-x-2 mb-2">
                                <span className="w-6 h-6 bg-gray-200 rounded-full text-center text-sm leading-6 flex-shrink-0">
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
                                  placeholder={`Step ${sIndex + 1} (optional)`}
                                />
                                {question.steps.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedSteps = question.steps.filter((_, i) => i !== sIndex);
                                      handleQuestionChange(qIndex, 'steps', updatedSteps);
                                    }}
                                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedSteps = [...question.steps, ''];
                                handleQuestionChange(qIndex, 'steps', updatedSteps);
                              }}
                              className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm mt-2 hover:bg-gray-300"
                            >
                              Add Step
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedQuestions = formData.questions.filter((_, i) => i !== qIndex);
                              setFormData({ ...formData, questions: updatedQuestions });
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove Question
                          </button>
                          
                          <span className="text-sm text-gray-500">
                            Question {qIndex + 1} of {formData.questions.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Frozen Action Buttons Section */}
                  <div className="sticky bottom-0 bg-white z-10 py-4 border-t shadow-lg">
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Are you sure? All unsaved changes will be lost.')) {
                            setShowForm(false);
                          }
                        }}
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