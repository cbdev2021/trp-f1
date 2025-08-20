export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userData, sessionId } = req.body

    // Usar los campos datetime simplificados
    const fechaHoraInicio = userData.inicioTour || new Date().toISOString().slice(0, 16)
    const fechaHoraFin = userData.finTour || new Date(Date.now() + 8*60*60*1000).toISOString().slice(0, 16)
    
    const ciudad = userData.selectedCity || userData.detectedCity
    const puntoInicio = userData.ubicacionInicio

    const prompt = `IMPORTANTE: Debes crear una ruta turística que COMIENCE OBLIGATORIAMENTE en el punto seleccionado por el usuario.

DATOS DEL TOUR:
- CIUDAD: ${ciudad?.city || ciudad?.name}, ${ciudad?.country}
- PUNTO DE INICIO OBLIGATORIO: ${puntoInicio?.direccion}
- COORDENADAS INICIO: ${puntoInicio?.coordenadas?.lat || ciudad?.lat}, ${puntoInicio?.coordenadas?.lon || ciudad?.lon}
- FECHA/HORA: ${fechaHoraInicio} hasta ${fechaHoraFin}
- VIAJERO: ${userData.demografia}, presupuesto ${userData.presupuesto}
- INTERESES: ${userData.interesesDetallados?.join(', ')}
- TRANSPORTE: ${userData.transporte}

Crea una ruta de 4-6 puntos que INICIE en "${puntoInicio?.direccion}" y visite lugares relacionados con los intereses del usuario.

RESPONDE SOLO JSON:
{
  "titulo": "Tour por ${ciudad?.city || ciudad?.name}",
  "duracion": "1 día",
  "ruta": [
    {
      "orden": 1,
      "nombre": "${puntoInicio?.direccion || 'Punto de Inicio'}",
      "tipo": "${puntoInicio?.categoria || 'punto de inicio'}",
      "tiempo": "${fechaHoraInicio.split('T')[1] || '09:00'}-${fechaHoraInicio.split('T')[1] || '09:30'}",
      "descripcion": "${puntoInicio?.descripcion || 'Punto de partida del recorrido'}",
      "coordenadas": {"lat": ${puntoInicio?.coordenadas?.lat || ciudad?.lat || -33.4521}, "lon": ${puntoInicio?.coordenadas?.lon || ciudad?.lon || -70.6536}},
      "costo_estimado": "$0",
      "duracion_min": 30
    }
  ],
  "costo_total_estimado": "$25000",
  "transporte_total_min": 45,
  "consejos": ["Comenzar puntualmente en ${puntoInicio?.direccion}", "Llevar agua"]
}`

    const response = await fetch('https://primary-production-e9dc.up.railway.app/webhook/postman-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatInput: prompt,
        sessionId: sessionId || `tour-${Date.now()}`
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Procesar la respuesta para extraer JSON válido
    let tourData
    try {
      if (data.output) {
        // Intentar parsear directamente
        tourData = JSON.parse(data.output)
      } else {
        // Si no hay output, crear estructura básica
        tourData = {
          titulo: `Tour por ${ciudad?.city || ciudad?.name}`,
          duracion: "1 día",
          ruta: [{
            orden: 1,
            nombre: puntoInicio?.direccion || "Punto de inicio",
            tipo: puntoInicio?.categoria || "punto de inicio",
            tiempo: `${fechaHoraInicio.split('T')[1] || '09:00'}-${fechaHoraInicio.split('T')[1] || '09:30'}`,
            descripcion: puntoInicio?.descripcion || "Punto de partida del recorrido",
            coordenadas: { 
              lat: puntoInicio?.coordenadas?.lat || ciudad?.lat || -33.4521, 
              lon: puntoInicio?.coordenadas?.lon || ciudad?.lon || -70.6536 
            },
            costo_estimado: "$0",
            duracion_min: 30
          }],
          costo_total_estimado: "$25000",
          transporte_total_min: 45,
          consejos: [`Comenzar puntualmente en ${puntoInicio?.direccion}`, "Llevar agua"]
        }
      }
    } catch (error) {
      // Fallback con datos básicos
      tourData = {
        titulo: `Tour por ${ciudad?.city || ciudad?.name}`,
        duracion: "1 día",
        ruta: [{
          orden: 1,
          nombre: puntoInicio?.direccion || "Punto de inicio",
          tipo: puntoInicio?.categoria || "punto de inicio",
          tiempo: `${fechaHoraInicio.split('T')[1] || '09:00'}-${fechaHoraInicio.split('T')[1] || '09:30'}`,
          descripcion: puntoInicio?.descripcion || "Punto de partida del recorrido",
          coordenadas: { 
            lat: puntoInicio?.coordenadas?.lat || ciudad?.lat || -33.4521, 
            lon: puntoInicio?.coordenadas?.lon || ciudad?.lon || -70.6536 
          },
          costo_estimado: "$0",
          duracion_min: 30
        }],
        costo_total_estimado: "$25000",
        transporte_total_min: 45,
        consejos: [`Comenzar puntualmente en ${puntoInicio?.direccion}`, "Llevar agua"]
      }
    }
    
    res.status(200).json(tourData)
  } catch (error) {
    console.error('Tour generation error:', error)
    res.status(500).json({ error: 'Error generating tour' })
  }
}