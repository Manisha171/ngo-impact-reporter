import { Card, CardContent, Typography, Box } from '@mui/material'
import { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  icon: ReactNode
  color: string
}

export default function StatCard({ label, value, icon, color }: Props) {
  return (
    <Card elevation={0} sx={{
      border: '1px solid #e2e8f0',
      borderRadius: 3,
      transition: 'box-shadow 0.2s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>{label}</Typography>
            <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: color,
            p: 1.5,
            borderRadius: 2,
            color: 'white',
            opacity: 0.9,
            flexShrink: 0
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
