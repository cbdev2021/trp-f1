export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { city, userPreferences } = req.body
    const existingPoints = userPreferences?.existingPoints || []

    const sessionId = `ref-${city.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const prompt = `Eres experto en ${city.name}, ${city.country}. 

COORDENADAS DE REFERENCIA: ${city.lat}, ${city.lon}

${existingPoints.length > 0 ? `PROHIBIDO repetir: ${existingPoints.join(', ')}` : ''}

Genera 6 lugares turísticos REALES y DIFERENTES de ${city.name}:
- Históricos/culturales
- Parques/naturaleza  
- Comerciales/mercados
- Miradores/vistas
- Barrios característicos
- Transporte/estaciones

CRITICO - COORDENADAS:
- Usa coordenadas REALES verificadas
- Máximo ±0.05 grados de ${city.lat}, ${city.lon}
- Formato decimal con 6 decimales
- Ejemplo: -33.437222, -70.650556

JSON únicamente:
{
  "puntos": [
    {
      "nombre": "nombre exacto del lugar",
      "descripcion": "descripción breve",
      "tipo": "categoría",
      "direccion": "dirección completa real",
      "coordenadas": {"lat": -33.437222, "lon": -70.650556},
      "icono": "🏛️"
    }
  ]
}`

    const response = await fetch('https://primary-production-e9dc.up.railway.app/webhook/postman-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: prompt,
        sessionId: sessionId
      })
    })

    const data = await response.json()
    
    let result
    try {
      result = JSON.parse(data.output)
      
      // Validar y corregir coordenadas
      if (result.puntos) {
        result.puntos = result.puntos.map(punto => {
          const lat = parseFloat(punto.coordenadas?.lat)
          const lon = parseFloat(punto.coordenadas?.lon)
          
          // Validar que las coordenadas sean números válidos
          if (isNaN(lat) || isNaN(lon)) {
            console.warn(`Coordenadas inválidas para ${punto.nombre}, usando coordenadas de ciudad`)
            return {
              ...punto,
              coordenadas: { 
                lat: parseFloat(city.lat), 
                lon: parseFloat(city.lon) 
              }
            }
          }
          
          // Validar que estén dentro del rango de la ciudad (±0.1 grados)
          const latDiff = Math.abs(lat - parseFloat(city.lat))
          const lonDiff = Math.abs(lon - parseFloat(city.lon))
          
          if (latDiff > 0.1 || lonDiff > 0.1) {
            console.warn(`Coordenadas muy lejanas para ${punto.nombre}, ajustando`)
            return {
              ...punto,
              coordenadas: { 
                lat: parseFloat(city.lat) + (Math.random() - 0.5) * 0.02,
                lon: parseFloat(city.lon) + (Math.random() - 0.5) * 0.02
              }
            }
          }
          
          return {
            ...punto,
            coordenadas: { lat, lon }
          }
        })
      }
    } catch (parseError) {
      return res.status(500).json({ error: 'IA no generó respuesta válida' })
    }

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Error procesando solicitud' })
  }
}