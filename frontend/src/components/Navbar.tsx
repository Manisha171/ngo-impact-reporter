import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import BarChartIcon from '@mui/icons-material/BarChart'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = !!localStorage.getItem('admin_token')

  function logout() {
    localStorage.removeItem('admin_token')
    navigate('/admin/login')
  }

  const navBtn = (to: string, label: string) => (
    <Button
      component={Link}
      to={to}
      disableElevation
      variant={location.pathname === to ? 'contained' : 'text'}
      sx={{ color: location.pathname === to ? 'white' : '#475569', fontWeight: 500 }}
    >
      {label}
    </Button>
  )

  return (
    <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: 'white' }}>
      <Toolbar sx={{ gap: 1 }}>
        <BarChartIcon sx={{ color: 'primary.main', mr: 0.5 }} />
        <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ flexGrow: 1 }}>
          NGO Impact Reporter
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {navBtn('/', 'Submit Report')}
          {navBtn('/bulk', 'Bulk Upload')}
          {isAdmin ? (
            <>
              {navBtn('/dashboard', 'Dashboard')}
              <Button onClick={logout} sx={{ color: '#475569', fontWeight: 500 }}>Logout</Button>
            </>
          ) : (
            navBtn('/admin/login', 'Admin')
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
