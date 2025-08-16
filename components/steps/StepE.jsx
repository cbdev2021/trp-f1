import { useSelector, useDispatch } from 'react-redux'
import { updateStepE, prevStep, generateTour } from '../../store/tourSlice'

export default function StepE() {
  const dispatch = useDispatch()
  const { stepA, stepB, stepC, stepD, stepE, loading, selectedCity, detectedCity } = useSelector(state => state.tour)
  
  const targetCity = selectedCity || detectedCity

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