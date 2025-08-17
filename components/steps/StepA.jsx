import { useSelector, useDispatch } from 'react-redux'
import { updateStepA, nextStep } from '../../store/tourSlice'

export default function StepA() {
  const dispatch = useDispatch()
  const { stepA, detectedCity } = useSelector(state => state.tour)

  const demografiaOptions = [
    'solo', 'pareja', 'familia', 'adulto_mayor', 'grupo_amigos'
  ]

  const presupuestoOptions = [
    'economico', 'medio', 'alto', 'premium'
  ]

  const calculateDuration = () => {
    if (!stepA.ventanaHoraria.inicio || !stepA.ventanaHoraria.fin) return 0
    const [startH, startM] = stepA.ventanaHoraria.inicio.split(':').map(Number)
    const [endH, endM] = stepA.ventanaHoraria.fin.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM
    return endMinutes - startMinutes
  }

  const duration = calculateDuration()
  const isValidDuration = duration >= 120 // Mínimo 2 horas

  const handleNext = () => {
    if (stepA.demografia && stepA.presupuesto && stepA.ventanaHoraria.inicio && stepA.ventanaHoraria.fin && isValidDuration) {
      dispatch(nextStep())
    }
  }

  return (
    <div className="step-content">
      <h2>Datos Básicos del Viaje</h2>
      {detectedCity && (
        <div className="city-message">
          <p>🌍 Hemos detectado que te encuentras en <strong>{detectedCity.city}, {detectedCity.country}</strong>. Puedes crear tu recorrido aquí o en cualquier ciudad del mundo que desees explorar.</p>
        </div>
      )}
      
      <div className="form-group">
        <label>Tipo de viajero:</label>
        <select 
          value={stepA.demografia} 
          onChange={(e) => dispatch(updateStepA({ demografia: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {demografiaOptions.map(option => (
            <option key={option} value={option}>
              {option.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Presupuesto:</label>
        <select 
          value={stepA.presupuesto} 
          onChange={(e) => dispatch(updateStepA({ presupuesto: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {presupuestoOptions.map(option => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Hora de inicio:</label>
        <input
          type="time"
          value={stepA.ventanaHoraria.inicio}
          onChange={(e) => dispatch(updateStepA({ 
            ventanaHoraria: { ...stepA.ventanaHoraria, inicio: e.target.value }
          }))}
        />
      </div>

      <div className="form-group">
        <label>Hora de término:</label>
        <input
          type="time"
          value={stepA.ventanaHoraria.fin}
          onChange={(e) => dispatch(updateStepA({ 
            ventanaHoraria: { ...stepA.ventanaHoraria, fin: e.target.value }
          }))}
        />
      </div>

      {duration > 0 && duration < 120 && (
        <div className="warning-message">
          ⚠️ Se requiere mínimo 2 horas para generar una ruta (actual: {Math.floor(duration/60)}h {duration%60}m)
        </div>
      )}

      <button 
        onClick={handleNext}
        disabled={!stepA.demografia || !stepA.presupuesto || !stepA.ventanaHoraria.inicio || !stepA.ventanaHoraria.fin || !isValidDuration}
        className="next-btn"
      >
        Siguiente
      </button>
    </div>
  )
}