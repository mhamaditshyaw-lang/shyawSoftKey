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
          background: 'linear-gradient(195deg, #42424a 0%, #191919 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessIcon sx={{ mr: 1, color: '#4caf50' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            Admin Portal
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      </Box>

      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                ...((location === item.path || (item.path !== '/admin' && location.startsWith(item.path))) && {
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.3)',
                  },
                }),
              }}
            >
              <ListItemIcon sx={{ color: (location === item.path || (item.path !== '/admin' && location.startsWith(item.path))) ? '#4caf50' : 'rgba(255,255,255,0.7)' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: (location === item.path || (item.path !== '/admin' && location.startsWith(item.path))) ? 600 : 400,
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}