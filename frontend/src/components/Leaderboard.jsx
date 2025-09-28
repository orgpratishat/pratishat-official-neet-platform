import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function Leaderboard() {
  const { testId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [test, setTest] = useState(null);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchTestDetails();
  }, [testId]);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/leaderboard?testId=${testId}`);
      setLeaderboard(response.data.data);
      console.log(response.data.data)
      
      // Find current user's rank
      const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/performance`);
      const userPerformance = userResponse.data.data.find(p => p.test?._id === testId);
      
      if (userPerformance) {
        const rank = response.data.data.findIndex(entry => 
          entry.user === userResponse.data?.user?.name
        );
        setUserRank(rank +1);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };
  

  const fetchTestDetails = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/${testId}`);
      setTest(response.data.data);
    } catch (error) {
      console.error('Error fetching test details:', error);
    }
  };

  if (!test) {
    return <div className="flex justify-center items-center h-screen">Loading leaderboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title} - Leaderboard</h1>
          <p className="text-gray-600 mb-6">
            Weekly Test Performance Rankings
          </p>

          {userRank && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-indigo-800 mb-2">Your Ranking</h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Rank #{userRank}</span>
                <span className="text-indigo-600">
                  {leaderboard[userRank - 1]?.score || 0}% • 
                  {Math.floor((leaderboard[userRank - 1]?.timeTaken || 0) / 60)}m
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  index === 0 ? 'bg-yellow-50 border-yellow-200' :
                  index === 1 ? 'bg-gray-50 border-gray-200' :
                  index === 2 ? 'bg-orange-50 border-orange-200' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-400 text-gray-900' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-gray-300 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold">{entry.user}</div>
                    <div className="text-sm text-gray-600">
                      Time: {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">{entry.score}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No submissions yet for this test.</p>
              <p className="text-gray-500">Be the first to take the test!</p>
            </div>
          )}

          <div className="mt-6 flex justify-center space-x-4">
            <Link
              to={`/report/${testId}`}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            >
              View My Report
            </Link>
            <Link
              to="/dashboard"
              className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Ranking Colors</h3>
          <div className="flex space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
              <span>1st Place</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-400 rounded-full mr-2"></div>
              <span>2nd Place</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 rounded-full mr-2"></div>
              <span>3rd Place</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
              <span>Other Ranks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;