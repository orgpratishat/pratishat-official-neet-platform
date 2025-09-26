import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isSameDay as dateFnsIsSameDay, getHours, getMinutes } from 'date-fns';
import axios from 'axios';

function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tests, setTests] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');

  useEffect(() => {
    fetchTests();
  }, [currentDate]);

  const fetchTests = async () => {
    try {
      const response = await axios.get('/api/tests');
      setTests(response.data.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const getTestsForDate = (date) => {
    return tests.filter(test => 
      dateFnsIsSameDay(new Date(test.scheduleDate), date)
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  };

  // Get all unique hours that have tests in the current week
  const getHoursWithTests = () => {
    const weekDays = getWeekDays();
    const hoursSet = new Set();
    
    weekDays.forEach(day => {
      const dayTests = getTestsForDate(day);
      dayTests.forEach(test => {
        const testDate = new Date(test.scheduleDate);
        const testHour = getHours(testDate);
        hoursSet.add(testHour);
        
        // Also include hours that are part of the test duration
        const duration = test.duration || 60;
        const durationHours = Math.ceil(duration / 60);
        for (let i = 1; i < durationHours; i++) {
          hoursSet.add(testHour + i);
        }
      });
    });

    // Convert to array, sort, and ensure unique values
    const hoursArray = Array.from(hoursSet).sort((a, b) => a - b);
    
    return hoursArray;
  };

  // Group tests by day and hour for easy access
  const getTestsGroupedByDayAndHour = () => {
    const weekDays = getWeekDays();
    const grouped = {};
    
    weekDays.forEach(day => {
      const dayKey = day.toISOString();
      grouped[dayKey] = {};
      
      const dayTests = getTestsForDate(day);
      dayTests.forEach(test => {
        const testHour = getHours(new Date(test.scheduleDate));
        if (!grouped[dayKey][testHour]) {
          grouped[dayKey][testHour] = [];
        }
        grouped[dayKey][testHour].push(test);
      });
    });
    
    return grouped;
  };

  const getEventColor = (test) => {
    const colors = {
      daily: 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-200',
      weekly: 'bg-gradient-to-r from-violet-500 to-violet-600 shadow-violet-200',
      monthly: 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200',
      mock: 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-200',
      quiz: 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-200'
    };
    return colors[test.type] || 'bg-gradient-to-r from-slate-500 to-slate-600 shadow-slate-200';
  };

  const getSubjectColor = (subject) => {
    const subjectColors = {
      'Physics': 'border-l-4 border-l-blue-500 bg-blue-50/80',
      'Chemistry': 'border-l-4 border-l-emerald-500 bg-emerald-50/80',
      'Mathematics': 'border-l-4 border-l-violet-500 bg-violet-50/80',
      'Biology': 'border-l-4 border-l-rose-500 bg-rose-50/80',
      'English': 'border-l-4 border-l-amber-500 bg-amber-50/80',
      'Computer Science': 'border-l-4 border-l-indigo-500 bg-indigo-50/80'
    };
    return subjectColors[subject] || 'border-l-4 border-l-slate-500 bg-slate-50/80';
  };

  const formatHour = (hour) => {
    return `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Calculate event position within the hour slot
  const calculateEventPosition = (test, hour) => {
    const testDate = new Date(test.scheduleDate);
    const testHour = getHours(testDate);
    const minutes = getMinutes(testDate);
    const duration = test.duration || 60;
    
    // If test spans multiple hours, we need special handling
    if (testHour === hour) {
      // Test starts in this hour
      const minutesPosition = (minutes / 60) * 100;
      const durationInThisHour = Math.min(60 - minutes, duration);
      const heightPercentage = (durationInThisHour / 60) * 100;
      
      return {
        top: `${minutesPosition}%`,
        height: `${Math.max(20, heightPercentage)}%`,
        minHeight: '40px'
      };
    } else {
      // Test continues from previous hour - span the full hour
      return {
        top: '0%',
        height: '100%',
        minHeight: '60px'
      };
    }
  };

  // Check if a test should be displayed in a specific hour slot
  const shouldDisplayTestInHour = (test, hour) => {
    const testDate = new Date(test.scheduleDate);
    const testHour = getHours(testDate);
    const duration = test.duration || 60;
    const endHour = testHour + Math.ceil(duration / 60) - 1;
    
    return hour >= testHour && hour <= endHour;
  };

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/dashboard" 
            className="group flex items-center text-slate-600 hover:text-slate-800 font-medium transition-all duration-200"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Test Calendar
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-white/20">
              <button
                onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
                className="p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200 text-slate-600 hover:text-slate-800"
              >
                ←
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                }}
                className="px-4 py-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 text-slate-700 font-medium text-sm border border-slate-200/60 hover:border-slate-300"
              >
                Today
              </button>
              <button
                onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
                className="p-2 rounded-lg hover:bg-slate-100/80 transition-all duration-200 text-slate-600 hover:text-slate-800"
              >
                →
              </button>
            </div>
            <span className="text-xl font-semibold bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-xl shadow-lg border border-white/20 text-slate-700">
              {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') : 
               `Week of ${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex space-x-3">
            <button
              onClick={() => setViewMode('month')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                viewMode === 'month' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-600 hover:bg-white/60 hover:shadow-md border border-slate-200/60'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                viewMode === 'week' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-600 hover:bg-white/60 hover:shadow-md border border-slate-200/60'
              }`}
            >
              Week View
            </button>
          </div>
          
          {viewMode === 'week' && (
            <div className="flex items-center space-x-4">
             
            </div>
          )}
        </div>

        {/* Calendar Grid */}
        {viewMode === 'month' ? (
          // Month View
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="grid grid-cols-7 bg-gradient-to-r from-slate-100 to-slate-200 rounded-t-2xl">
              {weekdays.map(day => (
                <div key={day} className="p-4 text-center font-semibold text-slate-700 border-r border-slate-300/30 last:border-r-0">
                  {day.substring(0, 3)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {eachDayOfInterval({ 
                start: startOfMonth(currentDate), 
                end: endOfMonth(currentDate) 
              }).map(day => {
                const dayTests = getTestsForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[140px] p-4 border-r border-b border-slate-200/50 transition-all duration-200 hover:bg-white/60 cursor-pointer group ${
                      isCurrentMonth ? 'bg-white/50' : 'bg-slate-100/50'
                    } ${isToday ? 'bg-blue-50/80 border-blue-200/50 relative' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    {isToday && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-blue-200/20 pointer-events-none"></div>
                    )}
                    <div className={`flex justify-between items-center mb-3 relative z-10 ${
                      isCurrentMonth ? 'text-slate-800' : 'text-slate-400'
                    } ${isToday ? 'text-blue-700' : ''}`}>
                      <span className={`text-lg font-semibold ${
                        isToday ? 'bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center' : ''
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {isToday && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 relative z-10">
                      {dayTests.slice(0, 3).map(test => (
                        <Link
                          key={test._id}
                          to={`/test/${test._id}`}
                          className={`block text-sm p-2 rounded-lg transition-all duration-200 hover:shadow-md hover:transform hover:scale-[1.02] ${getSubjectColor(test.subjects[0])} shadow-sm border border-white/50`}
                          title={`${test.title} - ${format(new Date(test.scheduleDate), 'h:mm a')}`}
                        >
                          <div className="font-medium truncate text-slate-800">{test.title}</div>
                          <div className="text-xs opacity-80 text-slate-600 mt-1">
                            {format(new Date(test.scheduleDate), 'h:mm a')}
                          </div>
                        </Link>
                      ))}
                      {dayTests.length > 3 && (
                        <div className="text-xs text-slate-500 text-center py-2 bg-slate-100/50 rounded-lg border border-slate-200/50">
                          +{dayTests.length - 3} more tests
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Week View
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="calendar-week-view">
              {/* Week Header */}
              <div className="grid grid-cols-8 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300/30">
                <div className="p-4 border-r border-slate-300/30 font-semibold text-slate-700 text-center">Time</div>
                {getWeekDays().map(day => {
                  const isToday = dateFnsIsSameDay(day, new Date());
                  const dayTests = getTestsForDate(day);
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={`p-4 border-r border-slate-300/30 last:border-r-0 text-center cursor-pointer transition-all duration-200 group ${
                        isToday ? 'bg-blue-50/80 border-blue-200/50 relative' : 'hover:bg-white/60'
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {isToday && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-blue-200/20 pointer-events-none"></div>
                      )}
                      <div className={`text-sm font-semibold relative z-10 ${
                        isToday ? 'text-blue-700' : 'text-slate-600'
                      }`}>
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-xl font-bold mt-1 relative z-10 ${
                        isToday ? 'text-blue-800' : 'text-slate-900'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="text-xs text-slate-500 mt-2 relative z-10 bg-white/60 rounded-full py-1 px-2 inline-block">
                        {dayTests.length} test{dayTests.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Time Grid - Only showing hours with tests */}
              <div className="grid grid-cols-8 relative">
                {/* Time Labels */}
                <div className="border-r border-slate-300/30">
                  {getHoursWithTests().map(hour => (
                    <div key={hour} className="h-20 border-b border-slate-200/50 relative flex items-start justify-center pt-3">
                      <div className="text-sm font-semibold text-slate-600 bg-white/60 px-3 py-1.5 rounded-lg shadow-sm border border-white/50">
                        {formatHour(hour)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {getWeekDays().map(day => {
                  const dayKey = day.toISOString();
                  const dayTests = getTestsForDate(day);
                  const hoursWithTests = getHoursWithTests();
                  const isToday = dateFnsIsSameDay(day, new Date());
                  
                  return (
                    <div key={dayKey} className="border-r border-slate-300/30 last:border-r-0 relative">
                      {/* Background Pattern */}
                      {isToday && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-blue-100/10 pointer-events-none"></div>
                      )}
                      
                      {/* Time Slot Background */}
                      <div className="absolute inset-0">
                        {hoursWithTests.map((hour, index) => (
                          <div 
                            key={hour} 
                            className={`h-20 border-b border-slate-200/50 ${
                              index % 2 === 0 ? 'bg-white/30' : 'bg-slate-100/30'
                            }`}
                          ></div>
                        ))}
                      </div>

                      {/* Test Events */}
                      <div className="relative z-10 h-full">
                        {hoursWithTests.map(hour => {
                          const testsInThisHour = dayTests.filter(test => 
                            shouldDisplayTestInHour(test, hour)
                          );
                          
                          return testsInThisHour.map((test, testIndex) => {
                            const position = calculateEventPosition(test, hour);
                            
                            return (
                              <Link
                                key={`${test._id}-${hour}`}
                                to={`/test/${test._id}`}
                                className={`absolute left-1.5 right-1.5 rounded-xl p-3 pb-10 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] ${getEventColor(test)} border border-white/20`}
                                style={position}
                                title={`${test.title} - ${format(new Date(test.scheduleDate), 'h:mm a')} - ${test.duration}min`}
                              >
                                <div className="font-semibold text-xs mb-1.5 truncate">
                                  {test.title}
                                </div>
                                <div className="text-xs opacity-90 mb-1.5 flex items-center">
                                  <span className="w-2 h-2 bg-white/60 rounded-full mr-2"></span>
                                  {format(new Date(test.scheduleDate), 'h:mm a')}
                                </div>
                                <div className="text-xs opacity-80 truncate flex items-center">
                                  <span className="w-2 h-2 bg-white/40 rounded-full mr-2"></span>
                                  {test.subjects.join(', ')}
                                </div>
                              </Link>
                            );
                          });
                        })}
                      </div>

                      {/* No tests message for the day */}
                      {dayTests.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center text-slate-300/80 p-4">
                            <div className="text-2xl mb-2 opacity-60">📚</div>
                            <p className="text-sm font-medium">No tests scheduled</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .calendar-week-view {
          min-height: 500px;
          overflow: auto;
        }
        
        .calendar-week-view .grid.grid-cols-8 {
          min-width: 900px;
        }
        
        /* Custom scrollbar for week view */
        .calendar-week-view::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .calendar-week-view::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }
        
        .calendar-week-view::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        .calendar-week-view::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}

export default CalendarView;


























