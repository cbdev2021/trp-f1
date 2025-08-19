export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { detectedCity, existingCities } = req.body

    const prompt = `Eres un experto en turismo global. 

Ubicación del usuario: ${detectedCity.city}, ${detectedCity.country} (${detectedCity.lat}, ${detectedCity.lon})

Ciudades ya mostradas: ${existingCities.join(', ')}

Genera 4 ciudades turísticas populares de diferentes países que NO estén en la lista existente. Prioriza ciudades de continentes diferentes y destinos únicos.

RESPONDE ÚNICAMENTE en este formato JSON:
[
  {
    "name": "Tokyo",
    "country": "Japón", 
    "flag": "🇯🇵",
    "lat": 35.6762,
    "lon": 139.6503,
    "type": "🏙️ Metrópoli"
  }
]`

    const response = await fetch('https://primary-production-e9dc.up.railway.app/webhook/postman-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: prompt,
        sessionId: `cities-${Date.now()}`
      })
    })

    const data = await response.json()
    
    let newCities
    try {
      newCities = JSON.parse(data.output)
    } catch {
      // Fallback si IA falla
      newCities = [
        { name: 'Tokyo', country: 'Japón', flag: 'JP', lat: 35.6762, lon: 139.6503, type: '🏙️ Metrópoli' },
        { name: 'Sydney', country: 'Australia', flag: 'AU', lat: -33.8688, lon: 151.2093, type: '🏖️ Costera' },
        { name: 'Dubai', country: 'Emiratos Árabes', flag: 'AE', lat: 25.2048, lon: 55.2708, type: '🏗️ Moderna' },
        { name: 'Bangkok', country: 'Tailandia', flag: 'TH', lat: 13.7563, lon: 100.5018, type: '🛕 Templos' }
      ]
    }

    // Agregar tipo y bandera si no existen
    newCities = newCities.map(city => ({
      ...city,
      type: city.type || '🏙️ Ciudad',
      flag: city.flag || 'XX'
    }))

    res.status(200).json(newCities)
  } catch (error) {
    // Fallback en caso de error
    res.status(200).json([
      { name: 'Istanbul', country: 'Turquía', flag: 'TR', lat: 41.0082, lon: 28.9784, type: '🕌 Histórica' },
      { name: 'Cairo', country: 'Egipto', flag: 'EG', lat: 30.0444, lon: 31.2357, type: '🏺 Antigua' },
      { name: 'Mumbai', country: 'India', flag: 'IN', lat: 19.0760, lon: 72.8777, type: '🏙️ Bollywood' },
      { name: 'Cape Town', country: 'Sudáfrica', flag: 'ZA', lat: -33.9249, lon: 18.4241, type: '🏔️ Montaña' }
    ])
  }
}