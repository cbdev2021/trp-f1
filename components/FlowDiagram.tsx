'use client'
import { Box, Typography, Paper, Divider } from '@mui/material'
import { ArrowDownward } from '@mui/icons-material'

export default function FlowDiagram() {
  const flowSteps = [
    {
      title: 'A. Datos Básicos de Usuario y Viaje',
      items: [
        'Demografía & Perfil: Solo, Pareja, Familia, Adulto mayor, Grupo amigos',
        'Presupuesto: Económico, Medio, Alto, Elite',
        'Ventana horaria: Hora inicio y término'
      ]
    },
    {
      title: 'B. Preferencias Personales',
      items: [
        'Motivos: Naturaleza, Cultura, Historia, Gastronomía, Vida nocturna, Bohemio, Aventura, Relax, Compras, Deportes, Fotografía, Arquitectura, Música, Arte, Espiritualidad, Educativo'
      ]
    },
    {
      title: 'C. Contexto y Condiciones',
      items: [
        'Restricciones: Movilidad reducida, Niños pequeños, Alergias, Vegetariano/Vegano, Sin alcohol, Acceso silla ruedas, Mascotas, Diabetes, Problemas cardíacos, Claustrofobia',
        'Transporte: A pie, Bicicleta, Transporte público, Vehículo propio, Taxi/Uber, Scooter, Patineta, Combinado'
      ]
    },
    {
      title: 'D. Intereses Detallados + Eventos',
      items: [
        'Gustos específicos: Música en vivo, Librerías, Arte urbano, Mercados, Cafés, Museos, Galerías, Parques, Miradores, Centros comerciales, Bares, Discotecas, Teatros, Cines, Festivales, Talleres, Tours guiados, Actividades deportivas'
      ]
    },
    {
      title: 'E. Generación de Ruta',
      items: [
        'Creación de ruta personalizada',
        'Optimización según horarios, distancias, transporte y clima',
        'Ajuste dinámico para pausas',
        'Retroalimentación y ajustes del usuario'
      ]
    },
    {
      title: 'F. Presentación y Feedback',
      items: [
        'Mapa interactivo con detalles',
        'Confirmación y acciones finales',
        'Recolección de feedback para mejoras futuras'
      ]
    }
  ]

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Diagrama de Flujo - Planificador de Viaje
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {flowSteps.map((step, index) => (
          <Box key={index}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                backgroundColor: index % 2 === 0 ? '#f5f5f5' : '#fff',
                border: '2px solid #1976d2',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                {step.title}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {step.items.map((item, itemIndex) => (
                <Typography key={itemIndex} variant="body2" sx={{ mb: 1 }}>
                  • {item}
                </Typography>
              ))}
            </Paper>
            
            {index < flowSteps.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                <ArrowDownward color="primary" sx={{ fontSize: 30 }} />
              </Box>
            )}
          </Box>
        ))}
      </Box>

      <Paper sx={{ mt: 4, p: 3, backgroundColor: '#e3f2fd' }}>
        <Typography variant="h6" gutterBottom>
          Beneficios del Flujo
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Claridad:</strong> Cada paso está bien definido y encadena de manera lineal
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Escalabilidad:</strong> Se pueden añadir nuevos pasos fácilmente
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          • <strong>Personalización:</strong> Adapta la ruta al perfil, clima, tiempo y gustos
        </Typography>
        <Typography variant="body2">
          • <strong>Optimización UX:</strong> Reduce carga cognitiva y ofrece feedback inmediato
        </Typography>
      </Paper>
    </Box>
  )
}