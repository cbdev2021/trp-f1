export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { address, city } = req.body
    
    // Usar Google Maps Geocoding API (necesitas API key)
    const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
    
    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' })
    }

    const fullAddress = `${address}, ${city.name}, ${city.country}`
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${GOOGLE_MAPS_API_KEY}`
    )
    
    const data = await response.json()
    
    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return res.status(200).json({
        lat: location.lat,
        lon: location.lng,
        formatted_address: data.results[0].formatted_address
      })
    }
    
    return res.status(404).json({ error: 'Address not found' })
  } catch (error) {
    res.status(500).json({ error: 'Error geocoding address' })
  }
}