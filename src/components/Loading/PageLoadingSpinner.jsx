import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

function PageLoadingSpinner({ caption, alert }) {
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems:'center',
      justifyContent: 'center',
      gap: 2,
      width: '100vw',
      height: '100vh'
    }}>
      <CircularProgress />
      <Typography>{caption}</Typography>
      <Typography> {alert}</Typography>
    </Box>
  )
}

export default PageLoadingSpinner