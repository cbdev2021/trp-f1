import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { selectCity, setSelectedCoordinates } from '../store/tourSlice'
import ClickableMap from '../components/ClickableMap'

export default function CitySelector() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { detectedCity, selectedCity, stepE } = useSelector(state => state.tour)
  const [loadingGeocode, setLoadingGeocode] = useState(false)

  useEffect(() => {
    if (!detectedCity) {
      // Si no hay ciudad detectada, redirigir al inicio
      router.push('/')
      return
    }
  }, [detectedCity, router])

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
    // Si hay un punto seleccionado, extraer la ciudad de las coordenadas
    if (stepE.coordenadasSeleccionadas && stepE.ciudadSeleccionada) {
      const parts = stepE.ciudadSeleccionada.split(', ')
      const cityFromPoint = parts[parts.length - 2] || parts[parts.length - 1] || parts[0]
      return `Continuar en ${cityFromPoint}`
    }
    
    // Si hay ciudad seleccionada manualmente
    if (selectedCity) {
      return `Continuar en ${selectedCity.name}`
    }
    
    // Fallback a ciudad detectada
    return `Continuar en ${detectedCity.city}`
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
              
              // Extraer ciudad del address para usarla en el tour
              const parts = address.split(', ')
              const cityFromAddress = parts[parts.length - 2] || parts[parts.length - 1] || parts[0]
              const countryFromAddress = parts[parts.length - 1] || 'País'
              
              // Crear objeto de ciudad basado en el punto seleccionado
              const cityFromPoint = {
                city: cityFromAddress,
                name: cityFromAddress,
                country: countryFromAddress,
                lat: coords.lat,
                lon: coords.lng
              }
              
              // Actualizar la ciudad seleccionada basada en el punto
              console.log('🏙️ CIUDAD EXTRAÍDA DEL PUNTO:', cityFromPoint)
              dispatch(selectCity(cityFromPoint))
              
              dispatch(setSelectedCoordinates({
                coordinates: { lat: coords.lat, lon: coords.lng },
                city: address,
                specificLocation: data.specificLocation || '',
                startingPointTitle
              }))
            } catch (error) {
              const address = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
              
              // Crear ciudad genérica para coordenadas sin geocoding
              const genericCity = {
                city: 'Ubicación seleccionada',
                name: 'Ubicación seleccionada', 
                country: 'País',
                lat: coords.lat,
                lon: coords.lng
              }
              
              console.log('🏙️ CIUDAD GENÉRICA:', genericCity)
              dispatch(selectCity(genericCity))
              
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
        
        {/* {!loadingGeocode && stepE.coordenadasSeleccionadas && (
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
        )} */}

        {!loadingGeocode && stepE.coordenadasSeleccionadas && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{ color: '#27ae60', marginBottom: '10px', textAlign: 'left' }}>
              {/* 📍 Formato Profesional: */}
              📍 Punto de partida seleccionado:
            </h4>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1rem', color: '#2c3e50', fontWeight: '600', marginBottom: '5px' }}>
                📍 {stepE.specificLocation || 'Ubicación seleccionada'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#555', fontWeight: '500', marginBottom: '3px' }}>
                🏢 {stepE.ciudadSeleccionada}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: '500' }}>
                📍 {(() => {
                  const parts = stepE.ciudadSeleccionada?.split(', ') || []
                  const city = parts[parts.length - 2] || 'Ciudad'
                  const region = parts[parts.length - 1] || 'Región'
                  return `${city}, ${region}`
                })()}
              </div>
            </div>
            <p style={{ margin: '8px 0 0 0', color: '#7f8c8d', fontSize: '0.75rem', fontFamily: 'monospace', textAlign: 'left' }}>
              {stepE.coordenadasSeleccionadas.lat.toFixed(6)}, {stepE.coordenadasSeleccionadas.lon.toFixed(6)}
            </p>
          </div>
        )}

        {/* {!loadingGeocode && stepE.coordenadasSeleccionadas && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#f0f8ff', 
            borderRadius: '8px',
            border: '1px solid #4a90e2'
          }}>
            <h4 style={{ color: '#2c5aa0', marginBottom: '10px', textAlign: 'left' }}>
              🏁 Formato Inicio de Tour:
            </h4>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.1rem', color: '#2c3e50', fontWeight: '600', marginBottom: '4px' }}>
                🏢 {stepE.specificLocation || 'Punto de Inicio'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                📍 {(() => {
                  const parts = stepE.ciudadSeleccionada?.split(', ') || []
                  const locality = parts[parts.length - 3] || parts[0] || 'Santiago Centro'
                  return locality
                })()}, Santiago
              </div>
            </div>
          </div>
        )} */}
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