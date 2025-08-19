export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { city, userPreferences, existingPoints } = req.body
    
    console.log('API starting-points called with:', { city, userPreferences })

    const prompt = `Eres experto en ${city.name}, ${city.country}.

PREFERENCIAS DEL USUARIO:
- Motivos: ${userPreferences.motivos?.join(', ') || 'turismo general'}
- Estilo: ${userPreferences.estilo || 'relajado'}
- Intereses: ${userPreferences.interesesDetallados?.join(', ') || 'cultura general'}
- Transporte: ${userPreferences.transporte || 'caminata'}

${existingPoints?.length > 0 ? `PROHIBIDO repetir: ${existingPoints.join(', ')}` : ''}

Genera 6 puntos de INICIO ideales para un tour en ${city.name} basado en las preferencias del usuario. Incluye:
- Hoteles céntricos conocidos
- Estaciones de metro/transporte principales
- Plazas y parques famosos
- Centros comerciales importantes
- Monumentos y puntos turísticos
- Barrios emblemáticos

USA NOMBRES REALES Y ESPECÍFICOS que Google Maps pueda encontrar fácilmente.

RESPONDE ÚNICAMENTE en este formato JSON:
[
  {
    "nombre": "Plaza de Armas",
    "tipo": "plaza",
    "descripcion": "Plaza principal e histórica de Santiago",
    "icono": "🏛️"
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

    // Obtener coordenadas exactas de Google Maps
    for (let point of points) {
      try {
        const searchQuery = `${point.nombre}, ${city.name}, ${city.country}`
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${process.env.GOOGLE_MAPS_API_KEY || 'demo'}`
        )
        
        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json()
          if (geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location
            point.coordenadas = {
              lat: location.lat,
              lon: location.lng
            }
            point.direccion = geocodeData.results[0].formatted_address
          }
        }
      } catch (error) {
        console.log('Geocoding failed for:', point.nombre)
        // Fallback: usar coordenadas de la ciudad
        point.coordenadas = { lat: city.lat, lon: city.lon }
        point.direccion = `${point.nombre}, ${city.name}`
      }
    }

    res.status(200).json(points)
  } catch (error) {
    res.status(500).json({ error: 'Error procesando solicitud' })
  }
}