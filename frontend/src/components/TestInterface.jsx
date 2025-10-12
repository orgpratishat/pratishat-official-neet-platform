import React, { useState, useEffect, useRef } from 'react';
import { Clock, Flag, X, Menu } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormattedText from './FormattedText';
import { parseFormattedText, stripFormatting } from '../utils/textFormatter'

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const questionTimerRef = useRef(null);
  const overallTimerRef = useRef(null);

  useEffect(() => {
    fetchTest();
    startOverallTimer();
    return () => {
      clearInterval(questionTimerRef.current);
      clearInterval(overallTimerRef.current);
    };
  }, []);

  useEffect(() => {
    clearInterval(questionTimerRef.current);
    questionTimerRef.current = setInterval(() => {
      setTimeSpent(prev => {
        const newTime = { ...prev };
        newTime[currentQuestion] = (newTime[currentQuestion] || 0) + 1;
        return newTime;
      });
    }, 1000);

    setShowSolution(false);
    setShowHint(false);
    setShowApproach(false);
    setCurrentStep(0);

    return () => clearInterval(questionTimerRef.current);
  }, [currentQuestion]);

  const fetchTest = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/${id}`);
      setTest(response.data.data);
      setTimer(response.data.data.duration * 60);
    } catch (error) {
      console.error('Error fetching test:', error);
    }
  };

  const startOverallTimer = () => {
    overallTimerRef.current = setInterval(() => {
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
    if (isSubmitting || isSubmitted) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submission = {
        answers: Object.entries(answers).map(([questionIndex, selectedOption]) => ({
          questionId: test.questions[questionIndex]._id,
          selectedOption: test.questions[questionIndex].options[selectedOption].text,
          timeSpent: timeSpent[questionIndex] || 0
        })),
        timeTaken: test.duration * 60 - timer
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/tests/${id}/submit`, submission);
      setIsSubmitted(true);
      navigate(`/report/${id}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      setIsSubmitting(false);
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQuestion]: !prev[currentQuestion]
    }));
  };

  const groupQuestionsBySubject = () => {
    if (!test) return {};
    
    return test.questions.reduce((groups, question, index) => {
      const subject = question.subject || 'General';
      if (!groups[subject]) {
        groups[subject] = [];
      }
      groups[subject].push({
        index,
        question,
        answered: answers[index] !== undefined,
        current: currentQuestion === index,
        flagged: flaggedQuestions[index] || false
      });
      return groups;
    }, {});
  };

  if (!test) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const isDailyTest = test.type === 'daily';
  const subjectGroups = groupQuestionsBySubject();
  const isFlagged = flaggedQuestions[currentQuestion] || false;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredQuestionsCount = Object.keys(answers).length;
  const flaggedQuestionsCount = Object.values(flaggedQuestions).filter(Boolean).length;

  const subjectColors = {
    'Physics': 'from-blue-500 to-cyan-500',
    'Chemistry': 'from-purple-500 to-pink-500',
    'Mathematics': 'from-green-500 to-emerald-500',
    'Biology': 'from-red-500 to-orange-500',
    'General': 'from-gray-500 to-slate-500',
    'English': 'from-indigo-500 to-blue-500'
  };

  const getSubjectColor = (subject) => {
    return subjectColors[subject] || 'from-gray-500 to-slate-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modern Header */}
      <div className="bg-white/90 backdrop-blur-lg shadow-lg border-b border-slate-200 sticky top-0 z-40 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-md font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                  {test.title}
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  Question {currentQuestion + 1} of {test.questions.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="hidden sm:flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-600">Answered</div>
                  <div className="text-sm font-bold text-green-600">{answeredQuestionsCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-600">Remaining</div>
                  <div className="text-sm font-bold text-orange-600">{test.questions.length - answeredQuestionsCount}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-600">Flagged</div>
                  <div className="text-sm font-bold text-purple-600">{flaggedQuestionsCount}</div>
                </div>
              </div>

              <div className="text-center">
                <div className={`text-sm sm:text-md font-bold font-mono gap-1 sm:gap-2 flex items-center ${
                  timer < 300 ? 'text-red-500 animate-pulse' : 'text-slate-800'
                }`}>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5"/>
                  {formatTime(timer)}
                </div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:block">
                  Time Remaining
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Progress Stats */}
      <div className="sm:hidden bg-white border-b border-slate-200 py-2">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-xs font-semibold text-slate-600">Answered</div>
            <div className="text-sm font-bold text-green-600">{answeredQuestionsCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-slate-600">Remaining</div>
            <div className="text-sm font-bold text-orange-600">{test.questions.length - answeredQuestionsCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-slate-600">Flagged</div>
            <div className="text-sm font-bold text-purple-600">{flaggedQuestionsCount}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-slate-200 overflow-hidden">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <span className="bg-white/10 text-white/90 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start">
                        Question {currentQuestion + 1}
                      </span>
                      <div className="flex items-center justify-between w-full sm:w-auto">
                        {/* Updated: Use FormattedText for question text */}
                        <div className="text-lg sm:text-xl font-semibold text-white leading-relaxed break-words flex-1 formatted-question">
                          <FormattedText text={question.text} />
                        </div>
                        <button
                          onClick={toggleFlag}
                          className={`ml-2 sm:ml-4 p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                            isFlagged 
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-200' 
                              : 'bg-white/10 text-white/90 hover:bg-white/20'
                          }`}
                          title={isFlagged ? "Remove flag" : "Flag this question"}
                        >
                          <Flag className={`w-4 h-4 ${isFlagged ? 'fill-white' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 lg:p-8">
                {/* Question Image */}
                {question.image && (
                  <div className="mb-6 sm:mb-8 text-center">
                    <img 
                      src={question.image} 
                      alt="Question diagram" 
                      className="max-w-full sm:max-w-[80%] lg:max-w-[30vw] h-auto rounded-lg sm:rounded-xl shadow-md border border-slate-200 mx-auto" 
                    />
                  </div>
                )}

                {/* Enhanced Options with Formatted Text */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                        selectedAnswer === index
                          ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 transition-all flex-shrink-0 mt-1 ${
                          selectedAnswer === index
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-slate-300 group-hover:border-slate-400 bg-white'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Option Text with Formatting */}
                          {option.text && (
                            <div className={`text-base sm:text-lg font-medium break-words mb-2 formatted-option ${
                              selectedAnswer === index ? 'text-blue-900' : 'text-slate-800'
                            }`}>
                              <FormattedText text={option.text} />
                            </div>
                          )}
                          
                          {/* Option Image */}
                          {option.image && (
                            <div className="mt-2">
                              <img 
                                src={option.image} 
                                alt={`Option ${String.fromCharCode(65 + index)} diagram`}
                                className="max-w-full sm:max-w-xs h-auto rounded-lg border border-slate-200 shadow-sm"
                              />
                            </div>
                          )}
                          
                          {/* Show when both text and image are missing */}
                          {!option.text && !option.image && (
                            <div className="text-slate-500 italic text-sm">
                              Option {String.fromCharCode(65 + index)} (No content)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Solution Features (Daily Tests Only) */}
                {isDailyTest && (
                  <div className="border-t border-slate-200 pt-6 sm:pt-8 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                          showHint 
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' 
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm sm:text-base">Get Hint</span>
                      </button>
                      <button
                        onClick={() => setShowApproach(!showApproach)}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                          showApproach 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="text-sm sm:text-base">Get Approach</span>
                      </button>
                      <button
                        onClick={() => setShowSolution(!showSolution)}
                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                          showSolution 
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                        </svg>
                        <span className="text-sm sm:text-base">Go Through Steps</span>
                      </button>
                    </div>

                    {showHint && question.hint && (
                      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h3 className="font-bold text-amber-900 text-base sm:text-lg">Hint</h3>
                        </div>
                        {/* Updated: Use FormattedText for hint */}
                        <div className="text-amber-800 ml-8 sm:ml-11 leading-relaxed text-sm sm:text-base formatted-hint">
                          <FormattedText text={question.hint} />
                        </div>
                      </div>
                    )}

                    {showApproach && question.approach && (
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <h3 className="font-bold text-emerald-900 text-base sm:text-lg">Approach</h3>
                        </div>
                        {/* Updated: Use FormattedText for approach */}
                        <div className="text-emerald-800 ml-8 sm:ml-11 leading-relaxed text-sm sm:text-base formatted-approach">
                          <FormattedText text={question.approach} />
                        </div>
                      </div>
                    )}

                    {showSolution && question.steps && question.steps.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center mb-4 sm:mb-6">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                            </svg>
                          </div>
                          <h3 className="font-bold text-blue-900 text-base sm:text-lg">Step-by-Step Solution</h3>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          {question.steps.map((step, index) => (
                            <div 
                              key={index} 
                              className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all ${
                                index <= currentStep 
                                  ? 'bg-white border-blue-200 shadow-sm' 
                                  : 'bg-slate-50/50 border-slate-100'
                              }`}
                            >
                              <div className="flex items-start">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-3 sm:mr-4 font-semibold text-sm sm:text-base flex-shrink-0 ${
                                  index <= currentStep 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-slate-300 text-slate-500'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-slate-700 mb-1 text-sm sm:text-base">Step {index + 1}</div>
                                  {/* Updated: Use FormattedText for steps */}
                                  <div className="text-slate-600 leading-relaxed text-sm sm:text-base break-words formatted-step">
                                    <FormattedText text={step} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 mt-4 sm:mt-6">
                          <button
                            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                            disabled={currentStep === 0}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Previous Step</span>
                          </button>
                          <button
                            onClick={() => setCurrentStep(prev => Math.min(question.steps.length - 1, prev + 1))}
                            disabled={currentStep === question.steps.length - 1}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                          >
                            <span>Next Step</span>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 border-t border-slate-200 pt-6 sm:pt-8">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base order-2 sm:order-1"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>
                  
                  <div className="flex space-x-3 w-full sm:w-auto order-1 sm:order-2">
                    {currentQuestion < test.questions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                      >
                        <span>Next Question</span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isSubmitted}
                        className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Submit Test</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar with Subject Grouping */}
          <div className={`lg:w-80 w-full ${isSidebarOpen ? 'fixed inset-0 z-50 bg-white lg:static lg:bg-transparent' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl border border-slate-200 sticky top-24 h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 sm:p-6 border-b border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 text-lg">Question Palette</h3>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <div className="flex space-x-3 sm:space-x-4 text-center">
                  <div className="flex-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs text-slate-600">Answered</div>
                  </div>
                  <div className="flex-1">
                    <div className="w-3 h-3 bg-slate-300 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs text-slate-600">Unanswered</div>
                  </div>
                  <div className="flex-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs text-slate-600">Current</div>
                  </div>
                  <div className="flex-1">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div>
                    <div className="text-xs text-slate-600">Flagged</div>
                  </div>
                </div>
              </div>

              {/* Subject-wise Question Grid with Scroll */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
                  {Object.entries(subjectGroups).map(([subject, questions]) => (
                    <div key={subject} className="space-y-2 sm:space-y-3">
                      <div className={`bg-gradient-to-r ${getSubjectColor(subject)} text-white px-3 sm:px-4 py-2 rounded-lg`}>
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-xs sm:text-sm">{subject}</h4>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            {questions.length} Qs
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 sm:gap-2">
                        {questions.map(({ index, answered, current, flagged }) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentQuestion(index);
                              setIsSidebarOpen(false);
                            }}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg border-2 font-semibold transition-all text-xs sm:text-sm relative ${
                              flagged 
                                ? 'bg-purple-500 text-white border-purple-500 shadow-sm' 
                                : answered 
                                  ? 'bg-green-500 text-white border-green-500 shadow-sm' 
                                  : 'bg-white border-slate-300 text-slate-700'
                            } ${
                              current 
                                ? 'ring-2 ring-blue-500 ring-offset-1 border-orange-500 scale-110' 
                                : 'hover:border-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {index + 1}
                            {flagged && (
                              <div className="absolute -top-1 -right-1">
                                <Flag className="w-2 h-2 sm:w-3 sm:h-3 fill-white text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary and Submit Section */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50">
                <div className="grid grid-cols-3 gap-2 text-sm mb-3 sm:mb-4">
                  <div className="text-center">
                    <div className="font-bold text-green-600 text-base sm:text-lg">{answeredQuestionsCount}</div>
                    <div className="text-slate-600 text-xs sm:text-sm">Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-600 text-base sm:text-lg">{test.questions.length - answeredQuestionsCount}</div>
                    <div className="text-slate-600 text-xs sm:text-sm">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600 text-base sm:text-lg">{flaggedQuestionsCount}</div>
                    <div className="text-slate-600 text-xs sm:text-sm">Flagged</div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isSubmitted}
                  className="w-full py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Test</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Add CSS for formatted text */}
      <style jsx>{`
        /* Base formatted text styles */
        .formatted-text {
          line-height: 1.6;
        }
        
        .formatted-text :global(strong) {
          font-weight: bold;
          color: inherit;
        }

        .formatted-text :global(em) {
          font-style: italic;
          color: inherit;
        }

        .formatted-text :global(u) {
          text-decoration: underline;
          color: inherit;
        }

        .formatted-text :global(sub) {
          vertical-align: sub;
          font-size: 0.75em;
          line-height: 0;
          position: relative;
          bottom: -0.25em;
        }

        .formatted-text :global(sup) {
          vertical-align: super;
          font-size: 0.75em;
          line-height: 0;
          position: relative;
          top: -0.5em;
        }

        .formatted-text :global(br) {
          content: '';
          display: block;
          margin-bottom: 0.5em;
        }

        /* Specific styles for different contexts */
        .formatted-question :global(.formatted-text) {
          font-size: inherit;
          line-height: 1.5;
        }

        .formatted-option :global(.formatted-text) {
          font-size: inherit;
        }

        .formatted-hint :global(.formatted-text),
        .formatted-approach :global(.formatted-text),
        .formatted-step :global(.formatted-text) {
          font-size: inherit;
          line-height: 1.6;
        }

        /* Ensure proper spacing for formatted elements */
        .formatted-text :global(strong),
        .formatted-text :global(em),
        .formatted-text :global(u),
        .formatted-text :global(sub),
        .formatted-text :global(sup) {
          display: inline;
        }

        /* Math and symbol support */
        .formatted-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                      'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 
                      'Segoe UI Emoji', 'Segoe UI Symbol';
        }

        /* Dark mode support for question header */
        .formatted-question :global(.formatted-text) {
          color: inherit;
        }

        .formatted-question :global(.formatted-text strong),
        .formatted-question :global(.formatted-text em),
        .formatted-question :global(.formatted-text u),
        .formatted-question :global(.formatted-text sub),
        .formatted-question :global(.formatted-text sup) {
          color: inherit;
        }
      `}</style>
    </div>
  );
}

export default TestInterface;