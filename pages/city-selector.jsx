import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { loadNearbyCities, loadMoreCities, selectCity } from '../store/tourSlice'

export default function CitySelector() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { detectedCity, nearbyCities, selectedCity, citiesLoading } = useSelector(state => state.tour)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!detectedCity) {
      // Si no hay ciudad detectada, redirigir al inicio
      router.push('/')
      return
    }
    dispatch(loadNearbyCities(detectedCity))
  }, [detectedCity, dispatch, router])

  const handleCitySelect = (city) => {
    dispatch(selectCity(city))
  }

  const getMapCity = () => {
    return selectedCity || detectedCity
  }

  const handleContinue = () => {
    router.push('/tour-planner')
  }

  const nextSlide = () => {
    if (currentIndex >= nearbyCities.length - 4) {
      dispatch(loadMoreCities())
    }
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, nearbyCities.length - 3))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => prev === 0 ? Math.max(0, nearbyCities.length - 4) : prev - 1)
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
        <p>Redirigiendo...</p>
      </div>
    )
  }

  return (
    <div className="city-selector">
      <div className="map-section">
        <h2>📍 {selectedCity ? `Destino seleccionado: ${selectedCity.name}, ${selectedCity.country}` : `Tu ubicación: ${detectedCity.city}, ${detectedCity.country}`}</h2>
        <div className="map-container">
          <iframe
            key={`${getMapCity().lat}-${getMapCity().lon}`}
            src={`https://maps.google.com/maps?q=${getMapCity().lat},${getMapCity().lon}&hl=es&z=12&output=embed`}
            width="100%"
            height="300"
            style={{ border: 'none', borderRadius: '12px' }}
            title={`Mapa de ${getMapCity().name}`}
            allowFullScreen
          />
        </div>
      </div>

      <div className="cities-section">
        <h3>🌎 Explora ciudades cercanas o selecciona tu destino</h3>
        
        <div className="carousel-container">
          <button className="carousel-btn prev" onClick={prevSlide}>‹</button>
          
          <div className="cities-carousel">
            {nearbyCities.slice(currentIndex, currentIndex + 4).map((city, index) => (
              <div 
                key={`${city.name}-${city.country}`}
                className={`city-card ${selectedCity?.name === city.name ? 'selected' : ''}`}
                onClick={() => handleCitySelect(city)}
              >
                <div className="city-flag">{city.flag}</div>
                <h4>{city.name}</h4>
                <p>{city.country}</p>
                <span className="distance">{city.distance}km</span>
              </div>
            ))}
            
            {citiesLoading && (
              <div className="city-card loading">
                <div className="loading-spinner">🔄</div>
                <p>Cargando más ciudades...</p>
              </div>
            )}
          </div>
          
          <button className="carousel-btn next" onClick={nextSlide}>›</button>
        </div>

        <div className="selected-city">
          {selectedCity ? (
            <div className="selection-info">
              <p>✅ Has seleccionado: <strong>{selectedCity.name}, {selectedCity.country}</strong></p>
              <button className="continue-btn" onClick={handleContinue}>
                Crear tour en {selectedCity.name} →
              </button>
            </div>
          ) : (
            <div className="selection-info">
              <p>👆 Selecciona una ciudad para crear tu tour personalizado</p>
              <button className="continue-btn default" onClick={handleContinue}>
                Continuar con {detectedCity.city} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}