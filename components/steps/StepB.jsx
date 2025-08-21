import { useSelector, useDispatch } from 'react-redux'
import { updateStepB, nextStep, prevStep } from '../../store/tourSlice'

export default function StepB() {
  const dispatch = useDispatch()
  const { stepB, stepA } = useSelector(state => state.tour)

  // Calcular horas disponibles por día
  const getAvailableHoursPerDay = () => {
    if (!stepA.inicioTour || !stepA.finTour) return null
    
    const inicio = new Date(stepA.inicioTour)
    const fin = new Date(stepA.finTour)
    const diffMs = fin - inicio
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = diffMs / (1000 * 60 * 60)
    
    return diffDays > 0 ? diffHours / diffDays : diffHours
  }

  const horasPorDia = getAvailableHoursPerDay()

  // Determinar qué opciones están disponibles
  const isOptionAvailable = (option) => {
    if (!horasPorDia || option.value === 'flexible') return true
    
    const ranges = {
      '2-3h': { min: 2, max: 3 },
      '4-5h': { min: 4, max: 5 },
      '6-7h': { min: 6, max: 7 },
      '8-10h': { min: 8, max: 10 }
    }
    
    const range = ranges[option.value]
    return range ? horasPorDia >= range.min : true
  }

  const tipoExperienciaOptions = [
    'cultural', 'gastronomica', 'aventura', 'relajacion', 'nocturna', 'naturaleza'
  ]

  const intensidadOptions = [
    'relajado', 'moderado', 'activo', 'intenso'
  ]

  const duracionOptions = [
    { value: '2-3h', label: '2-3H' },
    { value: '4-5h', label: '4-5H' },
    { value: '6-7h', label: '6-7H' },
    { value: '8-10h', label: '8-10H' },
    { value: 'flexible', label: 'FLEXIBLE (IA optimiza tiempos diarios)' }
  ]

  const handleExperienciaChange = (experiencia) => {
    const newExperiencias = stepB.tipoExperiencia?.includes(experiencia)
      ? stepB.tipoExperiencia.filter(e => e !== experiencia)
      : [...(stepB.tipoExperiencia || []), experiencia]
    
    dispatch(updateStepB({ tipoExperiencia: newExperiencias }))
  }

  const handleNext = () => {
    if (stepB.tipoExperiencia?.length > 0 && stepB.intensidad && stepB.duracionPreferida) {
      dispatch(nextStep())
    }
  }

  return (
    <div className="step-content">
      <h2>🎯 Experiencia Deseada</h2>
      
      <div className="form-group">
        <label>Tipo de experiencia (selecciona varias):</label>
        <div className="checkbox-group">
          {tipoExperienciaOptions.map(experiencia => (
            <label key={experiencia} className="checkbox-label">
              <input
                type="checkbox"
                checked={stepB.tipoExperiencia?.includes(experiencia) || false}
                onChange={() => handleExperienciaChange(experiencia)}
              />
              {experiencia.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Intensidad del tour:</label>
        <select 
          value={stepB.intensidad || ''} 
          onChange={(e) => dispatch(updateStepB({ intensidad: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {intensidadOptions.map(option => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Horas diarias de actividades:</label>
        <select 
          value={stepB.duracionPreferida || ''} 
          onChange={(e) => dispatch(updateStepB({ duracionPreferida: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {duracionOptions.map(option => {
            const available = isOptionAvailable(option)
            return (
              <option 
                key={option.value} 
                value={option.value}
                disabled={!available}
                style={{ color: available ? 'inherit' : '#999' }}
              >
                {option.label}
              </option>
            )
          })}
        </select>
      </div>

      <div className="step-actions">
        <button onClick={() => dispatch(prevStep())} className="prev-btn">
          Anterior
        </button>
        <button 
          onClick={handleNext}
          disabled={!stepB.tipoExperiencia?.length || !stepB.intensidad || !stepB.duracionPreferida}
          className="next-btn"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}