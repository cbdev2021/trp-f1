import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { updateStepA, nextStep } from '../../store/tourSlice'

export default function StepA() {
  const dispatch = useDispatch()
  const { stepA, detectedCity } = useSelector(state => state.tour)

  // Establecer valores por defecto si no existen
  useEffect(() => {
    if (!stepA.inicioTour) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      dispatch(updateStepA({ inicioTour: tomorrow.toISOString().slice(0, 16) }))
    }
    if (!stepA.finTour) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(18, 0, 0, 0)
      dispatch(updateStepA({ finTour: tomorrow.toISOString().slice(0, 16) }))
    }
  }, [])

  const demografiaOptions = [
    'solo', 'pareja', 'familia', 'adulto_mayor', 'grupo_amigos'
  ]

  const presupuestoOptions = [
    'economico', 'medio', 'alto', 'premium'
  ]
  
  const tipoRutaOptions = [
    { value: 'ciudad_local', label: 'Solo en esta ciudad' },
    { value: 'multi_ciudades', label: 'Incluir ciudades cercanas' }
  ]

  const calculateDuration = () => {
    if (!stepA.inicioTour || !stepA.finTour) return 0
    const start = new Date(stepA.inicioTour)
    const end = new Date(stepA.finTour)
    return Math.floor((end - start) / (1000 * 60)) // minutos
  }

  const duration = calculateDuration()
  const isValidDuration = duration >= 120 // Mínimo 2 horas

  const handleNext = () => {
    const requiredFields = stepA.demografia && stepA.presupuesto && 
                          stepA.inicioTour && stepA.finTour && stepA.tipoRuta && isValidDuration
    if (requiredFields) {
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
        <label>Inicio del tour:</label>
        <input
          type="datetime-local"
          value={stepA.inicioTour || ''}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => dispatch(updateStepA({ inicioTour: e.target.value }))}
        />
      </div>
      
      <div className="form-group">
        <label>Fin del tour:</label>
        <input
          type="datetime-local"
          value={stepA.finTour || ''}
          min={stepA.inicioTour || new Date().toISOString().slice(0, 16)}
          onChange={(e) => dispatch(updateStepA({ finTour: e.target.value }))}
        />
      </div>
      
      <div className="form-group">
        <label>Tipo de ruta:</label>
        <select 
          value={stepA.tipoRuta || ''} 
          onChange={(e) => dispatch(updateStepA({ tipoRuta: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {tipoRutaOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {duration > 0 && duration < 120 && (
        <div className="warning-message">
          ⚠️ Se requiere mínimo 2 horas para generar una ruta (actual: {Math.floor(duration/60)}h {duration%60}m)
        </div>
      )}

      <button 
        onClick={handleNext}
        disabled={!stepA.demografia || !stepA.presupuesto || !stepA.inicioTour || !stepA.finTour || !stepA.tipoRuta || !isValidDuration}
        className="next-btn"
      >
        Siguiente
      </button>
    </div>
  )
}