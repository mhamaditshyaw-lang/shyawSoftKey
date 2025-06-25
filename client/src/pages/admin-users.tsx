import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Toolbar,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { authenticatedRequest } from '@/lib/auth';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminDataTable from '@/components/admin/AdminDataTable';

export default function AdminUsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Fetch users data
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await authenticatedRequest('GET', '/api/users');
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
            <Typography variant="h4" gutterBottom>Access Denied</Typography>
            <Typography>You need administrator privileges to access this page.</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const users = usersData?.users || [];

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare table data
  const tableData = filteredUsers.map(user => ({
    id: user.id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
    email: user.email,
    role: user.role,
    status: user.status as 'active' | 'inactive' | 'pending',
    joinDate: new Date(user.createdAt || Date.now()).toLocaleDateString(),
  }));

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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                  mb: 3,
                }}
              >
                <CardHeader
                  title={
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      User Management
                    </Typography>
                  }
                  action={
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      sx={{
                        background: 'linear-gradient(195deg, #4caf50 0%, #2e7d32 100%)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Add User
                    </Button>
                  }
                />
                <CardContent>
                  <TextField
                    fullWidth
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <AdminDataTable
                title={`Users (${tableData.length})`}
                data={tableData}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}