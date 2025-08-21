import { generateCriticalPrompt } from '../../store/promptModifiers'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userData, sessionId } = req.body

    // Usar los campos datetime simplificados
    const fechaHoraInicio = userData.inicioTour || new Date().toISOString().slice(0, 16)
    const fechaHoraFin = userData.finTour || new Date(Date.now() + 8*60*60*1000).toISOString().slice(0, 16)
    
    const ciudad = userData.selectedCity || userData.detectedCity
    const puntoInicio = userData.ubicacionInicio

    // Calcular tiempo disponible y cantidad de puntos
    const calcularPuntosOptimos = () => {
      const inicio = new Date(fechaHoraInicio)
      const fin = new Date(fechaHoraFin)
      const tiempoTotalMin = (fin - inicio) / (1000 * 60)
      
      // Tiempos base por tipo de actividad (en minutos)
      const tiemposBase = {
        museo: 75, galeria: 75, monumento: 37, iglesia: 37,
        parque: 52, plaza: 52, restaurante: 75, mercado: 60,
        shopping: 60, show: 90, bar: 60, discoteca: 120
      }
      
      // Determinar tipo de actividades según preferencias
      const tipoActividades = []
      if (userData.tipoExperiencia?.includes('cultural')) {
        tipoActividades.push('museo', 'monumento', 'iglesia')
      }
      if (userData.tipoExperiencia?.includes('gastronomica')) {
        tipoActividades.push('restaurante', 'mercado')
      }
      if (userData.tipoExperiencia?.includes('nocturna')) {
        tipoActividades.push('bar', 'discoteca')
      }
      if (userData.interesesEspecificos?.includes('shopping')) {
        tipoActividades.push('shopping', 'mercado')
      }
      if (userData.tipoExperiencia?.includes('naturaleza')) {
        tipoActividades.push('parque', 'plaza')
      }
      
      // Tiempo promedio por actividad
      const tiempoPromedio = tipoActividades.length > 0 
        ? tipoActividades.reduce((sum, tipo) => sum + (tiemposBase[tipo] || 60), 0) / tipoActividades.length
        : 60
      
      // Calcular puntos considerando traslados (15 min entre puntos)
      const puntosCalculados = Math.floor(tiempoTotalMin / (tiempoPromedio + 15))
      
      // Limitar entre 2-8 puntos
      return Math.max(2, Math.min(8, puntosCalculados))
    }
    
    const puntosOptimos = calcularPuntosOptimos()
    
    // Logs para debugging
    console.log('=== CÁLCULO DE PUNTOS ÓPTIMOS ===')
    console.log('Tiempo total:', Math.floor((new Date(fechaHoraFin) - new Date(fechaHoraInicio)) / (1000 * 60)), 'minutos')
    console.log('Tipo experiencia:', userData.tipoExperiencia)
    console.log('Intereses específicos:', userData.interesesEspecificos)
    console.log('Puntos calculados:', puntosOptimos)
    console.log('Datos completos userData:', JSON.stringify(userData, null, 2))
    
    // Generar modificadores críticos del prompt
    const criticalPromptModifiers = generateCriticalPrompt(userData)
    console.log('Modificadores críticos generados:', criticalPromptModifiers)
    
    const prompt = `IMPORTANTE: Debes crear una ruta turística que COMIENCE OBLIGATORIAMENTE en el punto seleccionado por el usuario.

DATOS DEL TOUR:
- CIUDAD: ${ciudad?.city || ciudad?.name}, ${ciudad?.country}
- PUNTO DE INICIO OBLIGATORIO: ${puntoInicio?.direccion}
- COORDENADAS INICIO: ${puntoInicio?.coordenadas?.lat || ciudad?.lat}, ${puntoInicio?.coordenadas?.lon || ciudad?.lon}
- FECHA/HORA: ${fechaHoraInicio} hasta ${fechaHoraFin}
- PREFERENCIAS: ${criticalPromptModifiers}
- TRANSPORTE: ${userData.transporte}

OBLIGATORIO: Crea una ruta con EXACTAMENTE ${puntosOptimos} puntos. El primer punto DEBE ser "${puntoInicio?.direccion}", luego agrega ${puntosOptimos - 1} puntos más.

TIEMPOS BASE POR TIPO:
- Museos/Galerías: 60-90 min
- Monumentos/Iglesias: 30-45 min  
- Parques/Plazas: 45-60 min
- Restaurantes: 60-90 min
- Mercados/Shopping: 45-75 min
- Bares/Vida nocturna: 60-120 min
- Considera 15 min de traslado entre puntos

RESPONDE SOLO JSON con ${puntosOptimos} puntos:
{
  "titulo": "Tour por ${ciudad?.city || ciudad?.name}",
  "duracion": "${Math.ceil((new Date(fechaHoraFin) - new Date(fechaHoraInicio)) / (1000 * 60 * 60 * 24))} día(s)",
  "ruta": [
    {
      "orden": 1,
      "nombre": "${puntoInicio?.direccion || 'Punto de Inicio'}",
      "tipo": "${puntoInicio?.categoria || 'punto de inicio'}",
      "tiempo": "${fechaHoraInicio.split('T')[1] || '09:00'}-${fechaHoraInicio.split('T')[1] || '09:30'}",
      "descripcion": "${puntoInicio?.descripcion || 'Punto de partida del recorrido'}",
      "coordenadas": {"lat": ${puntoInicio?.coordenadas?.lat || ciudad?.lat || -33.4521}, "lon": ${puntoInicio?.coordenadas?.lon || ciudad?.lon || -70.6536}},
      "costo_estimado": "$0",
      "duracion_min": 30
    }${Array.from({length: puntosOptimos - 1}, (_, i) => `,
    {
      "orden": ${i + 2},
      "nombre": "[PUNTO ${i + 2}]",
      "tipo": "[TIPO]",
      "tiempo": "[HORA]",
      "descripcion": "[DESCRIPCIÓN]",
      "coordenadas": {"lat": [LAT], "lon": [LON]},
      "costo_estimado": "[COSTO]",
      "duracion_min": [MINUTOS]
    }`).join('')}
  ],
  "costo_total_estimado": "[CALCULAR]",
  "transporte_total_min": ${(puntosOptimos - 1) * 15},
  "consejos": ["Comenzar puntualmente en ${puntoInicio?.direccion}", "Respetar horarios"]
}`

    const response = await fetch('https://primary-production-e9dc.up.railway.app/webhook/postman-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: prompt,
        sessionId: sessionId || `tour-${Date.now()}`
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Procesar la respuesta para extraer JSON válido
    let tourData
    try {
      if (data.output) {
        // Intentar parsear directamente
        tourData = JSON.parse(data.output)
      } else {
        // Si no hay output, crear estructura básica
        tourData = {
          titulo: `Tour por ${ciudad?.city || ciudad?.name}`,
          duracion: "1 día",
          ruta: [{
            orden: 1,
            nombre: puntoInicio?.direccion || "Punto de inicio",
            tipo: puntoInicio?.categoria || "punto de inicio",
            tiempo: `${fechaHoraInicio.split('T')[1] || '09:00'}-${fechaHoraInicio.split('T')[1] || '09:30'}`,
            descripcion: puntoInicio?.descripcion || "Punto de partida del recorrido",
            coordenadas: { 
              lat: puntoInicio?.coordenadas?.lat || ciudad?.lat || -33.4521, 
              lon: puntoInicio?.coordenadas?.lon || ciudad?.lon || -70.6536 
            },
            costo_estimado: "$0",
            duracion_min: 30
          }],
          costo_total_estimado: "$25000",
          transporte_total_min: 45,
          consejos: [`Comenzar puntualmente en ${puntoInicio?.direccion}`, "Llevar agua"]
        }
      }
    } catch (error) {
      // Fallback con datos básicos
      tourData = {
        titulo: `Tour por ${ciudad?.city || ciudad?.name}`,
        duracion: "1 día",
        ruta: [{
          orden: 1,
          nombre: puntoInicio?.direccion || "Punto de inicio",
          tipo: puntoInicio?.categoria || "punto de inicio",
          tiempo: `${fechaHoraInicio.split('T')[1] || '09:00'}-${fechaHoraInicio.split('T')[1] || '09:30'}`,
          descripcion: puntoInicio?.descripcion || "Punto de partida del recorrido",
          coordenadas: { 
            lat: puntoInicio?.coordenadas?.lat || ciudad?.lat || -33.4521, 
            lon: puntoInicio?.coordenadas?.lon || ciudad?.lon || -70.6536 
          },
          costo_estimado: "$0",
          duracion_min: 30
        }],
        costo_total_estimado: "$25000",
        transporte_total_min: 45,
        consejos: [`Comenzar puntualmente en ${puntoInicio?.direccion}`, "Llevar agua"]
      }
    }
    
    res.status(200).json(tourData)
  } catch (error) {
    console.error('Tour generation error:', error)
    res.status(500).json({ error: 'Error generating tour' })
  }
}