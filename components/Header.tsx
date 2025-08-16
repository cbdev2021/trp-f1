import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
import Link from 'next/link'

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Trip F1 - Planificador de Viajes
        </Typography>
        <Box>
          <Button color="inherit" component={Link} href="/">
            Planificador
          </Button>
          <Button color="inherit" component={Link} href="/diagrama">
            Diagrama de Flujo
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}