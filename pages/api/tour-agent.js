export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userData } = req.body
    
    // Construir JSON de entrada según documento
    const jsonInput = {
      usuario: {
        demografia: userData.demografia,
        presupuesto: userData.presupuesto,
        movil_reducida: userData.restricciones?.includes('movilidad') || false
      },
      viaje: {
        inicio: userData.ventanaHoraria?.inicio || "2025-01-15T10:00:00-04:00",
        fin: userData.ventanaHoraria?.fin || "2025-01-15T20:00:00-04:00",
        ubicacion_inicio: userData.ubicacionInicio || {
          tipo: "hotel",
          direccion: "Centro de la Ciudad",
          coordenadas: { lat: -33.4372, lon: -70.6506 }
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

Genera una ruta turística optimizada para la ciudad especificada. RESPONDE ÚNICAMENTE en este formato JSON válido:
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
      // Fallback si el agente no retorna JSON válido
      structuredOutput = {
        ruta: [
          {
            orden: 1,
            nombre: "Plaza Principal",
            tipo: "cultural",
            duracion_min: 45,
            coordenadas: { lat: -33.4378, lon: -70.6505 },
            descripcion: "Centro histórico de la ciudad",
            costo_estimado: "$0"
          },
          {
            orden: 2,
            nombre: "Mirador Principal",
            tipo: "naturaleza", 
            duracion_min: 90,
            coordenadas: { lat: -33.4373, lon: -70.6366 },
            descripcion: "Vista panorámica de la ciudad",
            costo_estimado: "$3.000"
          }
        ],
        tiempo_total_min: 300,
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