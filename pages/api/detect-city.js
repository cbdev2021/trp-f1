export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { ip } = req.query
    
    // Obtener IP del cliente si no se proporciona
    const clientIp = ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '8.8.8.8'
    
    const response = await fetch(`https://api.ipgeolocation.io/timezone?apiKey=89fd5522156e4e39ad2a4ac9656f3921&ip=${clientIp}`)
    const data = await response.json()
    
    // Mapear ciudades conocidas
    const cityMap = {
      'Santiago': 'Santiago',
      'Buenos Aires': 'Buenos Aires', 
      'Lima': 'Lima',
      'Bogotá': 'Bogotá',
      'Mexico City': 'Ciudad de México',
      'São Paulo': 'São Paulo'
    }
    
    const detectedCity = cityMap[data.geo?.city] || data.geo?.city || 'Santiago'
    
    res.status(200).json({
      city: detectedCity,
      country: data.geo?.country || 'Chile',
      timezone: data.timezone
    })
  } catch (error) {
    // Fallback a Santiago si hay error
    res.status(200).json({
      city: 'Santiago',
      country: 'Chile', 
      timezone: 'America/Santiago'
    })
  }
}