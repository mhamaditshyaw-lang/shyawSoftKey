import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { authenticatedRequest } from '@/lib/auth';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminUsersEnhancedPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
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
          background: 'linear-gradient(195deg, #f8f9fa 0%, #e9ecef 100%)',
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

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const statusColors = {
    active: '#4caf50',
    inactive: '#f44336',
    pending: '#ff9800',
  };

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
              User Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              Manage users, roles, and permissions
            </Typography>
          </Box>
        </Container>

        <Container maxWidth="xl" sx={{ mb: 4 }}>
          {/* User Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4, mt: -8 }}>
            <Grid item xs={12} sm={6} md={3}>
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
                        <Box component="span" sx={{ color: '#4caf50', fontWeight: 600 }}>+{users.filter(u => u.status === 'active').length}</Box> active
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
                      <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
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
                        Admins
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5 }}>
                        {users.filter(u => u.role === 'admin').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Administrator accounts
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
                      <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
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
                        Managers
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5 }}>
                        {users.filter(u => u.role === 'manager').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Management accounts
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
                      <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
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
                        Staff
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 300, mb: 0.5 }}>
                        {users.filter(u => u.role === 'secretary').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Staff accounts
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
                      <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Users Management */}
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
                    justifyContent: 'space-between',
                    px: 3,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(66,66,74,0.4)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ color: 'white', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 400 }}>
                      Users Management
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddUserOpen(true)}
                    sx={{
                      background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)',
                      '&:hover': {
                        background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
                      }
                    }}
                  >
                    Add User
                  </Button>
                </Box>

                <CardContent sx={{ mt: 6, pt: 4 }}>
                  {/* Filters */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: '#67748e' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: 'rgba(52, 71, 103, 0.2)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(52, 71, 103, 0.3)',
                            },
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={roleFilter}
                          label="Role"
                          onChange={(e) => setRoleFilter(e.target.value)}
                          sx={{
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(52, 71, 103, 0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(52, 71, 103, 0.3)',
                            },
                          }}
                        >
                          <MenuItem value="all">All Roles</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="manager">Manager</MenuItem>
                          <MenuItem value="secretary">Secretary</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status"
                          onChange={(e) => setStatusFilter(e.target.value)}
                          sx={{
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(52, 71, 103, 0.2)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(52, 71, 103, 0.3)',
                            },
                          }}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* Users Grid */}
                  <Grid container spacing={3}>
                    {filteredUsers.map((userData) => (
                      <Grid item xs={12} sm={6} lg={4} key={userData.id}>
                        <Card
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            border: '1px solid rgba(52, 71, 103, 0.1)',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Avatar
                              sx={{
                                width: 48,
                                height: 48,
                                background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
                                fontSize: '1rem',
                                fontWeight: 600,
                              }}
                            >
                              {`${userData.firstName || userData.username}`.charAt(0).toUpperCase()}
                            </Avatar>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, userData)}
                              sx={{ color: '#67748e' }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#344767', mb: 0.5 }}>
                            {`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username}
                          </Typography>
                          
                          <Typography variant="body2" sx={{ color: '#67748e', mb: 2 }}>
                            {userData.email}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={userData.role}
                              size="small"
                              sx={{
                                textTransform: 'capitalize',
                                borderRadius: 1.5,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                ...(userData.role === 'admin' && {
                                  backgroundColor: '#1976d2',
                                  color: 'white',
                                }),
                                ...(userData.role === 'manager' && {
                                  backgroundColor: '#fb8c00',
                                  color: 'white',
                                }),
                                ...(userData.role === 'secretary' && {
                                  backgroundColor: '#e91e63',
                                  color: 'white',
                                }),
                              }}
                            />
                            <Chip
                              label={userData.status}
                              size="small"
                              sx={{
                                backgroundColor: statusColors[userData.status as keyof typeof statusColors],
                                color: 'white',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                fontSize: '0.75rem',
                                borderRadius: 1.5,
                              }}
                            />
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(0,0,0,0.1)',
            borderRadius: 2,
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon sx={{ mr: 1, fontSize: 18, color: '#344767' }} />
          Edit User
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18, color: '#f44336' }} />
          Delete User
        </MenuItem>
      </Menu>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onClose={() => setAddUserOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Typography>Add user functionality would be implemented here.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserOpen(false)}>Cancel</Button>
          <Button variant="contained">Add User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}