import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function TestInterface() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showApproach, setShowApproach] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const questionTimerRef = useRef(null);

  useEffect(() => {
    fetchTest();
    startOverallTimer();
    return () => {
      clearInterval(questionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Start timing for current question
    clearInterval(questionTimerRef.current);
    questionTimerRef.current = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = { ...prev };
        newTime[currentQuestion] = (newTime[currentQuestion] || 0) + 1;
        return newTime;
      });
    }, 1000);

    // Reset solution views when question changes
    setShowSolution(false);
    setShowHint(false);
    setShowApproach(false);
    setCurrentStep(0);

    return () => clearInterval(questionTimerRef.current);
  }, [currentQuestion]);

  const fetchTest = async () => {
    try {
      const response = await axios.get(`/api/tests/${id}`);
      setTest(response.data.data);
      setTimer(response.data.data.duration * 60); // Convert to seconds
    } catch (error) {
      console.error('Error fetching test:', error);
    }
  };

  const startOverallTimer = () => {
    setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSelect = (optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const submission = {
        answers: Object.entries(answers).map(([questionIndex, selectedOption]) => ({
          questionId: test.questions[questionIndex]._id,
          selectedOption: test.questions[questionIndex].options[selectedOption].text,
          timeSpent: timeSpent[questionIndex] || 0
        })),
        timeTaken: test.duration * 60 - timer
      };

      await axios.post(`/api/tests/${id}/submit`, submission);
      navigate(`/report/${id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  if (!test) {
    return <div className="flex justify-center items-center h-screen">Loading test...</div>;
  }

  const question = test.questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const isDailyTest = test.type === 'daily';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {test.questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{formatTime(timer)}</div>
              <div className="text-sm text-gray-500">Time Remaining</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Question */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {question.text}
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {question.subject}
              </span>
            </div>
            
            {question.image && (
              <div className="mb-4">
                <img src={question.image} alt="Question diagram" className="max-w-full h-auto rounded" />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  checked={selectedAnswer === index}
                  onChange={() => handleAnswerSelect(index)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-3 text-gray-900">{option.text}</span>
              </label>
            ))}
          </div>

          {/* Solution Features (Daily Tests Only) */}
          {isDailyTest && (
            <div className="border-t pt-6 mb-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded hover:bg-yellow-200"
                >
                  Get Hint
                </button>
                <button
                  onClick={() => setShowApproach(!showApproach)}
                  className="bg-green-100 text-green-800 px-4 py-2 rounded hover:bg-green-200"
                >
                  Get Approach
                </button>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded hover:bg-blue-200"
                >
                  Go Through Steps
                </button>
              </div>

              {showHint && question.hint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Hint</h3>
                  <p className="text-yellow-700">{question.hint}</p>
                </div>
              )}

              {showApproach && question.approach && (
                <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
                  <h3 className="font-semibold text-green-800 mb-2">Approach</h3>
                  <p className="text-green-700">{question.approach}</p>
                </div>
              )}

              {showSolution && question.steps && question.steps.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">Step-by-Step Solution</h3>
                  <div className="space-y-3">
                    {question.steps.map((step, index) => (
                      <div key={index} className={`p-3 rounded ${index <= currentStep ? 'bg-white' : 'bg-gray-100'}`}>
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
                            {index + 1}
                          </span>
                          <span className="font-medium">Step {index + 1}</span>
                        </div>
                        <p className="text-gray-700 ml-8">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                      disabled={currentStep === 0}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
                    >
                      Previous Step
                    </button>
                    <button
                      onClick={() => setCurrentStep(prev => Math.min(question.steps.length - 1, prev + 1))}
                      disabled={currentStep === question.steps.length - 1}
                      className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center border-t pt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded disabled:opacity-50 hover:bg-gray-300"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {currentQuestion < test.questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigation Grid */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Question Navigation</h3>
          <div className="grid grid-cols-10 gap-2">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded border ${
                  answers[index] !== undefined 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'bg-white border-gray-300'
                } ${
                  currentQuestion === index ? 'ring-2 ring-indigo-500' : ''
                } hover:bg-gray-100`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestInterface;