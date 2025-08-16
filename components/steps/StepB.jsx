import { useSelector, useDispatch } from 'react-redux'
import { updateStepB, nextStep, prevStep } from '../../store/tourSlice'

export default function StepB() {
  const dispatch = useDispatch()
  const { stepB } = useSelector(state => state.tour)

  const motivosOptions = [
    'naturaleza', 'cultura', 'historia', 'gastronomia', 
    'vida_nocturna', 'bohemio', 'aventura', 'relax'
  ]

  const estiloOptions = [
    'relajado', 'intensivo', 'aventurero', 'cultural'
  ]

  const handleMotivoChange = (motivo) => {
    const newMotivos = stepB.motivos.includes(motivo)
      ? stepB.motivos.filter(m => m !== motivo)
      : [...stepB.motivos, motivo]
    
    dispatch(updateStepB({ motivos: newMotivos }))
  }

  const handleNext = () => {
    if (stepB.motivos.length > 0 && stepB.estilo) {
      dispatch(nextStep())
    }
  }

  return (
    <div className="step-content">
      <h2>Preferencias Personales</h2>
      
      <div className="form-group">
        <label>Motivos del paseo (selecciona varios):</label>
        <div className="checkbox-group">
          {motivosOptions.map(motivo => (
            <label key={motivo} className="checkbox-label">
              <input
                type="checkbox"
                checked={stepB.motivos.includes(motivo)}
                onChange={() => handleMotivoChange(motivo)}
              />
              {motivo.replace('_', ' ').toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Estilo de viaje:</label>
        <select 
          value={stepB.estilo} 
          onChange={(e) => dispatch(updateStepB({ estilo: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {estiloOptions.map(option => (
            <option key={option} value={option}>
              {option.toUpperCase()}
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
          disabled={stepB.motivos.length === 0 || !stepB.estilo}
          className="next-btn"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}