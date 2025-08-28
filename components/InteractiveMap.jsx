import { useDispatch, useSelector } from 'react-redux'
import { setSelectedCoordinates } from '../store/tourSlice'

export default function InteractiveMap() {
  const dispatch = useDispatch()
  const { detectedCity, selectedCity, stepE } = useSelector(state => state.tour)

  const city = selectedCity || detectedCity
  if (!city) return null

  const handleSelect = () => {
    dispatch(setSelectedCoordinates({
      coordinates: { lat: city.lat, lon: city.lon },
      city: city.name || city.city
    }))
  }

  return (
    <div className="interactive-map">
      <h3>📍 Punto de inicio</h3>
      <p>Ciudad: {city.name || city.city}</p>
      <p>Coordenadas: {city.lat?.toFixed(4)}, {city.lon?.toFixed(4)}</p>
      
      <button 
        onClick={handleSelect}
        style={{ 
          padding: '12px 24px', 
          background: '#3498db', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Usar esta ubicación como punto de inicio
      </button>
      
      {stepE.coordenadasSeleccionadas && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#d5f4e6', borderRadius: '8px' }}>
          <h4>✅ Punto seleccionado: {stepE.ciudadSeleccionada}</h4>
        </div>
      )}
    </div>
  )
}