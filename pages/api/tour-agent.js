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

    // Calcular días y actividades por día
    const calcularItinerarioCompleto = () => {
      const inicio = new Date(fechaHoraInicio)
      const fin = new Date(fechaHoraFin)
      
      // Calcular días completos
      const diasTotales = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24))
      
      // Obtener horas diarias de actividades del usuario
      const horasDiarias = userData.horasDiarias || '4-6h' // default
      
      // Convertir horas diarias a minutos
      const rangosHoras = {
        '2-3h': 150,   // 2.5h promedio
        '4-6h': 300,   // 5h promedio  
        '6-8h': 420,   // 7h promedio
        '8-10h': 540   // 9h promedio
      }
      
      const minutosPorDia = rangosHoras[horasDiarias] || 300
      
      // Tiempos base por categoría (en minutos)
      const tiemposBase = {
        cultura: 75, naturaleza: 60, gastronomia: 75,
        compras: 60, entretenimiento: 90, experiencias: 90
      }
      
      // Determinar categorías según preferencias
      const categorias = []
      if (userData.tipoExperiencia?.includes('cultural')) categorias.push('cultura')
      if (userData.tipoExperiencia?.includes('gastronomica')) categorias.push('gastronomia')
      if (userData.tipoExperiencia?.includes('nocturna')) categorias.push('entretenimiento')
      if (userData.interesesEspecificos?.includes('shopping')) categorias.push('compras')
      if (userData.tipoExperiencia?.includes('naturaleza')) categorias.push('naturaleza')
      
      // Tiempo promedio por actividad
      const tiempoPromedio = categorias.length > 0 
        ? categorias.reduce((sum, cat) => sum + tiemposBase[cat], 0) / categorias.length
        : 70
      
      // Calcular actividades por día (considerando 15 min de traslado)
      const actividadesPorDia = Math.floor(minutosPorDia / (tiempoPromedio + 15))
      
      // Total de actividades para todos los días
      const totalActividades = diasTotales * Math.max(1, actividadesPorDia)
      
      return {
        diasTotales,
        actividadesPorDia: Math.max(1, actividadesPorDia),
        totalActividades: Math.min(totalActividades, 50), // Límite máximo
        minutosPorDia,
        horasDiarias
      }
    }
    
    const itinerario = calcularItinerarioCompleto()
    
    // Logs para debugging
    console.log('=== CÁLCULO DE ITINERARIO COMPLETO ===')
    console.log('Días totales:', itinerario.diasTotales)
    console.log('Horas diarias:', itinerario.horasDiarias)
    console.log('Minutos por día:', itinerario.minutosPorDia)
    console.log('Actividades por día:', itinerario.actividadesPorDia)
    console.log('Total actividades:', itinerario.totalActividades)
    console.log('Tipo experiencia:', userData.tipoExperiencia)
    
    // Generar modificadores críticos del prompt
    const criticalPromptModifiers = generateCriticalPrompt(userData)
    console.log('Modificadores críticos generados:', criticalPromptModifiers)
    console.log('userData completo:', JSON.stringify(userData, null, 2))
    
    const prompt = `IMPORTANTE: Debes crear una ruta turística que COMIENCE OBLIGATORIAMENTE en el punto seleccionado por el usuario.

DATOS DEL TOUR:
- CIUDAD: ${ciudad?.city || ciudad?.name}, ${ciudad?.country}
- PUNTO DE INICIO OBLIGATORIO: ${puntoInicio?.direccion}
- COORDENADAS INICIO: ${puntoInicio?.coordenadas?.lat || ciudad?.lat}, ${puntoInicio?.coordenadas?.lon || ciudad?.lon}
- FECHA/HORA: ${fechaHoraInicio} hasta ${fechaHoraFin}
- DURACIÓN: ${itinerario.diasTotales} días, ${itinerario.horasDiarias} diarias
- PREFERENCIAS: ${criticalPromptModifiers}
- TRANSPORTE: ${userData.transporte}

OBLIGATORIO: Crea una ruta de ${itinerario.diasTotales} días con ${itinerario.totalActividades} actividades (${itinerario.actividadesPorDia} por día, ${itinerario.horasDiarias} diarias). El primer punto DEBE ser "${puntoInicio?.direccion}".

TIEMPOS: Cultura 75min, Naturaleza 60min, Gastronomía 75min, Compras 60min, Entretenimiento 90min + 15min traslados

RESPONDE SOLO JSON con ${itinerario.totalActividades} actividades distribuidas en ${itinerario.diasTotales} días:
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
    }${Array.from({length: itinerario.totalActividades - 1}, (_, i) => `,
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
  "transporte_total_min": ${(itinerario.totalActividades - 1) * 15},
  "dias_totales": ${itinerario.diasTotales},
  "actividades_por_dia": ${itinerario.actividadesPorDia},
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
    console.log('Respuesta completa de la IA:', JSON.stringify(data, null, 2))
    console.log('Cantidad de puntos en ruta:', data.output ? JSON.parse(data.output).ruta?.length : 'No hay ruta')
    
    // Procesar la respuesta para extraer JSON válido
    let tourData
    try {
      if (data.output) {
        console.log('Output de la IA:', data.output)
        tourData = JSON.parse(data.output)
        console.log('Tour parseado - puntos en ruta:', tourData.ruta?.length)
      } else {
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
      console.error('Error parseando JSON:', error)
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
    
    console.log('Tour final enviado al frontend - puntos:', tourData.ruta?.length)
    res.status(200).json(tourData)
  } catch (error) {
    console.error('Tour generation error:', error)
    res.status(500).json({ error: 'Error generating tour' })
  }
}