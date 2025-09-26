import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format, startOfWeek, addDays } from 'date-fns';
import { useNavigate } from "react-router-dom";
function Dashboard() {

    const navigate = useNavigate();

  const { user, logout } = useAuth();
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [recentPerformance, setRecentPerformance] = useState([]);

  useEffect(() => {
    fetchUpcomingTests();
    fetchRecentPerformance();
  }, []);

  const fetchUpcomingTests = async () => {
    try {
      const response = await axios.get('/api/tests');
      setUpcomingTests(response.data.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchRecentPerformance = async () => {
    try {
      const response = await axios.get('/api/users/performance');
      setRecentPerformance(response.data.data.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const getWeekTests = () => {
    const start = startOfWeek(new Date());
    const weekDays = [];
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(start, i);
      const dayTests = upcomingTests.filter(test => 
        format(new Date(test.scheduleDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      weekDays.push({ date: day, tests: dayTests });
    }
    
    return weekDays;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Test Platform</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.name}</span>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-indigo-600 hover:text-indigo-500">
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Tests</h3>
            <p className="text-3xl font-bold text-indigo-600">{upcomingTests.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Tests Taken</h3>
            <p className="text-3xl font-bold text-indigo-600">{recentPerformance.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Average Score</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {recentPerformance.length > 0 
                ? Math.round(recentPerformance.reduce((acc, perf) => acc + perf.score, 0) / recentPerformance.length)
                : 0
              }%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* This Week's Schedule */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">This Week's Schedule</h2>
              <Link to="/calendar" className="text-indigo-600 hover:text-indigo-500">
                View Calendar
              </Link>
            </div>
            <div className="space-y-4">
              {getWeekTests().map((day, index) => (
                <div key={index} className="border-b pb-2">
                  <h3 className="font-medium text-gray-900">
                    {format(day.date, 'EEEE, MMM d')}
                  </h3>
                  {day.tests.length > 0 ? (
                    day.tests.map(test => (
                      <Link
                        key={test._id}
                        to={`/test/${test._id}`}
                        className="block mt-2 p-3 bg-gray-50 rounded hover:bg-gray-100"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{test.title}</span>
                          <span className="text-sm text-gray-500">{test.duration} min</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {test.subjects.join(', ')} • {test.type}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm mt-2">No tests scheduled</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Performance */}
          

            <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Performance</h2>
      <div className="space-y-3">
        {recentPerformance.map((perf, index) => (
          <div
            key={index}
            onClick={() => navigate(`/test-report/${perf.test._id}`)}// 👈 use ID here
            className="flex justify-between items-center p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition"
          >
            <div>
              <div className="font-medium">{perf.test?.title}</div>
              <div className="text-sm text-gray-600">
                {format(new Date(perf.dateTaken), "MMM d, yyyy")}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-indigo-600">{perf.score}%</div>
              <div className="text-sm text-gray-600">
                {Math.floor(perf.timeTaken / 60)} min
              </div>
            </div>
          </div>
        ))}
        {recentPerformance.length === 0 && (
          <p className="text-gray-500 text-center py-4">No tests taken yet</p>
        )}
      </div>
    </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;