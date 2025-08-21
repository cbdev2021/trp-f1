import { useSelector, useDispatch } from 'react-redux'
import { updateStepC, nextStep, prevStep } from '../../store/tourSlice'

export default function StepC() {
  const dispatch = useDispatch()
  const { stepC } = useSelector(state => state.tour)

  const interesesCategorizados = {
    cultura: ['museos', 'arte_urbano', 'arquitectura', 'historia', 'librerias'],
    gastronomia: ['restaurantes', 'mercados', 'cafes', 'cocina_local'],
    naturaleza: ['parques', 'miradores', 'jardines', 'senderos'],
    entretenimiento: ['musica_vivo', 'vida_nocturna', 'shopping', 'eventos']
  }

  const restriccionesOptions = [
    'movilidad', 'ninos', 'alergias', 'vegetariano', 'accesibilidad'
  ]

  const transporteOptions = [
    'caminata', 'bicicleta', 'transporte_publico', 'vehiculo_propio', 'taxi_uber'
  ]

  const ambienteOptions = [
    'interior', 'exterior', 'mixto'
  ]

  const handleInteresChange = (interes) => {
    const newIntereses = stepC.interesesEspecificos?.includes(interes)
      ? stepC.interesesEspecificos.filter(i => i !== interes)
      : [...(stepC.interesesEspecificos || []), interes]
    
    dispatch(updateStepC({ interesesEspecificos: newIntereses }))
  }

  const handleRestriccionChange = (restriccion) => {
    const newRestricciones = stepC.restricciones?.includes(restriccion)
      ? stepC.restricciones.filter(r => r !== restriccion)
      : [...(stepC.restricciones || []), restriccion]
    
    dispatch(updateStepC({ restricciones: newRestricciones }))
  }

  const handleNext = () => {
    if (stepC.transporte && stepC.interesesEspecificos?.length > 0) {
      dispatch(nextStep())
    }
  }

  return (
    <div className="step-content">
      <h2>⚙️ Preferencias y Restricciones</h2>
      
      <div className="form-group">
        <label>Intereses específicos (selecciona varios):</label>
        {Object.entries(interesesCategorizados).map(([categoria, opciones]) => (
          <div key={categoria} className="categoria-group">
            <h4>{categoria.toUpperCase()}</h4>
            <div className="checkbox-group">
              {opciones.map(interes => (
                <label key={interes} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={stepC.interesesEspecificos?.includes(interes) || false}
                    onChange={() => handleInteresChange(interes)}
                  />
                  {interes.replace('_', ' ').toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-group">
        <label>Medio de transporte:</label>
        <select 
          value={stepC.transporte || ''} 
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

      <div className="form-group">
        <label>Preferencia de ambiente:</label>
        <select 
          value={stepC.preferenciaAmbiente || ''} 
          onChange={(e) => dispatch(updateStepC({ preferenciaAmbiente: e.target.value }))}
        >
          <option value="">Selecciona...</option>
          {ambienteOptions.map(option => (
            <option key={option} value={option}>
              {option.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Restricciones especiales:</label>
        <div className="checkbox-group">
          {restriccionesOptions.map(restriccion => (
            <label key={restriccion} className="checkbox-label">
              <input
                type="checkbox"
                checked={stepC.restricciones?.includes(restriccion) || false}
                onChange={() => handleRestriccionChange(restriccion)}
              />
              {restriccion.replace('_', ' ').toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <button onClick={() => dispatch(prevStep())} className="prev-btn">
          Anterior
        </button>
        <button 
          onClick={handleNext}
          disabled={!stepC.transporte || !stepC.interesesEspecificos?.length}
          className="next-btn"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}