import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import api from '../api/axios'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/admin', { username, password })
      localStorage.setItem('admin_token', res.data.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
      px: 2,
    }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            mb: 2,
          }}>
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 26 }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>Admin Login</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Sign in to access the dashboard
          </Typography>
        </Box>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Username"
                fullWidth
                size="small"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disableElevation
                disabled={loading}
                sx={{
                  py: 1.2,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' },
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
