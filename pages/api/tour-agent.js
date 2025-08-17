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

    // Construir JSON de entrada según documento
    const jsonInput = {
      usuario: {
        demografia: userData.demografia,
        presupuesto: userData.presupuesto,
        movil_reducida: userData.restricciones?.includes('movilidad') || false
      },
      viaje: {
        inicio: userData.ventanaHoraria?.inicio || "10:00",
        fin: userData.ventanaHoraria?.fin || "18:00",
        duracion_disponible_min: duracionDisponible,
        ciudad_destino: {
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

IMPORTANTE: El usuario tiene EXACTAMENTE ${duracionDisponible} minutos disponibles (${Math.floor(duracionDisponible/60)}h ${duracionDisponible%60}m). 
Debes generar SOLO los puntos que caben en este tiempo, considerando:
- Cada punto necesita su tiempo de visita (duracion_min)
- Agregar tiempo de transporte entre puntos
- El tiempo total NO debe exceder ${duracionDisponible} minutos
- Mínimo 30 min por punto, máximo 120 min por punto
- Reservar 15-30 min de transporte entre puntos

Genera una ruta turística optimizada para ${targetCity.name}, ${targetCity.country}. RESPONDE ÚNICAMENTE en este formato JSON válido:
{
  "ruta": [
    {
      "orden": 1,
      "nombre": "Plaza Principal",
      "tipo": "cultural",
      "duracion_min": 45,
      "coordenadas": {"lat": -33.4378, "lon": -70.6505},
      "descripcion": "Centro histórico de la ciudad",
      "costo_estimado": "$0"
    },
    {
      "orden": 2,
      "nombre": "Mirador Principal",
      "tipo": "naturaleza",
      "duracion_min": 90,
      "coordenadas": {"lat": -33.4373, "lon": -70.6366},
      "descripcion": "Mirador con vista panorámica de la ciudad",
      "costo_estimado": "$3.000"
    }
  ],
  "tiempo_total_min": 480,
  "transporte_total_min": 60,
  "sugerencias_alternativas": [
    {"nombre": "Museo Principal", "tipo": "cultura"},
    {"nombre": "Mercado Local", "tipo": "gastronomia"}
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
      // Fallback si el agente no retorna JSON válido - respeta duración disponible
      const puntosBasicos = [
        {
          orden: 1,
          nombre: "Plaza Principal",
          tipo: "cultural",
          duracion_min: 60,
          coordenadas: { lat: targetCity.lat, lon: targetCity.lon },
          descripcion: "Centro histórico de la ciudad",
          costo_estimado: "$0"
        }
      ]
      
      // Agregar segundo punto solo si hay tiempo suficiente (120+ min)
      if (duracionDisponible >= 150) {
        puntosBasicos.push({
          orden: 2,
          nombre: "Mirador Principal",
          tipo: "naturaleza", 
          duracion_min: Math.min(90, duracionDisponible - 90),
          coordenadas: { lat: targetCity.lat + 0.01, lon: targetCity.lon + 0.01 },
          descripcion: "Vista panorámica de la ciudad",
          costo_estimado: "$3.000"
        })
      }
      
      structuredOutput = {
        ruta: puntosBasicos,
        tiempo_total_min: Math.min(duracionDisponible, puntosBasicos.reduce((acc, p) => acc + p.duracion_min, 0) + 30),
        transporte_total_min: 30,
        sugerencias_alternativas: [],
        recomendaciones_clima: "Llevar protector solar",
        mensaje_original: data.output
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