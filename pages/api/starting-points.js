export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { city, userPreferences, existingPoints } = req.body
    
    console.log('API starting-points called with:', { city, userPreferences })

    const prompt = `Eres experto en ${city.name}, ${city.country}.

COORDENADAS DE REFERENCIA: ${city.lat}, ${city.lon}

PREFERENCIAS DEL USUARIO:
- Motivos: ${userPreferences.motivos?.join(', ') || 'turismo general'}
- Estilo: ${userPreferences.estilo || 'relajado'}
- Intereses: ${userPreferences.interesesDetallados?.join(', ') || 'cultura general'}
- Transporte: ${userPreferences.transporte || 'caminata'}

${existingPoints?.length > 0 ? `PROHIBIDO repetir: ${existingPoints.join(', ')}` : ''}

Genera 6 puntos de INICIO ideales para un tour en ${city.name} basado en las preferencias del usuario. Incluye:
- Hoteles céntricos
- Estaciones de transporte
- Plazas principales
- Centros comerciales
- Puntos turísticos principales
- Barrios estratégicos

RESPONDE ÚNICAMENTE en este formato JSON:
[
  {
    "nombre": "Hotel Plaza Central",
    "tipo": "hotel",
    "descripcion": "Hotel céntrico ideal para iniciar tours",
    "direccion": "Plaza de Armas 123",
    "coordenadas": {"lat": ${city.lat}, "lon": ${city.lon}},
    "icono": "🏨"
  }
]`

    const response = await fetch('https://primary-production-e9dc.up.railway.app/webhook/postman-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: prompt,
        sessionId: `start-${Date.now()}`
      })
    })

    const data = await response.json()
    
    let points
    try {
      points = JSON.parse(data.output)
    } catch {
      return res.status(500).json({ error: 'IA no generó respuesta válida' })
    }

    res.status(200).json(points)
  } catch (error) {
    res.status(500).json({ error: 'Error procesando solicitud' })
  }
}