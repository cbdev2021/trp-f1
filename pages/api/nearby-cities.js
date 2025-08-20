// Fórmula Haversine optimizada y verificada
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0088 // Radio promedio de la Tierra en km (más preciso)
  const toRad = Math.PI / 180
  
  const dLat = (lat2 - lat1) * toRad
  const dLon = (lon2 - lon1) * toRad
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { detectedCity } = req.body

    const prompt = `Eres un experto en turismo global.

Ubicación del usuario: ${detectedCity.city}, ${detectedCity.country} (${detectedCity.lat}, ${detectedCity.lon})

Genera 5 ciudades turísticas cercanas y populares en un radio de 500km de la ubicación del usuario. Incluye ciudades del mismo país y países vecinos.

RESPONDE ÚNICAMENTE en este formato JSON:
[
  {
    "name": "Buenos Aires",
    "country": "Argentina", 
    "flag": "🇦🇷",
    "lat": -34.6118,
    "lon": -58.3960,
    "type": "🏙️ Metrópoli"
  }
]`

    const response = await fetch('https://primary-production-e9dc.up.railway.app/webhook/postman-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: prompt,
        sessionId: `nearby-${Date.now()}`
      })
    })

    const data = await response.json()
    
    let cities = JSON.parse(data.output)

    // Agregar tipo y bandera si no existen
    cities = cities.map(city => ({
      ...city,
      type: city.type || '🏙️ Ciudad',
      flag: city.flag || 'XX'
    }))

    res.status(200).json(cities)
  } catch (error) {
    res.status(500).json({ error: 'Error generating cities' })
  }
}