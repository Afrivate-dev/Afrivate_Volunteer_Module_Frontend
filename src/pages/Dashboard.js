import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Dashboard = () => {
  const { user, loading, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Expired</h2>
          <p className="text-gray-600 mb-8">Please log in again to continue.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'in progress':
        return 'text-orange-600';
      case 'review':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Profile Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6b21a8&color=fff`}
                  alt={user.name}
                  className="w-16 h-16 rounded-full"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  Welcome Back, <span className="text-purple-600">{user.name}</span>
                </h1>
                <p className="text-gray-600">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="relative w-32 h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute left-0 top-0 h-full bg-purple-600 rounded-full"
                    style={{ width: `${user.profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Profile Completion</p>
                <p className="font-semibold">{user.profileCompletion}%</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-purple-600 text-lg font-semibold">{user.profileViews}</span>
                </div>
                <p className="text-sm text-gray-600">Profile Views</p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Earning this Month</h2>
              <button className="text-purple-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p className="text-3xl font-bold text-purple-900">${user.earningsThisMonth}</p>
          </div>

          {/* Active Projects */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Active Projects</h2>
              <span className="text-purple-600">View All</span>
            </div>

            <div className="space-y-4">
              {user.activeProjects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-lg">🎯</span>
                    </div>
                    <div>
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-600">{project.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </p>
                    <p className="text-sm text-gray-600">{new Date(project.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Earnings */}
          <div>
            <h2 className="text-lg font-semibold mb-6">Recent Earnings</h2>
            <div className="space-y-4">
              {user.recentEarnings.map(earning => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{earning.project}</h3>
                    <p className="text-sm text-gray-600">{new Date(earning.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold text-purple-900">${earning.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 