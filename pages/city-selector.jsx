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
  const [loadingGeocode, setLoadingGeocode] = useState(false)
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

  const parseAddress = (address) => {
    if (!address) return { country: '', city: '', locality: '', point: '' }
    
    const parts = address.split(', ')
    const country = parts[parts.length - 1] || ''
    const city = parts[parts.length - 2] || ''
    const locality = parts[parts.length - 3] || ''
    const point = parts.slice(0, -3).join(', ') || parts[0] || ''
    
    return { country, city, locality, point }
  }

  const getContinueButtonText = () => {
    if (selectedCity) {
      return `Continuar en ${selectedCity.name}`
    }
    return `Continuar en ${detectedCity.city}`
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
            setLoadingGeocode(true)
            try {
              const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: coords.lat, lon: coords.lng })
              })
              const data = await response.json()
              const address = data.city || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
              const startingPointTitle = data.specificLocation || (address.split(', ')[0]) || address
              
              dispatch(setSelectedCoordinates({
                coordinates: { lat: coords.lat, lon: coords.lng },
                city: address,
                specificLocation: data.specificLocation || '',
                startingPointTitle
              }))
            } catch (error) {
              const address = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
              dispatch(setSelectedCoordinates({
                coordinates: { lat: coords.lat, lon: coords.lng },
                city: address,
                specificLocation: '',
                startingPointTitle: address
              }))
            } finally {
              setLoadingGeocode(false)
            }
          }}
        />
        
        {loadingGeocode && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#e3f2fd', 
            borderRadius: '8px',
            border: '1px solid #2196f3',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '1.2rem' }}>🔄</div>
              <p style={{ margin: '0', color: '#1976d2', fontWeight: '500' }}>
                Obteniendo información de la ubicación seleccionada...
              </p>
            </div>
          </div>
        )}
        
        {!loadingGeocode && stepE.coordenadasSeleccionadas && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ color: '#27ae60', marginBottom: '10px', textAlign: 'left' }}>
              📍 Punto de partida seleccionado:
            </h4>
            <div style={{ textAlign: 'left' }}>
              {(() => {
                const { country, city, locality, point } = parseAddress(stepE.ciudadSeleccionada)
                return (
                  <>
                    {country && <div style={{ fontSize: '0.75rem', color: '#95a5a6', fontWeight: '500', marginBottom: '2px', textTransform: 'uppercase' }}>{country}</div>}
                    {city && <div style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: '500', marginBottom: '4px' }}>{city}</div>}
                    {locality && <div style={{ fontSize: '0.95rem', color: '#555', fontWeight: '500', marginBottom: '3px' }}>{locality}</div>}
                    <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600', lineHeight: '1.2' }}>🏢 {point}</div>
                  </>
                )
              })()} 
            </div>
            <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '0.8rem', fontFamily: 'monospace', textAlign: 'left' }}>
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
          {!stepE.coordenadasSeleccionadas && (
            <div className="selection-prompt">
              <div className="prompt-icon">📍</div>
              <p>Seleccione un punto de inicio para comenzar</p>
            </div>
          )}
          <div className="selection-info">
            <button 
              className="continue-btn" 
              onClick={handleContinue}
              disabled={!stepE.coordenadasSeleccionadas}
            >
              {getContinueButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}