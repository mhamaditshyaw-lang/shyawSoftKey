import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { authenticatedRequest } from '@/lib/auth';
import CustomAdminNavbar from '@/components/admin/CustomAdminNavbar';
import CustomAdminSidebar from '@/components/admin/CustomAdminSidebar';
import '@/components/admin/AdminStyles.css';

export default function CustomAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch dashboard data
  const { data: usersData } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await authenticatedRequest('GET', '/api/users');
      return await response.json();
    },
    enabled: isAdmin,
  });

  const { data: todosData } = useQuery({
    queryKey: ['/api/todos'],
    queryFn: async () => {
      const response = await authenticatedRequest('GET', '/api/todos');
      return await response.json();
    },
    enabled: isAdmin,
  });

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="admin-layout">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          textAlign: 'center'
        }}>
          <div className="admin-card">
            <h2>Access Denied</h2>
            <p>You need administrator privileges to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const users = usersData?.users || [];
  const todos = todosData?.todoLists || [];

  const completedTasks = todos.reduce((acc, list) => {
    return acc + (list.items?.filter(item => item.completed).length || 0);
  }, 0);

  const totalTasks = todos.reduce((acc, list) => {
    return acc + (list.items?.length || 0);
  }, 0);

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      change: '+12%',
      positive: true,
      icon: '👥'
    },
    {
      title: 'Active Tasks',
      value: totalTasks,
      change: '+8%',
      positive: true,
      icon: '✅'
    },
    {
      title: 'Completed',
      value: completedTasks,
      change: '-3%',
      positive: false,
      icon: '🎯'
    },
    {
      title: 'Revenue',
      value: '$24.5K',
      change: '+15%',
      positive: true,
      icon: '💰'
    }
  ];

  return (
    <div className="admin-layout">
      <CustomAdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <CustomAdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="admin-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening in your business today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4" style={{ marginBottom: '30px' }}>
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontSize: '24px' }}>{stat.icon}</span>
                <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="stat-number">{stat.value}</div>
              <div className="stat-label">{stat.title}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2" style={{ marginBottom: '30px' }}>
          <div className="admin-card">
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>📈 Growth Analytics</h3>
            <div style={{ 
              height: '300px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px'
            }}>
              Chart Placeholder - Growth Over Time
            </div>
          </div>
          
          <div className="admin-card">
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>🔍 User Distribution</h3>
            <div style={{ 
              height: '300px', 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px'
            }}>
              Chart Placeholder - User Types
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="admin-card">
          <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>📋 Recent Activity</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>User</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Action</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user, index) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {(user.firstName || user.username)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {user.firstName ? `${user.firstName} ${user.lastName}` : user.username}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>Updated profile</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: user.status === 'active' ? '#e8f5e8' : '#fff3cd',
                        color: user.status === 'active' ? '#2e7d32' : '#856404'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#666' }}>2 hours ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}