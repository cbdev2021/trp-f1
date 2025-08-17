export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userData } = req.body
    
    // Obtener ciudad objetivo del estado
    const targetCity = userData.selectedCity || userData.detectedCity || {
      name: 'Santiago',
      country: 'Chile', 
      lat: -33.4372,
      lon: -70.6506
    }

    // Calcular duración disponible en minutos
    const calculateDuration = (inicio, fin) => {
      if (!inicio || !fin) return 480 // Default 8 horas
      const [startH, startM] = inicio.split(':').map(Number)
      const [endH, endM] = fin.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM
      return endMinutes - startMinutes
    }

    const duracionDisponible = calculateDuration(userData.ventanaHoraria?.inicio, userData.ventanaHoraria?.fin)

    // Calcular días de viaje
    const fechaInicio = new Date(userData.fechaInicio)
    const fechaFin = new Date(userData.fechaFin)
    const diasViaje = Math.ceil((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)) + 1
    
    // Construir JSON de entrada según documento
    const jsonInput = {
      usuario: {
        demografia: userData.demografia,
        presupuesto: userData.presupuesto,
        movil_reducida: userData.restricciones?.includes('movilidad') || false
      },
      viaje: {
        tipo_ruta: userData.tipoRuta,
        fecha_inicio: userData.fechaInicio,
        fecha_fin: userData.fechaFin,
        dias_total: diasViaje,
        hora_inicio: userData.ventanaHoraria?.inicio || "10:00",
        hora_fin: userData.ventanaHoraria?.fin || "18:00",
        duracion_diaria_min: duracionDisponible,
        ciudad_principal: {
          nombre: targetCity.name,
          pais: targetCity.country,
          coordenadas: { lat: targetCity.lat, lon: targetCity.lon }
        },
        ubicacion_inicio: userData.ubicacionInicio || {
          tipo: "hotel",
          direccion: "Centro de la Ciudad",
          coordenadas: { lat: targetCity.lat, lon: targetCity.lon }
        },
        transporte: userData.transporte || "caminata",
        temporada: "verano",
        clima: { probabilidad_lluvia: 20 }
      },
      preferencias: {
        motivos: userData.motivos || [],
        estilo: userData.estilo || "relajado",
        intereses: userData.interesesDetallados || [],
        eventos: userData.eventos || false
      }
    }

    const prompt = `Eres un agente experto en turismo global. 
    
Datos del usuario: ${JSON.stringify(jsonInput)}

IMPORTANTE: 
- Tipo de ruta: ${userData.tipoRuta}
- Duración: ${diasViaje} días (${userData.fechaInicio} a ${userData.fechaFin})
- Horario diario: ${userData.ventanaHoraria?.inicio || '10:00'} a ${userData.ventanaHoraria?.fin || '18:00'}
- Tiempo diario disponible: ${duracionDisponible} minutos

RESTRICCIONES POR TIPO DE RUTA:
${userData.tipoRuta === 'ciudad_local' ? 
  `CIUDAD LOCAL:
  - Solo lugares en ${targetCity.name}
  - Ruta optimizada sin alojamiento
  - Presupuesto: transporte local + comidas + entradas` :
  `MULTI-CIUDADES:
  - Incluir ciudades cercanas (máx 3h de ${targetCity.name})
  - Calcular alojamiento por noche
  - Transporte inter-ciudades
  - Presupuesto completo: hotel + transporte + comidas + entradas`
}

RESTRICCIONES DE TIEMPO:
- Cada punto: 30-120 min de visita
- Transporte entre puntos: 15-30 min
- Ruta LINEAL sin devolverse
- Partir desde: ${userData.ubicacionInicio?.direccion || 'centro de la ciudad'}

Genera una ruta turística ${userData.tipoRuta === 'multi_ciudades' ? 'multi-ciudades' : 'local'} optimizada. RESPONDE ÚNICAMENTE en este formato JSON válido:
{
  "tipo_tour": "${userData.tipoRuta}",
  "duracion_dias": ${diasViaje},
  "fecha_inicio": "${userData.fechaInicio}",
  "fecha_fin": "${userData.fechaFin}",
  ${userData.tipoRuta === 'ciudad_local' ? 
    `"ruta": [
    {
      "orden": 1,
      "nombre": "Plaza Principal",
      "tipo": "cultural",
      "duracion_min": 45,
      "coordenadas": {"lat": -33.4378, "lon": -70.6505},
      "descripcion": "Centro histórico",
      "costo_estimado": "$0"
    }
  ],
  "tiempo_total_min": ${duracionDisponible},
  "transporte_total_min": 60,
  "costo_total_estimado": "$25.000"` :
    `"dias": [
    {
      "dia": 1,
      "fecha": "${userData.fechaInicio}",
      "ciudad": "${targetCity.name}",
      "ruta": [
        {
          "orden": 1,
          "nombre": "Plaza Principal",
          "tipo": "cultural",
          "duracion_min": 45,
          "coordenadas": {"lat": -33.4378, "lon": -70.6505},
          "descripcion": "Centro histórico",
          "costo_estimado": "$0"
        }
      ],
      "alojamiento": "Hotel Centro - $35.000/noche",
      "costo_dia": "$45.000"
    }
  ],
  "transporte_inter_ciudades": [
    {"origen": "${targetCity.name}", "destino": "Ciudad Cercana", "medio": "Bus", "duracion": "2h", "costo": "$5.000"}
  ],
  "costo_total_estimado": "$135.000"`
  },
  "sugerencias_alternativas": [
    {"nombre": "Museo Principal", "tipo": "cultura"}
  ],
  "recomendaciones_clima": "Llevar protector solar y agua"
}`

    const response = await fetch('https://primary-production-e9dc.up.railway.app/webhook/postman-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: prompt,
        sessionId: req.body.sessionId
      })
    })

    const data = await response.json()
    
    // Intentar parsear respuesta JSON del agente
    let structuredOutput
    try {
      structuredOutput = JSON.parse(data.output)
    } catch (parseError) {
      // Fallback según tipo de ruta
      if (userData.tipoRuta === 'ciudad_local') {
        structuredOutput = {
          tipo_tour: 'ciudad_local',
          duracion_dias: diasViaje,
          fecha_inicio: userData.fechaInicio,
          fecha_fin: userData.fechaFin,
          ruta: [
            {
              orden: 1,
              nombre: "Plaza Principal",
              tipo: "cultural",
              duracion_min: 60,
              coordenadas: { lat: targetCity.lat, lon: targetCity.lon },
              descripcion: "Centro histórico",
              costo_estimado: "$0"
            }
          ],
          tiempo_total_min: duracionDisponible,
          transporte_total_min: 30,
          costo_total_estimado: "$25.000",
          sugerencias_alternativas: [],
          recomendaciones_clima: "Llevar protector solar"
        }
      } else {
        structuredOutput = {
          tipo_tour: 'multi_ciudades',
          duracion_dias: diasViaje,
          fecha_inicio: userData.fechaInicio,
          fecha_fin: userData.fechaFin,
          dias: [
            {
              dia: 1,
              fecha: userData.fechaInicio,
              ciudad: targetCity.name,
              ruta: [
                {
                  orden: 1,
                  nombre: "Plaza Principal",
                  tipo: "cultural",
                  duracion_min: 60,
                  coordenadas: { lat: targetCity.lat, lon: targetCity.lon },
                  descripcion: "Centro histórico",
                  costo_estimado: "$0"
                }
              ],
              alojamiento: "Hotel Centro - $35.000/noche",
              costo_dia: "$45.000"
            }
          ],
          transporte_inter_ciudades: [],
          costo_total_estimado: "$135.000",
          sugerencias_alternativas: [],
          recomendaciones_clima: "Llevar protector solar"
        }
      }
    }

    res.status(200).json(structuredOutput)
  } catch (error) {
    console.error('Error en tour-agent:', error)
    res.status(500).json({ 
      error: 'Error procesando solicitud',
      message: error.message 
    })
  }
}