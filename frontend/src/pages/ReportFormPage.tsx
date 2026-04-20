import { useState } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, Grid, MenuItem
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import api from '../api/axios'

const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'Northeast']

const currentYear = new Date().getFullYear()
const yearMonths = [-1, 0, 1].flatMap(y =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date(currentYear + y, i, 1)
    return d.toISOString().slice(0, 7)
  })
).sort()

export default function ReportFormPage() {
  const [form, setForm] = useState({
    ngo_id: '',
    month: '',
    people_helped: '',
    events_conducted: '',
    funds_utilized: '',
    region: '',
  })
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const mutation = useMutation({
    mutationFn: () => api.post('/report', form),
    onSuccess: () => {
      setSuccess(true)
      setForm({ ngo_id: '', month: '', people_helped: '', events_conducted: '', funds_utilized: '', region: '' })
    },
  })

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', mt: 5, px: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Submit Monthly Report</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Enter the impact data for your NGO for the selected month.
      </Typography>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
              Report submitted successfully.
            </Alert>
          )}
          {mutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {(mutation.error as any)?.response?.data?.message || 'Submission failed'}
            </Alert>
          )}

          <form onSubmit={e => { e.preventDefault(); setSuccess(false); mutation.mutate() }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="NGO ID"
                  name="ngo_id"
                  value={form.ngo_id}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                  placeholder="e.g. NGO-001"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Month"
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                >
                  {yearMonths.map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="People Helped"
                  name="people_helped"
                  type="number"
                  value={form.people_helped}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Events Conducted"
                  name="events_conducted"
                  type="number"
                  value={form.events_conducted}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Funds Utilized (₹)"
                  name="funds_utilized"
                  type="number"
                  value={form.funds_utilized}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, step: '0.01' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Region"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">-- Select Region --</MenuItem>
                  {REGIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  disabled={mutation.isPending}
                  fullWidth
                >
                  {mutation.isPending ? 'Submitting...' : 'Submit Report'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
