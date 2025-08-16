'use client'
import { useState } from 'react'
import {
  Stepper, Step, StepLabel, StepContent, Button, Box, Typography,
  FormControl, InputLabel, Select, MenuItem, Chip, TextField,
  FormGroup, FormControlLabel, Checkbox, Card, CardContent,
  Grid, Paper, Divider
} from '@mui/material'
import {
  Person, Schedule, Favorite, Settings, Interests, Route, Map
} from '@mui/icons-material'

const steps = [
  { label: 'Datos Básicos', icon: <Person /> },
  { label: 'Preferencias', icon: <Favorite /> },
  { label: 'Contexto', icon: <Settings /> },
  { label: 'Intereses', icon: <Interests /> },
  { label: 'Generar Ruta', icon: <Route /> },
  { label: 'Resultado', icon: <Map /> }
]

const perfilViajero = ['Solo', 'Pareja', 'Familia', 'Adulto mayor', 'Grupo amigos']
const presupuesto = ['Económico', 'Medio', 'Alto', 'Elite']

const motivosViaje = [
  'Naturaleza', 'Cultura', 'Historia', 'Gastronomía', 'Vida nocturna',
  'Bohemio', 'Aventura', 'Relax', 'Compras', 'Deportes', 'Fotografía',
  'Arquitectura', 'Música', 'Arte', 'Espiritualidad', 'Educativo'
]

const restricciones = [
  'Movilidad reducida', 'Niños pequeños', 'Alergias alimentarias',
  'Vegetariano/Vegano', 'Sin alcohol', 'Acceso silla ruedas',
  'Mascotas', 'Diabetes', 'Problemas cardíacos', 'Claustrofobia'
]

const transportes = [
  'A pie', 'Bicicleta', 'Transporte público', 'Vehículo propio',
  'Taxi/Uber', 'Scooter', 'Patineta', 'Combinado'
]

const interesesDetallados = [
  'Música en vivo', 'Librerías', 'Arte urbano', 'Mercados', 'Cafés',
  'Museos', 'Galerías', 'Parques', 'Miradores', 'Centros comerciales',
  'Bares', 'Discotecas', 'Teatros', 'Cines', 'Festivales',
  'Talleres', 'Tours guiados', 'Actividades deportivas'
]

export default function TripPlannerFlow() {
  const [activeStep, setActiveStep] = useState(0)
  // const [formData, setFormData] = useState({
  //   perfil: '',
  //   presupuesto: '',
  //   horaInicio: '10:00',
  //   horaFin: '20:00',
  //   motivos: [],
  //   restricciones: [],
  //   transporte: '',
  //   intereses: []
  // })

  const [formData, setFormData] = useState<{
  perfil: string;
  presupuesto: string;
  horaInicio: string;
  horaFin: string;
  motivos: string[];
  restricciones: string[];
  transporte: string;
  intereses: string[];
}>({
  perfil: '',
  presupuesto: '',
  horaInicio: '10:00',
  horaFin: '20:00',
  motivos: [],
  restricciones: [],
  transporte: '',
  intereses: []
});

  const handleNext = () => setActiveStep(prev => prev + 1)
  const handleBack = () => setActiveStep(prev => prev - 1)

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Planificador de Viaje
      </Typography>
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {/* PASO A: Datos Básicos */}
        <Step>
          <StepLabel icon={steps[0].icon}>
            {steps[0].label}
          </StepLabel>
          <StepContent>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Perfil de Viajero</InputLabel>
                      <Select
                        value={formData.perfil}
                        onChange={(e) => updateFormData('perfil', e.target.value)}
                      >
                        {perfilViajero.map(p => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Presupuesto</InputLabel>
                      <Select
                        value={formData.presupuesto}
                        onChange={(e) => updateFormData('presupuesto', e.target.value)}
                      >
                        {presupuesto.map(p => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Hora Inicio"
                      value={formData.horaInicio}
                      onChange={(e) => updateFormData('horaInicio', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Hora Fin"
                      value={formData.horaFin}
                      onChange={(e) => updateFormData('horaFin', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleNext}>
                Continuar
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* PASO B: Preferencias */}
        <Step>
          <StepLabel icon={steps[1].icon}>
            {steps[1].label}
          </StepLabel>
          <StepContent>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Motivos del Viaje
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {motivosViaje.map(motivo => (
                    <Chip
                      key={motivo}
                      label={motivo}
                      clickable
                      color={formData.motivos.includes(motivo) ? 'primary' : 'default'}
                      onClick={() => {
                        const newMotivos = formData.motivos.includes(motivo)
                          ? formData.motivos.filter(m => m !== motivo)
                          : [...formData.motivos, motivo]
                        updateFormData('motivos', newMotivos)
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Atrás
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Continuar
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* PASO C: Contexto */}
        <Step>
          <StepLabel icon={steps[2].icon}>
            {steps[2].label}
          </StepLabel>
          <StepContent>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Restricciones y Necesidades
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {restricciones.map(restriccion => (
                    <Chip
                      key={restriccion}
                      label={restriccion}
                      clickable
                      color={formData.restricciones.includes(restriccion) ? 'secondary' : 'default'}
                      onClick={() => {
                        const newRestricciones = formData.restricciones.includes(restriccion)
                          ? formData.restricciones.filter(r => r !== restriccion)
                          : [...formData.restricciones, restriccion]
                        updateFormData('restricciones', newRestricciones)
                      }}
                    />
                  ))}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <FormControl fullWidth>
                  <InputLabel>Transporte Preferido</InputLabel>
                  <Select
                    value={formData.transporte}
                    onChange={(e) => updateFormData('transporte', e.target.value)}
                  >
                    {transportes.map(t => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Atrás
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Continuar
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* PASO D: Intereses */}
        <Step>
          <StepLabel icon={steps[3].icon}>
            {steps[3].label}
          </StepLabel>
          <StepContent>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Intereses Específicos
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {interesesDetallados.map(interes => (
                    <Chip
                      key={interes}
                      label={interes}
                      clickable
                      color={formData.intereses.includes(interes) ? 'primary' : 'default'}
                      onClick={() => {
                        const newIntereses = formData.intereses.includes(interes)
                          ? formData.intereses.filter(i => i !== interes)
                          : [...formData.intereses, interes]
                        updateFormData('intereses', newIntereses)
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Atrás
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Generar Ruta
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* PASO E: Generar Ruta */}
        <Step>
          <StepLabel icon={steps[4].icon}>
            {steps[4].label}
          </StepLabel>
          <StepContent>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Generando tu ruta personalizada...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Analizando tus preferencias y optimizando la ruta según horarios, distancias y clima.
                </Typography>
              </CardContent>
            </Card>
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Atrás
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Ver Resultado
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* PASO F: Resultado */}
        <Step>
          <StepLabel icon={steps[5].icon}>
            {steps[5].label}
          </StepLabel>
          <StepContent>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tu Ruta Personalizada
                </Typography>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1">Resumen:</Typography>
                  <Typography>Perfil: {formData.perfil}</Typography>
                  <Typography>Horario: {formData.horaInicio} - {formData.horaFin}</Typography>
                  <Typography>Transporte: {formData.transporte}</Typography>
                  <Typography>Motivos: {formData.motivos.join(', ')}</Typography>
                </Paper>
                <Button variant="contained" color="success" fullWidth>
                  Comenzar Ruta
                </Button>
              </CardContent>
            </Card>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  )
}