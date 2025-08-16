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
    "distance": 1200
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
        { name: 'Tokyo', country: 'Japón', flag: '🇯🇵', lat: 35.6762, lon: 139.6503, distance: 1200 },
        { name: 'Sydney', country: 'Australia', flag: '🇦🇺', lat: -33.8688, lon: 151.2093, distance: 1500 },
        { name: 'Dubai', country: 'Emiratos Árabes', flag: '🇦🇪', lat: 25.2048, lon: 55.2708, distance: 1100 },
        { name: 'Bangkok', country: 'Tailandia', flag: '🇹🇭', lat: 13.7563, lon: 100.5018, distance: 1300 }
      ]
    }

    res.status(200).json(newCities)
  } catch (error) {
    // Fallback en caso de error
    res.status(200).json([
      { name: 'Istanbul', country: 'Turquía', flag: '🇹🇷', lat: 41.0082, lon: 28.9784, distance: 900 },
      { name: 'Cairo', country: 'Egipto', flag: '🇪🇬', lat: 30.0444, lon: 31.2357, distance: 800 },
      { name: 'Mumbai', country: 'India', flag: '🇮🇳', lat: 19.0760, lon: 72.8777, distance: 1400 },
      { name: 'Cape Town', country: 'Sudáfrica', flag: '🇿🇦', lat: -33.9249, lon: 18.4241, distance: 1000 }
    ])
  }
}