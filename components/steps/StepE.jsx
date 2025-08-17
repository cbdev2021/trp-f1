import { useSelector, useDispatch } from 'react-redux'
import { updateStepE, prevStep, generateTour, loadReferencePoints } from '../../store/tourSlice'
import { useState, useEffect } from 'react'

export default function StepE() {
  const dispatch = useDispatch()
  const { stepA, stepB, stepC, stepD, stepE, loading, selectedCity, detectedCity, referencePoints, referencePointsLoading } = useSelector(state => state.tour)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const targetCity = selectedCity || detectedCity
  
  const getTransportInfo = (transporte) => {
    const transporteInfo = {
      caminata: { icon: '🚶', tiempo: '5-15 min', descripcion: 'entre puntos cercanos' },
      bicicleta: { icon: '🚴', tiempo: '3-10 min', descripcion: 'entre puntos' },
      transporte_publico: { icon: '🚌', tiempo: '10-25 min', descripcion: 'incluyendo esperas' },
      vehiculo_propio: { icon: '🚗', tiempo: '5-20 min', descripcion: 'más estacionamiento' },
      taxi_uber: { icon: '🚕', tiempo: '5-15 min', descripcion: 'directo entre puntos' }
    }
    return transporteInfo[transporte] || transporteInfo.caminata
  }
  
  const transportInfo = getTransportInfo(stepC.transporte)

  // Cargar puntos referenciales iniciales
  useEffect(() => {
    if (targetCity && referencePoints.length === 0) {
      const userPreferences = {
        motivos: stepB.motivos,
        estilo: stepB.estilo,
        intereses: stepD.interesesDetallados,
        transporte: stepC.transporte
      }
      dispatch(loadReferencePoints({ city: targetCity, userPreferences }))
    }
  }, [targetCity, dispatch, stepB.motivos, stepB.estilo, stepD.interesesDetallados, stepC.transporte, referencePoints.length])
  
  const puntosReferenciales = referencePoints

  const handleUbicacionSelect = (ubicacion) => {
    dispatch(updateStepE({
      ubicacionInicio: {
        tipo: 'punto_referencia',
        direccion: ubicacion.nombre,
        coordenadas: ubicacion.coordenadas,
        descripcion: ubicacion.descripcion,
        categoria: ubicacion.tipo,
        direccionCompleta: ubicacion.direccion
      }
    }))
  }
  
  // Coordenadas para el mapa - simplificado
  const mapCoords = stepE.ubicacionInicio?.coordenadas || {
    lat: targetCity?.lat || -33.4372,
    lon: targetCity?.lon || -70.6506
  }
  
  const nextSlide = () => {
    if (currentIndex >= puntosReferenciales.length - 4) {
      // Cargar más puntos cuando esté cerca del final
      const userPreferences = {
        motivos: stepB.motivos,
        estilo: stepB.estilo,
        intereses: stepD.interesesDetallados,
        transporte: stepC.transporte,
        existingPoints: puntosReferenciales.map(p => p.nombre)
      }
      dispatch(loadReferencePoints({ city: targetCity, userPreferences }))
    }
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, puntosReferenciales.length - 3))
  }
  
  const prevSlide = () => {
    setCurrentIndex((prev) => prev === 0 ? Math.max(0, puntosReferenciales.length - 4) : prev - 1)
  }

  const handleGenerateTour = () => {
    const userData = {
      ...stepA,
      ...stepB,
      ...stepC,
      ...stepD,
      ...stepE,
      selectedCity,
      detectedCity
    }
    
    dispatch(generateTour(userData))
  }

  return (
    <div className="city-selector">
      <h2>📍 Ubicación de Inicio en {targetCity?.name || 'la ciudad'}</h2>
      
      {/* Mapa con puntos estratégicos */}
      <div className="map-section">
        <h2>🗺️ Puntos Estratégicos</h2>
        <div className="map-container">
          <iframe
            key={`${mapCoords.lat}-${mapCoords.lon}`}
            src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lon}&hl=es&z=15&output=embed`}
            width="100%"
            height="400"
            style={{ border: 'none', borderRadius: '12px' }}
            title={`Mapa de ${stepE.ubicacionInicio?.direccion || targetCity?.name}`}
            allowFullScreen
          />
        </div>
      </div>
      
      {/* Carousel de puntos referenciales */}
      <div className="cities-section">
        <h3>📍 Selecciona tu punto de partida</h3>
        {referencePointsLoading ? (
          <div className="loading-carousel">
            <div className="loading-spinner">🔄</div>
            <p>Consultando puntos estratégicos con IA...</p>
          </div>
        ) : puntosReferenciales.length > 0 ? (
          <div className="carousel-container">
            <button className="carousel-btn prev" onClick={prevSlide}>‹</button>
            
            <div className="cities-carousel">
              {puntosReferenciales.slice(currentIndex, currentIndex + 4).map(punto => (
                <div 
                  key={punto.nombre}
                  className={`city-card ${
                    stepE.ubicacionInicio?.direccion === punto.nombre ? 'selected' : ''
                  }`}
                  onClick={() => handleUbicacionSelect(punto)}
                >
                  <div className="city-flag">{punto.icono}</div>
                  <h4>{punto.nombre}</h4>
                  <p>{punto.tipo}</p>
                  <small>{punto.descripcion}</small>
                  {punto.direccion && (
                    <div className="point-address">
                      📍 {punto.direccion}
                    </div>
                  )}
                  <div className="point-coordinates">
                    🌍 {punto.coordenadas.lat.toFixed(4)}, {punto.coordenadas.lon.toFixed(4)}
                  </div>
                </div>
              ))}
              
              {referencePointsLoading && (
                <div className="city-card loading">
                  <div className="loading-spinner">🔄</div>
                  <p>Cargando más puntos...</p>
                </div>
              )}
            </div>
            
            <button className="carousel-btn next" onClick={nextSlide}>›</button>
          </div>
        ) : (
          <div className="no-points">
            <p>⚠️ No se pudieron cargar puntos referenciales</p>
          </div>
        )}
      </div>

      {/* Punto seleccionado */}
      {stepE.ubicacionInicio && (
        <div className="selected-city">
          <div className="selection-info">
            <p>📍 <strong>Punto de partida:</strong> {stepE.ubicacionInicio.direccion}</p>
            {stepE.ubicacionInicio.descripcion && (
              <p>{stepE.ubicacionInicio.descripcion}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Ubicación personalizada */}
      <div className="cities-section">
        <h3>✏️ O ingresa una dirección específica</h3>
        <input
          type="text"
          placeholder="Ej: Hotel Central, Centro de la Ciudad"
          value={stepE.ubicacionInicio?.tipo === 'direccion_custom' ? stepE.ubicacionInicio?.direccion || '' : ''}
          onChange={(e) => dispatch(updateStepE({
            ubicacionInicio: {
              tipo: 'direccion_custom',
              direccion: e.target.value,
              coordenadas: { lat: targetCity?.lat || -33.4372, lon: targetCity?.lon || -70.6506 }
            }
          }))}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>
      
      {stepC.transporte && (
        <div className="transport-info">
          <h4>🚀 Información de Traslados</h4>
          <div className="transport-details">
            <span className="transport-icon">{transportInfo.icon}</span>
            <div className="transport-text">
              <strong>{stepC.transporte.replace('_', ' ').toUpperCase()}</strong>
              <p>Tiempo aproximado: <strong>{transportInfo.tiempo}</strong> {transportInfo.descripcion}</p>
              <small>💡 La ruta se optimizará en línea recta para minimizar traslados</small>
            </div>
          </div>
        </div>
      )}

      <div className="step-actions">
        <button onClick={() => dispatch(prevStep())} className="prev-btn">
          Anterior
        </button>
        <button 
          onClick={handleGenerateTour}
          disabled={!stepE.ubicacionInicio || loading}
          className="generate-btn"
        >
          {loading ? '🔄 Generando Tour...' : '🚀 Generar Mi Tour'}
        </button>
      </div>
    </div>
  )
}