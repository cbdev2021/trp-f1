export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { detectedCity } = req.body

    // Ciudades base por región
    const cityDatabase = {
      'South America': [
        { name: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', lat: -34.6118, lon: -58.3960 },
        { name: 'Lima', country: 'Perú', flag: '🇵🇪', lat: -12.0464, lon: -77.0428 },
        { name: 'Bogotá', country: 'Colombia', flag: '🇨🇴', lat: 4.7110, lon: -74.0721 },
        { name: 'São Paulo', country: 'Brasil', flag: '🇧🇷', lat: -23.5505, lon: -46.6333 },
        { name: 'Montevideo', country: 'Uruguay', flag: '🇺🇾', lat: -34.9011, lon: -56.1645 }
      ],
      'Europe': [
        { name: 'Madrid', country: 'España', flag: '🇪🇸', lat: 40.4168, lon: -3.7038 },
        { name: 'Paris', country: 'Francia', flag: '🇫🇷', lat: 48.8566, lon: 2.3522 },
        { name: 'Berlin', country: 'Alemania', flag: '🇩🇪', lat: 52.5200, lon: 13.4050 },
        { name: 'Rome', country: 'Italia', flag: '🇮🇹', lat: 41.9028, lon: 12.4964 },
        { name: 'London', country: 'Reino Unido', flag: '🇬🇧', lat: 51.5074, lon: -0.1278 }
      ],
      'North America': [
        { name: 'New York', country: 'Estados Unidos', flag: '🇺🇸', lat: 40.7128, lon: -74.0060 },
        { name: 'Mexico City', country: 'México', flag: '🇲🇽', lat: 19.4326, lon: -99.1332 },
        { name: 'Toronto', country: 'Canadá', flag: '🇨🇦', lat: 43.6532, lon: -79.3832 },
        { name: 'Los Angeles', country: 'Estados Unidos', flag: '🇺🇸', lat: 34.0522, lon: -118.2437 }
      ]
    }

    // Determinar región basada en coordenadas
    let region = 'South America'
    if (detectedCity.lat > 30) region = 'North America'
    if (detectedCity.lat > 35 && detectedCity.lon > -10) region = 'Europe'

    const cities = cityDatabase[region] || cityDatabase['South America']

    // Calcular distancias y ordenar
    const citiesWithDistance = cities.map(city => {
      const distance = Math.round(
        Math.sqrt(
          Math.pow(city.lat - detectedCity.lat, 2) + 
          Math.pow(city.lon - detectedCity.lon, 2)
        ) * 111
      )
      return { ...city, distance }
    }).sort((a, b) => a.distance - b.distance)

    res.status(200).json(citiesWithDistance)
  } catch (error) {
    res.status(500).json({ error: 'Error cargando ciudades cercanas' })
  }
}