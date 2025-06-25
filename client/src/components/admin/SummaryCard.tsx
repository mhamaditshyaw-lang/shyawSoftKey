import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
} from '@mui/material';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function SummaryCard({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle,
  trend 
}: SummaryCardProps) {
  return (
    <Card
      sx={{
        background: 'linear-gradient(195deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 600, mb: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography
                variant="body2"
                sx={{
                  color: trend.isPositive ? '#4caf50' : '#f44336',
                  fontWeight: 600,
                  mt: 1,
                }}
              >
                {trend.isPositive ? '+' : ''}{trend.value}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: color,
              width: 56,
              height: 56,
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
              position: 'absolute',
              top: -20,
              right: 20,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}