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
      
      // Calcular días completos (mínimo 1)
      const diasTotales = Math.max(1, Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24)))
      
      // Obtener horas diarias de actividades del usuario
      const horasDiarias = userData.duracionPreferida || userData.horasDiarias || '4-6h' // default
      
      // Convertir horas diarias a minutos (usar promedio alto del rango)
      const rangosHoras = {
        '2-3h': 150,   // 2.5h promedio
        '4-5h': 270,   // 4.5h promedio
        '4-6h': 300,   // 5h promedio (fallback)  
        '6-7h': 390,   // 6.5h promedio
        '6-8h': 420,   // 7h promedio (fallback)
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
      
      // Calcular actividades por día según rango de horas
      let actividadesPorDia
      
      console.log('Evaluando horasDiarias:', horasDiarias, 'tipo:', typeof horasDiarias)
      
      if (horasDiarias === '8-10h') {
        actividadesPorDia = 5 // Para 8-10h: 5 actividades con más tiempo cada una
        console.log('🔥 USANDO 5 actividades largas para 8-10h')
      } else if (horasDiarias === '6-7h' || horasDiarias === '6-8h') {
        actividadesPorDia = 6 // Para 6-7h: 6 actividades  
      } else if (horasDiarias === '4-5h' || horasDiarias === '4-6h') {
        actividadesPorDia = 4 // Para 4-5h: 4 actividades
      } else if (horasDiarias === '2-3h') {
        actividadesPorDia = 3 // Para 2-3h: 3 actividades
      } else {
        actividadesPorDia = 4 // Default
        console.log('⚠️  Usando default de 4 actividades para:', horasDiarias)
      }
      
      // FORZAR 5 actividades largas si los minutos indican 8-10h
      if (minutosPorDia >= 540) {
        actividadesPorDia = 5
        console.log('🔥 USANDO 5 actividades largas por minutos altos:', minutosPorDia)
      }
      
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
    console.log('Horas diarias recibidas:', userData.duracionPreferida || userData.horasDiarias)
    console.log('Días totales:', itinerario.diasTotales)
    console.log('Horas diarias procesadas:', itinerario.horasDiarias)
    console.log('Minutos por día:', itinerario.minutosPorDia)
    console.log('Actividades por día CALCULADAS:', itinerario.actividadesPorDia)
    console.log('Total actividades:', itinerario.totalActividades)
    console.log('Tiempo promedio por actividad:', Math.floor(itinerario.minutosPorDia / itinerario.actividadesPorDia), 'min')
    console.log('Tipo experiencia:', userData.tipoExperiencia)
    
    // Verificar si el cálculo es correcto
    const horasRecibidas = userData.duracionPreferida || userData.horasDiarias
    if (horasRecibidas === '8-10h' && itinerario.actividadesPorDia !== 5) {
      console.error('🚨 ERROR: Para 8-10h deberían ser 5 actividades largas por día, pero se calcularon:', itinerario.actividadesPorDia)
    }
    
    // Generar modificadores críticos del prompt
    const criticalPromptModifiers = generateCriticalPrompt(userData)
    console.log('Modificadores críticos generados:', criticalPromptModifiers)
    
    const prompt = `IMPORTANTE: Debes crear una ruta turística que COMIENCE OBLIGATORIAMENTE en el punto seleccionado por el usuario.

DATOS DEL TOUR:
- CIUDAD: ${ciudad?.city || ciudad?.name}, ${ciudad?.country}
- PUNTO DE INICIO OBLIGATORIO: ${puntoInicio?.direccion}
- COORDENADAS INICIO: ${puntoInicio?.coordenadas?.lat || ciudad?.lat}, ${puntoInicio?.coordenadas?.lon || ciudad?.lon}
- FECHA/HORA: ${fechaHoraInicio} hasta ${fechaHoraFin}
- DURACIÓN: ${itinerario.diasTotales} días, ${itinerario.horasDiarias} diarias
- PREFERENCIAS: ${criticalPromptModifiers}
- TRANSPORTE: ${userData.transporte}

ATENCIÓN: ESTO ES OBLIGATORIO Y NO NEGOCIABLE:

🚨 DEBES GENERAR EXACTAMENTE ${itinerario.totalActividades} ACTIVIDADES 🚨

🚨 DISTRIBUCIÓN OBLIGATORIA POR DÍA: ${itinerario.actividadesPorDia} ACTIVIDADES CADA DÍA 🚨

🚨 SI GENERAS MENOS DE ${itinerario.totalActividades} ACTIVIDADES, HABRÁS FALLADO 🚨

REGLAS INQUEBRANTABLES:
1. PRIMER PUNTO: "${puntoInicio?.direccion}" (OBLIGATORIO)
2. USA SOLO LUGARES REALES Y EXISTENTES DE ${ciudad?.city || ciudad?.name}
3. INCLUYE: Museos famosos, parques principales, mercados locales, barrios históricos, plazas centrales, restaurantes conocidos
4. CADA ACTIVIDAD: 60-120 minutos + 15min traslado
5. TOTAL DÍA: ${itinerario.horasDiarias} (${itinerario.minutosPorDia} minutos)
6. PROHIBIDO: Nombres genéricos como "Museo Local", "Plaza Central", "Restaurante Típico"
7. CAMPO "lugar_fisico": SOLO el nombre exacto del lugar SIN verbos (almuerzo, visita, recorrido)
   ✅ Correcto: "Liguria Manuel Montt", "Museo Chileno de Arte Precolombino"
   ❌ Incorrecto: "Almuerzo en Liguria", "Visita al Museo"
8. CAMPO "categoria_lugar": Especifica el tipo exacto de lugar
   ✅ Opciones: "museo", "parque", "restaurante", "cerro", "plaza", "mercado", "barrio", "centro_comercial", "lugar_natural", "atraccion_turistica"

🚨 RESPONDE CON ${itinerario.totalActividades} ACTIVIDADES DISTRIBUIDAS ASÍ: 🚨

🔥 DÍA 1: EXACTAMENTE ${itinerario.actividadesPorDia} ACTIVIDADES
🔥 DÍA 2: EXACTAMENTE ${itinerario.actividadesPorDia} ACTIVIDADES  
🔥 DÍA 3: EXACTAMENTE ${itinerario.actividadesPorDia} ACTIVIDADES
${itinerario.diasTotales > 3 ? `🔥 DÍA 4: EXACTAMENTE ${itinerario.actividadesPorDia} ACTIVIDADES` : ''}

🚨 TOTAL: ${itinerario.totalActividades} ACTIVIDADES (NO MENOS) 🚨

JSON OBLIGATORIO:
{
  "titulo": "Tour por ${ciudad?.city || ciudad?.name}",
  "duracion": "${Math.ceil((new Date(fechaHoraFin) - new Date(fechaHoraInicio)) / (1000 * 60 * 60 * 24))} día(s)",
  "ruta": [
    {
      "orden": 1,
      "nombre": "${puntoInicio?.direccion || 'Punto de Inicio'}",
      "lugar_fisico": "${puntoInicio?.direccion || 'Punto de Inicio'}",
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
      "lugar_fisico": "[NOMBRE_EXACTO_SIN_VERBOS]",
      "categoria_lugar": "[CATEGORIA: museo/parque/restaurante/cerro/plaza/mercado/barrio/centro_comercial/lugar_natural/atraccion_turistica]",
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
  "visitas_total_min": "[CALCULAR SUMA DE DURACIONES]",
  "tiempo_total_min": "[VISITAS + TRASLADOS]",
  "dias_totales": ${itinerario.diasTotales},
  "actividades_por_dia": ${itinerario.actividadesPorDia},
  "minutos_por_dia": ${itinerario.minutosPorDia},
  "consejos": ["Comenzar puntualmente en ${puntoInicio?.direccion}", "Respetar horarios"]
}`

    // Configurar timeout extendido para respuestas largas de IA
    const controller = new AbortController()
    // const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 segundos
    const timeoutId = setTimeout(() => controller.abort(), 600000) // 60 segundos
    
    // const response = await fetch('https://primary-production-e9dc.up.railway.app/webhook/postman-webhook', {
    const response = await fetch('https://n8n-ayym.onrender.com/webhook/postman-webhook', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: prompt,
        sessionId: sessionId || `tour-${Date.now()}`
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Respuesta completa de la IA:', JSON.stringify(data, null, 2))
    
    // Procesar la respuesta para extraer JSON válido
    let tourData
    try {
      if (data.output) {
        console.log('Output de la IA:', data.output)
        
        // Limpiar la respuesta de backticks y texto extra
        let cleanOutput = data.output
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/^[^{]*/, '') // Remover texto antes del primer {
          .replace(/[^}]*$/, '') // Remover texto después del último }
          .trim()
        
        // Si no hay JSON válido, intentar extraer desde el final
        if (!cleanOutput.startsWith('{')) {
          const jsonMatch = data.output.match(/{[\s\S]*}/)
          if (jsonMatch) {
            cleanOutput = jsonMatch[0]
          }
        }
        
        console.log('JSON limpio:', cleanOutput)
        tourData = JSON.parse(cleanOutput)
        
        // Limpiar nombres con undefined y caracteres problemáticos
        if (tourData.ruta) {
          tourData.ruta = tourData.ruta.map(punto => ({
            ...punto,
            nombre: punto.nombre ? 
              punto.nombre
                .replace(/undefined\s*/gi, '')
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remover caracteres de control
                .replace(/\s+/g, ' ') // Normalizar espacios
                .trim() || 'Punto de interés' 
              : 'Punto de interés',
            lugar_fisico: punto.lugar_fisico ?
              punto.lugar_fisico
                .replace(/Centro Comercial /gi, '')
                .replace(/Peña y Arte Flamenco /gi, '')
                .replace(/undefined\s*/gi, '')
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
                .replace(/\s+/g, ' ')
                .trim() || punto.nombre
              : punto.nombre,
            descripcion: punto.descripcion ?
              punto.descripcion
                .replace(/undefined\s*/gi, '')
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
                .replace(/\s+/g, ' ')
                .trim() || 'Descripción no disponible'
              : 'Descripción no disponible'
          }))
          
          // Filtrar lugares problemáticos
          const lugaresProblematicos = [
            'Casa Pilar', 'Peña Flamenco', 'Arte Flamenco', 'Coquinaria',
            'Barrio El Golf y Plaza Perú', 'Ambrosía Bistro' // Restaurantes ficticios
          ]
          
          // Limpiar nombres compuestos problemáticos
          tourData.ruta = tourData.ruta.map(punto => ({
            ...punto,
            lugar_fisico: punto.lugar_fisico
              ?.replace(/Barrio El Golf y Plaza Perú/gi, 'Plaza Perú')
              ?.replace(/Coquinaria/gi, 'Mercado Central') // Fallback a lugar conocido
          }))
          
          // Validar lugares con Google Places API
          const validatePlace = async (placeName, city, cityCoords) => {
            try {
              if (!process.env.GOOGLE_PLACES_API_KEY) {
                console.warn('⚠️ Google Places API key no configurada, saltando validación')
                return true
              }
              
              const query = `${placeName}, ${city}`
              const response = await fetch(
`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,business_status,geometry,types&key=${process.env.GOOGLE_PLACES_API_KEY}`
              )
              const data = await response.json()
              
              if (data.candidates && data.candidates.length > 0) {
                // Analizar todos los candidatos y mostrar información
                const tiposProblematicos = ['political', 'administrative_area_level_1', 'administrative_area_level_2']
                
                for (const [index, candidate] of data.candidates.entries()) {
                  if (!candidate.place_id) continue
                  
                  // Clasificar tipo de lugar
                  let tipoLugar = 'Lugar'
                  if (candidate.types) {
                    if (candidate.types.includes('route')) tipoLugar = 'Calle/Ruta'
                    else if (candidate.types.includes('natural_feature')) tipoLugar = 'Lugar Natural'
                    else if (candidate.types.includes('tourist_attraction')) tipoLugar = 'Atracción Turística'
                    else if (candidate.types.includes('park')) tipoLugar = 'Parque'
                    else if (candidate.types.includes('museum')) tipoLugar = 'Museo'
                    else if (candidate.types.includes('restaurant')) tipoLugar = 'Restaurante'
                    else if (candidate.types.includes('establishment')) tipoLugar = 'Establecimiento'
                  }
                  
                  console.log(`📍 Candidato ${index + 1}: ${placeName} (${tipoLugar}) - Tipos: ${candidate.types?.join(', ') || 'N/A'}`)
                }
                
                const place = data.candidates[0]
                
                // Verificar que tenga place_id y esté operativo
                if (!place.place_id || (place.business_status && place.business_status !== 'OPERATIONAL')) {
                  return false
                }
                
                // Filtrar solo tipos realmente problemáticos (divisiones administrativas)
                if (place.types && place.types.some(tipo => tiposProblematicos.includes(tipo))) {
                  console.warn(`🚫 Lugar filtrado por tipo: ${placeName} - Tipos: ${place.types.join(', ')}`)
                  return false
                }
                
                console.log(`✅ Lugar seleccionado: ${placeName} (Candidato 1)`)
                
                // Calcular radio dinámico según tamaño de ciudad
                const getRadioMaximo = (cityName) => {
                  const megaciudades = ['tokyo', 'delhi', 'shanghai', 'sao paulo', 'mumbai', 'beijing', 'osaka', 'cairo', 'mexico city', 'dhaka']
                  const metropolis = ['london', 'paris', 'new york', 'moscow', 'istanbul', 'los angeles', 'buenos aires', 'rio de janeiro', 'lima', 'bogota']
                  const ciudadesGrandes = ['santiago', 'barcelona', 'amsterdam', 'berlin', 'madrid', 'rome', 'vienna', 'prague', 'lisbon', 'athens']
                  
                  const city = cityName.toLowerCase()
                  if (megaciudades.some(mega => city.includes(mega))) return 75
                  if (metropolis.some(metro => city.includes(metro))) return 50
                  if (ciudadesGrandes.some(grande => city.includes(grande))) return 35
                  return 25 // Ciudades pequeñas/medianas
                }
                
                // Validar distancia desde el centro de la ciudad
                if (place.geometry && place.geometry.location && cityCoords) {
                  const radioMaximo = getRadioMaximo(city)
                  const distancia = calcularDistancia(
                    cityCoords.lat, cityCoords.lon,
                    place.geometry.location.lat, place.geometry.location.lng
                  )
                  
                  if (distancia > radioMaximo) {
                    console.warn(`🚫 Lugar muy lejano eliminado: ${placeName} - ${distancia.toFixed(1)}km del centro (máx: ${radioMaximo}km)`)
                    return false
                  }
                }
                
                return true
              }
              return false
            } catch (error) {
              console.warn(`Error validando lugar ${placeName}:`, error)
              return false
            }
          }
          
          // Función para calcular distancia entre dos puntos
          const calcularDistancia = (lat1, lon1, lat2, lon2) => {
            const R = 6371
            const dLat = (lat2 - lat1) * Math.PI / 180
            const dLon = (lon2 - lon1) * Math.PI / 180
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                      Math.sin(dLon/2) * Math.sin(dLon/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            return R * c
          }
          
          // Filtrar lugares problemáticos primero
          tourData.ruta = tourData.ruta.filter(punto => {
            const esProblematico = lugaresProblematicos.some(lugar => 
              punto.lugar_fisico?.toLowerCase().includes(lugar.toLowerCase())
            )
            if (esProblematico) {
              console.warn(`🚫 Lugar filtrado: ${punto.lugar_fisico} - En lista problemática`)
            }
            return !esProblematico
          })
          
          // Validar cada lugar restante con Google Places API
          const validatedRuta = []
          for (const punto of tourData.ruta) {
            if (punto.orden === 1) {
              validatedRuta.push(punto)
              continue
            }
            
            const isValid = await validatePlace(
              punto.lugar_fisico, 
              ciudad?.city || ciudad?.name,
              { lat: ciudad?.lat || -33.4521, lon: ciudad?.lon || -70.6536 }
            )
            if (isValid) {
              validatedRuta.push(punto)
              console.log(`✅ Lugar verificado: ${punto.lugar_fisico}`)
            } else {
              console.warn(`🚫 Lugar sin pin eliminado: ${punto.lugar_fisico}`)
              console.log(`📝 Revisa los candidatos arriba para verificar si es el lugar correcto`)
            }
          }
          
          tourData.ruta = validatedRuta
        }
        console.log('Tour parseado - puntos en ruta:', tourData.ruta?.length)
        
        // Validar si se generaron todas las actividades solicitadas
        if (tourData.ruta?.length < itinerario.totalActividades) {
          console.warn(`⚠️  ADVERTENCIA: Se solicitaron ${itinerario.totalActividades} actividades pero solo se generaron ${tourData.ruta?.length}`)
          console.warn('La IA no respetó las instrucciones. Considera ajustar el prompt o usar menos actividades por día.')
        } else {
          console.log('✅ Correcto: Se generaron todas las actividades solicitadas')
        }
        
        // Análisis simple por días
        if (tourData.ruta && tourData.ruta.length > 0) {
          const actividadesPorDia = itinerario.actividadesPorDia
          for (let dia = 1; dia <= itinerario.diasTotales; dia++) {
            const inicio = (dia - 1) * actividadesPorDia
            const fin = Math.min(dia * actividadesPorDia, tourData.ruta.length)
            const actividadesDia = tourData.ruta.slice(inicio, fin)
            const minutosTotal = actividadesDia.reduce((sum, act) => sum + (parseInt(act.duracion_min) || 0), 0)
            console.log(`DÍA ${dia}: ${actividadesDia.length} actividades, ${minutosTotal} min`)
          }
        }
        
      } else {
        console.warn('⚠️ No se recibió output de la IA, usando fallback')
        throw new Error('No output received')
      }
    } catch (error) {
      console.error('Error parseando JSON:', error)
      console.error('Respuesta original:', data.output)
      
      // Intentar recuperar datos parciales si es posible
      if (data.output && data.output.includes('ruta')) {
        console.log('Intentando recuperar datos parciales...')
        // Aquí podrías agregar lógica para extraer datos parciales
      }
      
      // Solo usar fallback si realmente no hay datos
      tourData = {
        titulo: `Tour por ${ciudad?.city || ciudad?.name}`,
        duracion: `${itinerario.diasTotales} día(s)`,
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
        dias_totales: itinerario.diasTotales,
        actividades_por_dia: itinerario.actividadesPorDia,
        minutos_por_dia: itinerario.minutosPorDia,
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