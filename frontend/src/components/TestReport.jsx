

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

function TestReport() {
  const { testId } = useParams();
  const [report, setReport] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  useEffect(() => {
    fetchReport();
    fetchPerformanceHistory();
  }, [testId]);

  const fetchReport = async () => {
    try {
      const [testResponse, performanceResponse] = await Promise.all([
        axios.get(`/api/tests/${testId}`),
        axios.get('/api/users/performance')
      ]);

      const testPerformance = performanceResponse.data.data.find(
        perf => perf?.test?._id === testId
      );

      setReport({
        test: testResponse.data.data,
        performance: testPerformance
      });
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const fetchPerformanceHistory = async () => {
    try {
      const response = await axios.get('/api/users/performance');
      setPerformance(response.data.data);
    } catch (error) {
      console.error('Error fetching performance history:', error);
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

  if (!report) {
    return <div className="flex justify-center items-center h-screen">Loading report...</div>;
  }

  const { test, performance: testPerformance } = report;
  const score = testPerformance ? (testPerformance.score / test.questions.length) * 100 : 0;

  // Analysis functions
  const getSubjectPerformance = () => {
    const subjectStats = {};
    
    test.questions.forEach((question, index) => {
      const answer = testPerformance?.answers.find(a => a.question === question._id);
      
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
      const answer = testPerformance?.answers.find(a => a.question === question._id);
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
    return testPerformance?.answers.map((answer, index) => ({
      question: index + 1,
      timeSpent: answer.timeSpent,
      correct: answer.correct
    })) || [];
  };

  const getDetailedQuestionAnalysis = () => {
    return test.questions.map((question, index) => {
      const studentAnswer = testPerformance?.answers.find(a => 
        a.question === question._id
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
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title} - Test Report</h1>
          <p className="text-gray-600 mb-6">
            Taken on {testPerformance ? format(new Date(testPerformance.dateTaken), 'MMMM d, yyyy') : 'N/A'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{score.toFixed(1)}%</div>
              <div className="text-blue-800">Overall Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {testPerformance?.answers.filter(a => a.correct).length || 0}/{test.questions.length}
              </div>
              <div className="text-green-800">Correct Answers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">
                {Math.floor((testPerformance?.timeTaken || 0) / 60)}m {(testPerformance?.timeTaken || 0) % 60}s
              </div>
              <div className="text-purple-800">Time Taken</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">
                {((testPerformance?.answers.filter(a => a.correct).length || 0) / test.questions.length * 100).toFixed(1)}%
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
                                        Your Answer
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

          {/* Performance Trend */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Performance Trend</h2>
            <div className="space-y-4">
              {performance.filter(p => p?.test?.type === test.type).slice(-5).map((perf, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-semibold">{perf.test.title}</div>
                    <div className="text-sm text-gray-600">
                      {format(new Date(perf.dateTaken), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {((perf.score / perf.test.questions.length) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {perf.score}/{perf.test.questions.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <Link
            to="/dashboard"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </Link>
          {test.type === 'weekly' && (
            <Link
              to={`/leaderboard/${testId}`}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              View Leaderboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestReport;