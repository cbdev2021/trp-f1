import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { loadNearbyCities, loadMoreCities, selectCity, setSelectedCoordinates } from '../store/tourSlice'
import ClickableMap from '../components/ClickableMap'

export default function CitySelector() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { detectedCity, nearbyCities, selectedCity, citiesLoading, stepE } = useSelector(state => state.tour)
  const [currentIndex, setCurrentIndex] = useState(0)
  const previousCitiesLength = useRef(0)

  useEffect(() => {
    if (!detectedCity) {
      // Si no hay ciudad detectada, redirigir al inicio
      router.push('/')
      return
    }
    dispatch(loadNearbyCities(detectedCity))
  }, [detectedCity, dispatch, router])

  // Efecto para manejar nuevas ciudades cargadas
  useEffect(() => {
    if (nearbyCities.length > previousCitiesLength.current && previousCitiesLength.current > 0) {
      // Posicionar para mostrar la última ciudad anterior como primera visible
      const lastPreviousIndex = Math.max(0, previousCitiesLength.current - 1)
      setCurrentIndex(lastPreviousIndex)
    }
    previousCitiesLength.current = nearbyCities.length
  }, [nearbyCities.length])

  const handleCitySelect = (city) => {
    dispatch(selectCity(city))
  }

  const getMapCity = () => {
    return selectedCity || detectedCity
  }

  const handleContinue = () => {
    router.push('/tour-planner')
  }

  const getContinueButtonText = () => {
    if (stepE.coordenadasSeleccionadas && stepE.ciudadSeleccionada) {
      return `Continuar con ${stepE.ciudadSeleccionada} →`
    }
    if (selectedCity) {
      return `Crear tour en ${selectedCity.name} →`
    }
    return `Continuar con ${detectedCity.city} →`
  }

  const nextSlide = () => {
    const maxIndex = Math.max(0, nearbyCities.length - 4)
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1)
    } else if (currentIndex === maxIndex && !citiesLoading) {
      dispatch(loadMoreCities())
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
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
        <p>Haz clic en el mapa para seleccionar tu punto de inicio:</p>
        <ClickableMap 
          center={getMapCity()}
          onMapClick={async (coords) => {
            try {
              const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: coords.lat, lon: coords.lng })
              })
              const data = await response.json()
              dispatch(setSelectedCoordinates({
                coordinates: { lat: coords.lat, lon: coords.lng },
                city: data.city || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
                specificLocation: data.specificLocation || ''
              }))
            } catch (error) {
              dispatch(setSelectedCoordinates({
                coordinates: { lat: coords.lat, lon: coords.lng },
                city: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
                specificLocation: ''
              }))
            }
          }}
        />
        
        {stepE.coordenadasSeleccionadas && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ color: '#27ae60', marginBottom: '10px' }}>
              📍 Punto de partida seleccionado:
            </h4>
            <p style={{ margin: '5px 0', fontWeight: 'bold', color: '#2c3e50', fontSize: '1rem' }}>
              🏢 {stepE.ciudadSeleccionada}
            </p>
            <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '0.8rem', fontFamily: 'monospace' }}>
              Coordenadas: {stepE.coordenadasSeleccionadas.lat.toFixed(6)}, {stepE.coordenadasSeleccionadas.lon.toFixed(6)}
            </p>
            {stepE.specificLocation && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                background: '#e8f4fd', 
                borderRadius: '6px',
                borderLeft: '3px solid #3498db'
              }}>
                <p style={{ margin: '0', color: '#2c3e50', fontSize: '0.9rem', fontWeight: '500' }}>
                  📍 {stepE.specificLocation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="cities-section">
        <div className="selected-city">
          <div className="selection-info">
            {stepE.coordenadasSeleccionadas ? (
              <p>✅ Punto de inicio seleccionado: <strong>{stepE.ciudadSeleccionada}</strong></p>
            ) : selectedCity ? (
              <p>✅ Has seleccionado: <strong>{selectedCity.name}, {selectedCity.country}</strong></p>
            ) : (
              <p>👆 Selecciona una ciudad o haz clic en el mapa para elegir tu punto de inicio</p>
            )}
            <button className="continue-btn" onClick={handleContinue}>
              {getContinueButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}