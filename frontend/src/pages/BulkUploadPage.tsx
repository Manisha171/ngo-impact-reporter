import { useState, useRef } from 'react'
import {
  Box, Card, CardContent, Button, Typography, Alert,
  LinearProgress, Chip, List, ListItem, ListItemText
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import api from '../api/axios'
import { JobStatus } from '../types'

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState<JobStatus | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setError('')
    setJob(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/reports/upload', formData)
      const id = res.data.job_id
      setJobId(id)
      startPolling(id)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function startPolling(id: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/job-status/${id}`)
        setJob(res.data)
        if (res.data.status === 'done') {
          clearInterval(pollRef.current!)
        }
      } catch {
        clearInterval(pollRef.current!)
      }
    }, 1500)
  }

  const progress = job && job.total > 0 ? Math.round(((job.processed + job.failed) / job.total) * 100) : 0

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', mt: 5, px: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Bulk Report Upload</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Upload a CSV with columns: ngo_id, month, people_helped, events_conducted, funds_utilized
      </Typography>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box
            onClick={() => inputRef.current?.click()}
            sx={{
              border: '2px dashed #cbd5e1',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              mb: 3,
              '&:hover': { borderColor: 'primary.main', bgcolor: '#f0f7ff' },
              transition: 'all 0.2s',
            }}
          >
            <UploadFileIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {file ? file.name : 'Click to select a CSV file'}
            </Typography>
            <input ref={inputRef} type="file" accept=".csv" hidden onChange={handleFile} />
          </Box>

          <Button
            variant="contained"
            disableElevation
            fullWidth
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </Button>
        </CardContent>
      </Card>

      {job && (
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>Job Progress</Typography>
              <Chip
                label={job.status}
                size="small"
                color={job.status === 'done' ? 'success' : 'primary'}
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" mb={1}>
              Processed {job.processed + job.failed} of {job.total} rows
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
              color={job.failed > 0 ? 'warning' : 'primary'}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="success.main">✓ {job.processed} succeeded</Typography>
              <Typography variant="body2" color="error.main">✗ {job.failed} failed</Typography>
            </Box>

            {job.errors.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" fontWeight={600} mb={1}>Failed rows:</Typography>
                <List dense disablePadding>
                  {job.errors.map((e, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemText
                        primary={`Row ${e.row}: ${e.reason}`}
                        primaryTypographyProps={{ variant: 'body2', color: 'error' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
