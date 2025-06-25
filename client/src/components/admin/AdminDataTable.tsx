import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface TableData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
}

interface AdminDataTableProps {
  title: string;
  data: TableData[];
}

const statusColors = {
  active: '#4caf50',
  inactive: '#f44336',
  pending: '#ff9800',
};

export default function AdminDataTable({ title, data }: AdminDataTableProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rowId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      {title && (
        <CardHeader
          title={
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#344767' }}>
              {title}
            </Typography>
          }
        />
      )}
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(52, 71, 103, 0.03)' }}>
                <TableCell sx={{ fontWeight: 600, color: '#344767', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#344767', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#344767', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#344767', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Join Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#344767', fontSize: '0.75rem', textTransform: 'uppercase', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow 
                  key={row.id} 
                  hover 
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(52, 71, 103, 0.04)' 
                    },
                    borderBottom: index === paginatedData.length - 1 ? 'none' : '1px solid rgba(52, 71, 103, 0.1)'
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: 'linear-gradient(195deg, #66bb6a 0%, #43a047 100%)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                        }}
                      >
                        {row.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#344767', mb: 0.5 }}>
                          {row.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#67748e' }}>
                          {row.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize', color: '#344767', fontWeight: 500 }}>
                      {row.role}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        backgroundColor: statusColors[row.status],
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        fontSize: '0.75rem',
                        borderRadius: 1.5,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography variant="body2" sx={{ color: '#344767', fontWeight: 500 }}>
                      {row.joinDate}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, row.id)}
                      sx={{ 
                        color: '#67748e',
                        '&:hover': {
                          backgroundColor: 'rgba(52, 71, 103, 0.1)',
                        }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            borderTop: '1px solid rgba(52, 71, 103, 0.1)',
            color: '#344767',
            '& .MuiTablePagination-toolbar': {
              px: 3,
            }
          }}
        />

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
          <MenuItem 
            onClick={handleMenuClose}
            sx={{ 
              color: '#344767',
              '&:hover': {
                backgroundColor: 'rgba(52, 71, 103, 0.1)',
              }
            }}
          >
            <EditIcon sx={{ mr: 1, fontSize: 18 }} />
            Edit
          </MenuItem>
          <MenuItem 
            onClick={handleMenuClose}
            sx={{ 
              color: '#344767',
              '&:hover': {
                backgroundColor: 'rgba(52, 71, 103, 0.1)',
              }
            }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
            Delete
          </MenuItem>
        </Menu>
      </CardContent>
    </>
  );
}