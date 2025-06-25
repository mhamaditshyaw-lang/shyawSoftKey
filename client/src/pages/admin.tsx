import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Toolbar,
  useTheme,
  useMediaQuery,
  Typography,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import {
  Assignment as TasksIcon,
  People as PeopleIcon,
  AttachMoney as RevenueIcon,
  TrendingUp as GrowthIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
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
        background: 'linear-gradient(195deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
          borderRadius: '0 0 12px 12px',
          zIndex: 0,
        }
      }}
    >
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box component="main" sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
        <Toolbar />
        
        {/* Hero Header */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 2 }}>
          <Box sx={{ color: 'white', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 300, mb: 1 }}>
              Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Welcome back! Here's what's happening with your business today.
            </Typography>
          </Box>
        </Container>

        <Container maxWidth="xl" sx={{ mb: 4 }}>
          {/* Summary Cards with Material Design elevation */}
          <Grid container spacing={3} sx={{ mb: 4, mt: -8 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(66,66,74,0.4)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                        Total Users
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5 }}>
                        {users.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        <Box component="span" sx={{ color: '#4caf50', fontWeight: 600 }}>+12%</Box> from last month
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)',
                        position: 'absolute',
                        top: -20,
                        right: 20,
                      }}
                    >
                      <PeopleIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(66,66,74,0.4)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                        Total Tasks
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5 }}>
                        {totalTasks}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        <Box component="span" sx={{ color: '#4caf50', fontWeight: 600 }}>+8%</Box> from last week
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(195deg, #1976d2 0%, #1565c0 100%)',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(25,118,210,0.4)',
                        position: 'absolute',
                        top: -20,
                        right: 20,
                      }}
                    >
                      <TasksIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(66,66,74,0.4)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                        Completed
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5 }}>
                        {completedTasks}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        <Box component="span" sx={{ color: '#f44336', fontWeight: 600 }}>-5%</Box> from yesterday
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(195deg, #fb8c00 0%, #f57c00 100%)',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(251,140,0,0.4)',
                        position: 'absolute',
                        top: -20,
                        right: 20,
                      }}
                    >
                      <GrowthIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)',
                  color: 'white',
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(66,66,74,0.4)',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8, mb: 1, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                        Revenue
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5 }}>
                        $24,500
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        <Box component="span" sx={{ color: '#4caf50', fontWeight: 600 }}>+15%</Box> from last month
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        background: 'linear-gradient(195deg, #e91e63 0%, #ad1457 100%)',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(233,30,99,0.4)',
                        position: 'absolute',
                        top: -20,
                        right: 20,
                      }}
                    >
                      <RevenueIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={8}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,1) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(0,0,0,0.1)',
                  overflow: 'visible',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: 20,
                    right: 20,
                    height: 60,
                    background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)',
                  }}
                >
                  <TimelineIcon sx={{ color: 'white', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 400 }}>
                    Growth Overview
                  </Typography>
                </Box>
                <CardContent sx={{ mt: 6, pt: 4 }}>
                  <AdminChart
                    title=""
                    type="line"
                    data={chartData}
                    height={350}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,1) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(0,0,0,0.1)',
                  overflow: 'visible',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: 20,
                    right: 20,
                    height: 60,
                    background: 'linear-gradient(195deg, #1976d2 0%, #1565c0 100%)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(25,118,210,0.4)',
                  }}
                >
                  <AnalyticsIcon sx={{ color: 'white', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 400 }}>
                    Users by Role
                  </Typography>
                </Box>
                <CardContent sx={{ mt: 6, pt: 4 }}>
                  <AdminChart
                    title=""
                    type="bar"
                    data={barChartData}
                    height={350}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Data Table Section */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,1) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(0,0,0,0.1)',
                  overflow: 'visible',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: 20,
                    right: 20,
                    height: 60,
                    background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(66,66,74,0.4)',
                  }}
                >
                  <PeopleIcon sx={{ color: 'white', mr: 1 }} />
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 400 }}>
                    Recent Users
                  </Typography>
                </Box>
                <CardContent sx={{ mt: 6, pt: 4, p: 0 }}>
                  <AdminDataTable
                    title=""
                    data={tableData.slice(0, 10)}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}