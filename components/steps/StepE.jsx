import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadStartingPoints, loadMoreStartingPoints, updateStepE, prevStep, generateTour } from '../../store/tourSlice'

export default function StepE() {
  const dispatch = useDispatch()
  const { detectedCity, startingPoints, selectedPoint, startingPointsLoading, stepA, stepB, stepC, stepD, stepE, loading, selectedCity } = useSelector(state => state.tour)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!detectedCity) {
      return
    }
    dispatch(loadStartingPoints({
      city: selectedCity || detectedCity,
      userPreferences: {
        motivos: stepB.motivos || [],
        estilo: stepB.estilo || 'relajado',
        interesesDetallados: stepD.interesesDetallados || [],
        transporte: stepC.transporte || 'caminata'
      }
    }))
  }, [detectedCity, dispatch])

  const handlePointSelect = (point) => {
    dispatch(updateStepE({
      ubicacionInicio: {
        tipo: 'punto_referencia',
        direccion: point.nombre,
        coordenadas: point.coordenadas,
        descripcion: point.descripcion,
        categoria: point.tipo
      }
    }))
  }

  const getMapPoint = () => {
    return stepE.ubicacionInicio || (selectedCity || detectedCity)
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

  const nextSlide = () => {
    if (currentIndex >= startingPoints.length - 4) {
      dispatch(loadMoreStartingPoints())
    }
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, startingPoints.length - 3))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => prev === 0 ? Math.max(0, startingPoints.length - 4) : prev - 1)
  }

  if (!detectedCity) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="city-selector">
      <div className="map-section">
        <h2>📍 {stepE.ubicacionInicio ? `Punto seleccionado: ${stepE.ubicacionInicio.direccion}` : `Selecciona punto de inicio en ${(selectedCity || detectedCity).name}`}</h2>
        <div className="map-container">
          <iframe
            key={`${getMapPoint().lat || getMapPoint().coordenadas?.lat}-${getMapPoint().lon || getMapPoint().coordenadas?.lon}`}
            src={`https://maps.google.com/maps?q=${getMapPoint().lat || getMapPoint().coordenadas?.lat},${getMapPoint().lon || getMapPoint().coordenadas?.lon}&hl=es&z=12&output=embed`}
            width="100%"
            height="300"
            style={{ border: 'none', borderRadius: '12px' }}
            title={`Mapa de ${getMapPoint().name || getMapPoint().direccion}`}
            allowFullScreen
          />
        </div>
      </div>

      <div className="cities-section">
        <h3>📍 Selecciona tu punto de partida</h3>
        
        <div className="carousel-container">
          <button className="carousel-btn prev" onClick={prevSlide}>‹</button>
          
          <div className="cities-carousel">
            {startingPoints.slice(currentIndex, currentIndex + 4).map((point, index) => (
              <div 
                key={`${point.nombre}-${point.tipo}`}
                className={`city-card ${stepE.ubicacionInicio?.direccion === point.nombre ? 'selected' : ''}`}
                onClick={() => handlePointSelect(point)}
              >
                <div className="city-flag">{point.icono}</div>
                <h4>{point.nombre}</h4>
                <p>{point.tipo}</p>
                <span className="distance">{point.direccion}</span>
              </div>
            ))}
            
            {startingPointsLoading && (
              <div className="city-card loading">
                <div className="loading-spinner">🔄</div>
                <p>Cargando más puntos...</p>
              </div>
            )}
          </div>
          
          <button className="carousel-btn next" onClick={nextSlide}>›</button>
        </div>

        <div className="selected-city">
          {stepE.ubicacionInicio ? (
            <div className="selection-info">
              <p>✅ Has seleccionado: <strong>{stepE.ubicacionInicio.direccion}</strong></p>
              <button className="continue-btn" onClick={handleGenerateTour}>
                {loading ? '🔄 Generando Tour...' : '🚀 Generar Mi Tour'}
              </button>
            </div>
          ) : (
            <div className="selection-info">
              <p>👆 Selecciona un punto de partida para tu tour</p>
              <button className="continue-btn default" onClick={() => dispatch(prevStep())}>
                ← Anterior
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}