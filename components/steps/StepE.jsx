import { useSelector, useDispatch } from 'react-redux'
import { updateStepE, prevStep, generateTour } from '../../store/tourSlice'

export default function StepE() {
  const dispatch = useDispatch()
  const { stepA, stepB, stepC, stepD, stepE, loading, selectedCity, detectedCity } = useSelector(state => state.tour)
  
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

  const ubicacionesComunes = [
    { nombre: 'Centro de la Ciudad', coordenadas: { lat: targetCity?.lat || -33.4372, lon: targetCity?.lon || -70.6506 } },
    { nombre: 'Zona Comercial', coordenadas: { lat: (targetCity?.lat || -33.4372) + 0.02, lon: (targetCity?.lon || -70.6506) + 0.1 } },
    { nombre: 'Área Residencial', coordenadas: { lat: (targetCity?.lat || -33.4372) + 0.01, lon: (targetCity?.lon || -70.6506) + 0.04 } },
    { nombre: 'Zona Turística', coordenadas: { lat: (targetCity?.lat || -33.4372) - 0.02, lon: (targetCity?.lon || -70.6506) + 0.03 } }
  ]

  const handleUbicacionSelect = (ubicacion) => {
    dispatch(updateStepE({
      ubicacionInicio: {
        tipo: 'punto_referencia',
        direccion: ubicacion.nombre,
        coordenadas: ubicacion.coordenadas
      }
    }))
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
    <div className="step-content">
      <h2>Ubicación de Inicio en {targetCity?.name || 'la ciudad'}</h2>
      
      <div className="form-group">
        <label>Selecciona tu punto de partida:</label>
        <div className="location-options">
          {ubicacionesComunes.map(ubicacion => (
            <button
              key={ubicacion.nombre}
              className={`location-btn ${
                stepE.ubicacionInicio?.direccion?.includes(ubicacion.nombre) ? 'selected' : ''
              }`}
              onClick={() => handleUbicacionSelect(ubicacion)}
            >
              📍 {ubicacion.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>O ingresa una dirección específica:</label>
        <input
          type="text"
          placeholder="Ej: Hotel Central, Centro de la Ciudad"
          value={stepE.ubicacionInicio?.direccion || ''}
          onChange={(e) => dispatch(updateStepE({
            ubicacionInicio: {
              tipo: 'direccion_custom',
              direccion: e.target.value,
              coordenadas: { lat: targetCity?.lat || -33.4372, lon: targetCity?.lon || -70.6506 }
            }
          }))}
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