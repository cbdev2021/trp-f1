import { useSelector, useDispatch } from 'react-redux'
import { updateStepC, nextStep, prevStep } from '../../store/tourSlice'

export default function StepC() {
  const dispatch = useDispatch()
  const { stepC } = useSelector(state => state.tour)

  const restriccionesOptions = [
    'movilidad', 'ninos', 'alergias', 'vegetariano', 'accesibilidad'
  ]

  const transporteOptions = [
    'caminata', 'bicicleta', 'transporte_publico', 'vehiculo_propio', 'taxi_uber'
  ]

  const handleRestriccionChange = (restriccion) => {
    const newRestricciones = stepC.restricciones.includes(restriccion)
      ? stepC.restricciones.filter(r => r !== restriccion)
      : [...stepC.restricciones, restriccion]
    
    dispatch(updateStepC({ restricciones: newRestricciones }))
  }

  const handleNext = () => {
    if (stepC.transporte) {
      dispatch(nextStep())
    }
  }

  return (
    <div className="step-content">
      <h2>Contexto y Condiciones</h2>
      
      <div className="form-group">
        <label>Restricciones o necesidades especiales:</label>
        <div className="checkbox-group">
          {restriccionesOptions.map(restriccion => (
            <label key={restriccion} className="checkbox-label">
              <input
                type="checkbox"
                checked={stepC.restricciones.includes(restriccion)}
                onChange={() => handleRestriccionChange(restriccion)}
              />
              {restriccion.replace('_', ' ').toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Medio de transporte preferido:</label>
        <select 
          value={stepC.transporte} 
          onChange={(e) => dispatch(updateStepC({ transporte: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {transporteOptions.map(option => (
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
          disabled={!stepC.transporte}
          className="next-btn"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}