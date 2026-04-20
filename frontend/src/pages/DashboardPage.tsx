import { useState } from 'react'
import { Box, Typography, Grid, TextField, MenuItem, CircularProgress, Alert, InputAdornment } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import EventIcon from '@mui/icons-material/Event'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ApartmentIcon from '@mui/icons-material/Apartment'
import SearchIcon from '@mui/icons-material/Search'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import StatCard from '../components/StatCard'
import { DashboardData } from '../types'

const currentYear = new Date().getFullYear()
const availableMonths = [-1, 0].flatMap(y =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date(currentYear + y, i, 1)
    return d.toISOString().slice(0, 7)
  })
).sort().reverse()

export default function DashboardPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [region, setRegion] = useState('')
  const [ngoId, setNgoId] = useState('')
  const [ngoSearch, setNgoSearch] = useState('')

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard', month, region, ngoId],
    queryFn: async () => {
      const params: Record<string, string> = { month }
      if (region) params.region = region
      if (ngoId) params.ngo_id = ngoId
      const res = await api.get('/dashboard', { params })
      return res.data
    },
  })

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', mt: 5, px: 2 }}>
      <Box sx={{
        mb: 4, p: 3, borderRadius: 3,
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        color: 'white'
      }}>
        <Typography variant="h5" fontWeight={700}>Admin Dashboard</Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>Monthly impact summary across all NGOs</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {availableMonths.map(m => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          value={region}
          onChange={e => setRegion(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="">All Regions</MenuItem>
          {(data?.available_regions || []).filter(r => r && r.trim()).map(r => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Search NGO ID"
          value={ngoSearch}
          onChange={e => setNgoSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') setNgoId(ngoSearch) }}
          onBlur={() => setNgoId(ngoSearch)}
          size="small"
          sx={{ minWidth: 180 }}
          placeholder="e.g. NGO-001"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
          }}
        />
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">Failed to load dashboard data. Please try again.</Alert>
      )}

      {data && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="NGOs Reporting"
              value={Number(data.total_ngos).toLocaleString()}
              icon={<ApartmentIcon />}
              color="#2563eb"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="People Helped"
              value={Number(data.total_people_helped).toLocaleString()}
              icon={<PeopleIcon />}
              color="#7c3aed"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Events Conducted"
              value={Number(data.total_events).toLocaleString()}
              icon={<EventIcon />}
              color="#059669"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              label="Funds Utilized (₹)"
              value={`₹${Number(data.total_funds).toLocaleString()}`}
              icon={<AccountBalanceWalletIcon />}
              color="#d97706"
            />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
