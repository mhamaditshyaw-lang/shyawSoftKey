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
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as ThemeIcon,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/use-auth';
import AdminNavbar from '@/components/admin/AdminNavbar';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      taskReminders: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordExpiry: '90',
    },
    appearance: {
      darkMode: false,
      compactView: false,
    },
    system: {
      maintenanceMode: false,
      debugMode: false,
      autoBackup: true,
    },
  });

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

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

  const handleSwitchChange = (section: string, field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: event.target.checked,
      },
    }));
  };

  const handleTextChange = (section: string, field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: event.target.value,
      },
    }));
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Add save logic here
  };

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
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
            System Settings
          </Typography>

          <Grid container spacing={3}>
            {/* Notifications Settings */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                }}
              >
                <CardHeader
                  avatar={<NotificationsIcon sx={{ color: '#4caf50' }} />}
                  title="Notifications"
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onChange={handleSwitchChange('notifications', 'emailNotifications')}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.pushNotifications}
                        onChange={handleSwitchChange('notifications', 'pushNotifications')}
                      />
                    }
                    label="Push Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.taskReminders}
                        onChange={handleSwitchChange('notifications', 'taskReminders')}
                      />
                    }
                    label="Task Reminders"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Security Settings */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                }}
              >
                <CardHeader
                  avatar={<SecurityIcon sx={{ color: '#2196f3' }} />}
                  title="Security"
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.twoFactorAuth}
                        onChange={handleSwitchChange('security', 'twoFactorAuth')}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    value={settings.security.sessionTimeout}
                    onChange={handleTextChange('security', 'sessionTimeout')}
                    sx={{ mt: 2, mb: 2 }}
                    type="number"
                  />
                  <TextField
                    fullWidth
                    label="Password Expiry (days)"
                    value={settings.security.passwordExpiry}
                    onChange={handleTextChange('security', 'passwordExpiry')}
                    type="number"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Appearance Settings */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                }}
              >
                <CardHeader
                  avatar={<ThemeIcon sx={{ color: '#9c27b0' }} />}
                  title="Appearance"
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.appearance.darkMode}
                        onChange={handleSwitchChange('appearance', 'darkMode')}
                      />
                    }
                    label="Dark Mode"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.appearance.compactView}
                        onChange={handleSwitchChange('appearance', 'compactView')}
                      />
                    }
                    label="Compact View"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* System Settings */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  background: 'linear-gradient(195deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: 3,
                }}
              >
                <CardHeader
                  title="System"
                  titleTypographyProps={{ fontWeight: 600 }}
                />
                <CardContent>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Changes to system settings affect all users
                  </Alert>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.system.maintenanceMode}
                        onChange={handleSwitchChange('system', 'maintenanceMode')}
                      />
                    }
                    label="Maintenance Mode"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.system.debugMode}
                        onChange={handleSwitchChange('system', 'debugMode')}
                      />
                    }
                    label="Debug Mode"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.system.autoBackup}
                        onChange={handleSwitchChange('system', 'autoBackup')}
                      />
                    }
                    label="Auto Backup"
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  sx={{
                    background: 'linear-gradient(195deg, #4caf50 0%, #2e7d32 100%)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    px: 4,
                    py: 1.5,
                  }}
                >
                  Save Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}