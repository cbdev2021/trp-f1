import { useSelector, useDispatch } from 'react-redux'
import { updateStepB, nextStep, prevStep } from '../../store/tourSlice'

export default function StepB() {
  const dispatch = useDispatch()
  const { stepB } = useSelector(state => state.tour)

  const tipoExperienciaOptions = [
    'cultural', 'gastronomica', 'aventura', 'relajacion', 'nocturna', 'naturaleza'
  ]

  const intensidadOptions = [
    'relajado', 'moderado', 'activo', 'intenso'
  ]

  const duracionOptions = [
    '2-3h', '4-6h', 'dia_completo', 'varios_dias'
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
        <label>Duración preferida:</label>
        <select 
          value={stepB.duracionPreferida || ''} 
          onChange={(e) => dispatch(updateStepB({ duracionPreferida: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {duracionOptions.map(option => (
            <option key={option} value={option}>
              {option.replace('_', ' ').toUpperCase()}
            </option>
          ))}
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