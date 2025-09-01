import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { eliminarPunto } from '../store/tourSlice'

export default function MapView() {
  const { rutaGenerada, rutaAprobada, stepE } = useSelector(state => state.tour)
  const dispatch = useDispatch()
  
  const cleanUndefinedText = (text) => {
    if (!text) return null
    return text.replace(/undefined\s*/gi, '').trim() || null
  }
  
  const getPointTitle = (punto) => {
    if (punto.orden === 1 && stepE.startingPointTitle) {
      return cleanUndefinedText(stepE.startingPointTitle) || stepE.startingPointTitle
    }
    const title = punto.nombre || punto.name || null
    return cleanUndefinedText(title) || title
  }
  const mapRef = useRef(null)
  const [selectedPoint, setSelectedPoint] = useState(0)
  const [selectedDay, setSelectedDay] = useState(1)

  if (!rutaGenerada) return null
  
  const isMultiCiudades = rutaGenerada.tipo_tour === 'multi_ciudades'
  
  // Obtener todos los puntos según el tipo de tour
  const getAllPoints = () => {
    if (isMultiCiudades && rutaGenerada.dias) {
      return rutaGenerada.dias.flatMap(dia => 
        dia.ruta?.map(punto => ({ ...punto, dia: dia.dia, ciudad: dia.ciudad })) || []
      )
    }
    return rutaGenerada.ruta || []
  }
  
  const allPoints = getAllPoints()

  // Generar URL de Google Maps con la ruta para caminar
  const generateMapsUrl = () => {
    if (allPoints.length === 0) return ''
    
    const origin = `${allPoints[0].coordenadas.lat},${allPoints[0].coordenadas.lon}`
    const destination = `${allPoints[allPoints.length - 1].coordenadas.lat},${allPoints[allPoints.length - 1].coordenadas.lon}`
    
    let url = `https://www.google.com/maps/dir/${origin}/${destination}`
    
    // Agregar waypoints intermedios si hay más de 2 puntos
    if (allPoints.length > 2) {
      const waypoints = allPoints.slice(1, -1).map(punto => 
        `${punto.coordenadas.lat},${punto.coordenadas.lon}`
      ).join('/')
      url = `https://www.google.com/maps/dir/${origin}/${waypoints}/${destination}`
    }
    
    // Agregar parámetro para modo caminata
    url += '?dirflg=w'
    
    return url
  }

  const generateEmbedUrl = (pointIndex = null) => {
    if (allPoints.length === 0) return ''
    
    if (pointIndex !== null && allPoints[pointIndex]) {
      // Mostrar punto específico usando el nombre del lugar para mayor precisión
      const point = allPoints[pointIndex]
      return `https://maps.google.com/maps?q=${encodeURIComponent(point.nombre)}&hl=es&z=17&output=embed`
    }
    
    // Vista general usando el nombre de la ciudad
    const ciudad = allPoints[0] ? (userData.selectedCity || userData.detectedCity) : null
    if (ciudad) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(ciudad.city || ciudad.name)}&hl=es&z=12&output=embed`
    }
    
    return ''
  }

  const handlePointClick = (index) => {
    setSelectedPoint(index)
  }

  // Acceso a userData para la vista general
  const userData = useSelector(state => state.tour)

  return (
    <div className="map-view">
      <h3>Mapa del Recorrido</h3>
      
      {!rutaAprobada ? (
        <div className="map-placeholder">
          <div className="map-info">
            📍 Vista Previa del Recorrido
            <p>Aprueba la ruta para ver el mapa interactivo con navegación</p>
            {isMultiCiudades && (
              <p>🌍 Tour de {rutaGenerada.duracion_dias} días</p>
            )}
          </div>
          
          <div className="map-points">
            {allPoints.map((punto, index) => (
              <div key={`${punto.dia || 1}-${punto.orden}`} className="map-point">
                <div className="point-marker">
                  <span className="point-number">{punto.orden}</span>
                </div>
                <div className="point-info">
                  <h4>{getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'}</h4>
                  {punto.dia && <p className="point-day">Día {punto.dia} - {punto.ciudad}</p>}
                  <p className="point-type">{punto.tipo}</p>
                  <p className="point-coords">
                    📍 {punto.coordenadas?.lat}, {punto.coordenadas?.lon}
                  </p>
                  <button 
                    onClick={() => dispatch(eliminarPunto(punto.orden))}
                    className="remove-point-btn"
                  >
                    ❌ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="interactive-map-container">
          <div className="map-header">
            <h4>🗺️ Ruta Interactiva Aprobada</h4>
            <p>Navega por tu recorrido personalizado</p>
          </div>
          <div className="embedded-map">
            <iframe
              key={selectedPoint} 
              src={generateEmbedUrl(selectedPoint)}
              width="100%"
              height="500"
              style={{ border: 'none', borderRadius: '12px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de la ruta turística"
            />
            <div className="map-overlay">
              <p>📍 {selectedPoint !== null ? `Punto ${selectedPoint + 1}: ${cleanUndefinedText(allPoints[selectedPoint]?.nombre) || allPoints[selectedPoint]?.nombre}` : `Vista general - ${allPoints.length} puntos`}</p>
              <small>{selectedPoint !== null ? 'Ubicación exacta del punto seleccionado' : 'Haz clic en los puntos de abajo para navegar'}</small>
            </div>
          </div>
          <div className="route-points">
            {rutaGenerada.dias_totales > 1 ? (
              // Carousel de días para tours multi-día
              <>
                <div className="day-carousel-header">
                  <h5>📍 Puntos por día:</h5>
                  <div className="day-selector">
                    {Array.from({ length: rutaGenerada.dias_totales }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setSelectedDay(i + 1)}
                        className={`day-btn ${selectedDay === i + 1 ? 'active' : ''}`}
                      >
                        Día {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="day-points-container">
                  {(() => {
                    const actividadesPorDia = rutaGenerada.actividades_por_dia || 5
                    const inicioIndice = (selectedDay - 1) * actividadesPorDia
                    const finIndice = Math.min(selectedDay * actividadesPorDia, allPoints.length)
                    const puntosDelDia = allPoints.slice(inicioIndice, finIndice)
                    
                    return (
                      <div className="points-list">
                        {puntosDelDia.map((punto, index) => {
                          const globalIndex = inicioIndice + index
                          return (
                            <div 
                              key={punto.orden} 
                              className={`route-point ${selectedPoint === globalIndex ? 'active' : ''}`}
                              onClick={() => handlePointClick(globalIndex)}
                            >
                              <span className="point-number">{punto.orden}</span>
                              <div className="point-details">
                                <strong>{getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'}</strong>
                                <small>{punto.tipo} • {punto.costo_estimado}</small>
                              </div>
                              <div className="point-action">
                                🗺️
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()} 
                </div>
              </>
            ) : (
              // Vista normal para tours de un día
              <>
                <h5>📍 Puntos de tu ruta:</h5>
                <div className="points-list">
                  {allPoints.map((punto, index) => (
                    <div 
                      key={punto.orden} 
                      className={`route-point ${selectedPoint === index ? 'active' : ''}`}
                      onClick={() => handlePointClick(index)}
                    >
                      <span className="point-number">{punto.orden}</span>
                      <div className="point-details">
                        <strong>{getPointTitle(punto) || cleanUndefinedText(punto.nombre || punto.name) || 'Punto de interés'}</strong>
                        <small>{punto.tipo} • {punto.costo_estimado}</small>
                      </div>
                      <div className="point-action">
                        🗺️
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="map-navigation">
              <button 
                onClick={() => setSelectedPoint(null)}
                className={`nav-btn ${selectedPoint === null ? 'active' : ''}`}
              >
                🌍 Vista General
              </button>
              {rutaGenerada.dias_totales > 1 ? (
                // Navegación por días para tours multi-día
                <div className="day-navigation">
                  <span className="nav-label">Día {selectedDay}:</span>
                  <div className="point-nav">
                    {(() => {
                      const actividadesPorDia = rutaGenerada.actividades_por_dia || 5
                      const inicioIndice = (selectedDay - 1) * actividadesPorDia
                      const finIndice = Math.min(selectedDay * actividadesPorDia, allPoints.length)
                      const puntosDelDia = allPoints.slice(inicioIndice, finIndice)
                      
                      return puntosDelDia.map((_, localIndex) => {
                        const globalIndex = inicioIndice + localIndex
                        return (
                          <button
                            key={globalIndex}
                            onClick={() => handlePointClick(globalIndex)}
                            className={`point-nav-btn ${selectedPoint === globalIndex ? 'active' : ''}`}
                          >
                            {globalIndex + 1}
                          </button>
                        )
                      })
                    })()} 
                  </div>
                </div>
              ) : (
                // Navegación normal para tours de un día
                <div className="point-nav">
                  {allPoints.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePointClick(index)}
                      className={`point-nav-btn ${selectedPoint === index ? 'active' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="map-controls">
            <button 
              onClick={() => window.open(generateMapsUrl(), '_blank')}
              className="open-in-maps-btn"
            >
              🗺️ Abrir Ruta en Google Maps
            </button>
          </div>
        </div>
      )}


      <div className="map-summary">
        <div className="summary-item">
          <span>📅 {isMultiCiudades ? `${rutaGenerada.duracion_dias} días` : 'Tour de 1 día'}</span>
        </div>
        <div className="summary-item">
          <span>💰 Costo: {rutaGenerada.costo_total_estimado || 'No disponible'}</span>
        </div>
        <div className="summary-item">
          <span>🌤️ {rutaGenerada.recomendaciones_clima || 'Buen clima'}</span>
        </div>
      </div>
    </div>
  )
}