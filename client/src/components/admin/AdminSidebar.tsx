import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  BusinessCenter as BusinessIcon,
} from '@mui/icons-material';
import { useLocation } from 'wouter';

const drawerWidth = 280;

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const [location, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    setLocation(path);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(195deg, #ffffff 0%, #ffffff 40%, rgba(255,255,255,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          border: 'none',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(0,0,0,0.1)',
          color: '#344767',
        },
      }}
    >
      <Box sx={{ p: 3, pt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)',
            }}
          >
            <BusinessIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#344767' }}>
            Material Dashboard
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(52, 71, 103, 0.12)', mb: 2 }} />
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location === item.path || (item.path !== '/admin' && location.startsWith(item.path));
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  color: '#344767',
                  minHeight: 48,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(52, 71, 103, 0.1)',
                  },
                  ...(isActive && {
                    background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
                    color: 'white',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)',
                    '&:hover': {
                      background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.14), 0 7px 10px -5px rgba(76,175,80,0.4)',
                    },
                  }),
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? 'white' : '#344767',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.875rem',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}