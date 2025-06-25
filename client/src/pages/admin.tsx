import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Toolbar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Assignment as TasksIcon,
  People as PeopleIcon,
  AttachMoney as RevenueIcon,
  TrendingUp as GrowthIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { authenticatedRequest } from '@/lib/auth';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import SummaryCard from '@/components/admin/SummaryCard';
import AdminChart from '@/components/admin/AdminChart';
import AdminDataTable from '@/components/admin/AdminDataTable';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(195deg, #f0f2f5 0%, #e3f2fd 100%)',
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <h2>Access Denied</h2>
            <p>You need administrator privileges to access this page.</p>
          </Box>
        </Container>
      </Box>
    );
  }

  const users = usersData?.users || [];
  const todos = todosData?.todoLists || [];

  // Prepare chart data
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Users',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Tasks',
        data: [8, 15, 12, 20, 18, 25],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ['Admin', 'Manager', 'Secretary'],
    datasets: [
      {
        label: 'Users by Role',
        data: [
          users.filter(u => u.role === 'admin').length,
          users.filter(u => u.role === 'manager').length,
          users.filter(u => u.role === 'secretary').length,
        ],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
      },
    ],
  };

  // Prepare table data
  const tableData = users.map(user => ({
    id: user.id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
    email: user.email,
    role: user.role,
    status: user.status as 'active' | 'inactive' | 'pending',
    joinDate: new Date(user.createdAt || Date.now()).toLocaleDateString(),
  }));

  const completedTasks = todos.reduce((acc, list) => {
    return acc + (list.items?.filter(item => item.completed).length || 0);
  }, 0);

  const totalTasks = todos.reduce((acc, list) => {
    return acc + (list.items?.length || 0);
  }, 0);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(195deg, #f0f2f5 0%, #e3f2fd 100%)',
      }}
    >
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Total Users"
                value={users.length}
                icon={<PeopleIcon />}
                color="#4caf50"
                subtitle="Active employees"
                trend={{ value: "12%", isPositive: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Total Tasks"
                value={totalTasks}
                icon={<TasksIcon />}
                color="#2196f3"
                subtitle="Across all lists"
                trend={{ value: "8%", isPositive: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Completed"
                value={completedTasks}
                icon={<GrowthIcon />}
                color="#ff9800"
                subtitle="Tasks completed"
                trend={{ value: "5%", isPositive: false }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Revenue"
                value="$24,500"
                icon={<RevenueIcon />}
                color="#9c27b0"
                subtitle="This month"
                trend={{ value: "15%", isPositive: true }}
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <AdminChart
                title="Growth Overview"
                type="line"
                data={chartData}
                height={350}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <AdminChart
                title="Users by Role"
                type="bar"
                data={barChartData}
                height={350}
              />
            </Grid>
          </Grid>

          {/* Data Table */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <AdminDataTable
                title="Recent Users"
                data={tableData.slice(0, 10)}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}