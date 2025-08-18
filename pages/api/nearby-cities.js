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
    "distance": 280
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
    
    let cities
    try {
      cities = JSON.parse(data.output)
    } catch {
      // Fallback si IA falla
      cities = [
        { name: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', lat: -34.6118, lon: -58.3960, distance: 280 },
        { name: 'Lima', country: 'Perú', flag: '🇵🇪', lat: -12.0464, lon: -77.0428, distance: 320 },
        { name: 'Montevideo', country: 'Uruguay', flag: '🇺🇾', lat: -34.9011, lon: -56.1645, distance: 180 },
        { name: 'La Paz', country: 'Bolivia', flag: '🇧🇴', lat: -16.5000, lon: -68.1500, distance: 450 },
        { name: 'São Paulo', country: 'Brasil', flag: '🇧🇷', lat: -23.5505, lon: -46.6333, distance: 380 }
      ]
    }

    res.status(200).json(cities)
  } catch (error) {
    // Fallback en caso de error
    res.status(200).json([
      { name: 'Madrid', country: 'España', flag: '🇪🇸', lat: 40.4168, lon: -3.7038, distance: 200 },
      { name: 'Paris', country: 'Francia', flag: '🇫🇷', lat: 48.8566, lon: 2.3522, distance: 300 },
      { name: 'Rome', country: 'Italia', flag: '🇮🇹', lat: 41.9028, lon: 12.4964, distance: 250 },
      { name: 'Berlin', country: 'Alemania', flag: '🇩🇪', lat: 52.5200, lon: 13.4050, distance: 400 },
      { name: 'London', country: 'Reino Unido', flag: '🇬🇧', lat: 51.5074, lon: -0.1278, distance: 350 }
    ])
  }
}