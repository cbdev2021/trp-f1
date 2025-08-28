export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { lat, lon } = req.body

  try {
    // Usar Overpass API para buscar lugares específicos
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["name"](around:200,${lat},${lon});
        way["name"](around:200,${lat},${lon});
        relation["name"](around:200,${lat},${lon});
      );
      out center meta;
    `
    
    const overpassResponse = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(overpassQuery)}`
    })
    
    // Fallback a Nominatim
    const nominatimResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TourPlanner/1.0'
        }
      }
    )

    let overpassData = []
    if (overpassResponse.ok) {
      const overpassResult = await overpassResponse.json()
      overpassData = overpassResult.elements || []
    }
    
    if (!nominatimResponse.ok) {
      throw new Error('Geocoding failed')
    }

    const data = await nominatimResponse.json()
    
    // Extraer información detallada
    const address = data.address || {}
    const city = address.city || address.town || address.village || address.municipality || 'Ubicación desconocida'
    const country = address.country || ''
    
    // Extraer nombre del lugar específico (incluyendo cerros y parques)
    const placeName = data.name || address.name || address.amenity || address.shop || 
                     address.tourism || address.leisure || address.building || 
                     address.office || address.historic || address.natural || 
                     address.landuse || address.place_of_worship || address.restaurant || 
                     address.cafe || address.hotel || address.hospital || address.school || 
                     address.peak || address.hill || address.park || ''
    
    // Crear dirección legible
    const street = address.road || address.pedestrian || ''
    const houseNumber = address.house_number || ''
    const suburb = address.suburb || address.neighbourhood || ''
    
    let fullStreet = ''
    if (street) {
      fullStreet = houseNumber ? `${street} ${houseNumber}` : street
      if (suburb && suburb !== city) {
        fullStreet += `, ${suburb}`
      }
    }
    
    // Buscar lugar específico en Overpass primero
    let specificLocation = ''
    
    // Buscar el lugar más cercano con nombre en Overpass
    const namedPlace = overpassData
      .filter(element => element.tags && element.tags.name)
      .sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lon - lon, 2))
        const distB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lon - lon, 2))
        return distA - distB
      })[0]
    
    if (namedPlace && namedPlace.tags.name) {
      specificLocation = namedPlace.tags.name
    }
    // Priorizar lugar específico del resultado principal
    else if (placeName && placeName !== city) {
      specificLocation = placeName
    }
    // Luego calle principal
    else if (street) {
      if (houseNumber) {
        specificLocation = `${street} ${houseNumber}`
      } else {
        specificLocation = street
      }
    }
    // Finalmente sector/barrio
    else if (suburb && suburb !== city) {
      specificLocation = `Sector ${suburb}`
    }
    
    // Si no hay nada específico, mostrar coordenadas
    if (!specificLocation) {
      specificLocation = `Punto en ${lat.toFixed(4)}, ${lon.toFixed(4)}`
    }
    
    res.status(200).json({
      city: data.display_name || `${city}${country ? `, ${country}` : ''}`,
      specificLocation: specificLocation,
      coordinates: { lat, lon },
      debug: {
        rawData: data,
        overpassData: overpassData,
        placeName: placeName,
        street: street,
        suburb: suburb
      }
    })

  } catch (error) {
    console.error('Geocoding error:', error)
    res.status(200).json({
      city: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      specificLocation: `Punto en ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      coordinates: { lat, lon },
      debug: 'Error en geocoding'
    })
  }
}