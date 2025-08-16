import { useSelector, useDispatch } from 'react-redux'
import { updateStepD, nextStep, prevStep } from '../../store/tourSlice'

export default function StepD() {
  const dispatch = useDispatch()
  const { stepD } = useSelector(state => state.tour)

  const interesesOptions = [
    'musica_vivo', 'librerias', 'arte_urbano', 'mercados', 
    'cafes', 'museos', 'parques', 'miradores', 'shopping'
  ]

  const handleInteresChange = (interes) => {
    const newIntereses = stepD.interesesDetallados.includes(interes)
      ? stepD.interesesDetallados.filter(i => i !== interes)
      : [...stepD.interesesDetallados, interes]
    
    dispatch(updateStepD({ interesesDetallados: newIntereses }))
  }

  const handleNext = () => {
    if (stepD.interesesDetallados.length > 0) {
      dispatch(nextStep())
    }
  }

  return (
    <div className="step-content">
      <h2>Intereses Detallados</h2>
      
      <div className="form-group">
        <label>Gustos específicos (selecciona varios):</label>
        <div className="checkbox-group">
          {interesesOptions.map(interes => (
            <label key={interes} className="checkbox-label">
              <input
                type="checkbox"
                checked={stepD.interesesDetallados.includes(interes)}
                onChange={() => handleInteresChange(interes)}
              />
              {interes.replace('_', ' ').toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={stepD.eventos}
            onChange={(e) => dispatch(updateStepD({ eventos: e.target.checked }))}
          />
          Incluir eventos en vivo
        </label>
      </div>

      <div className="step-actions">
        <button onClick={() => dispatch(prevStep())} className="prev-btn">
          Anterior
        </button>
        <button 
          onClick={handleNext}
          disabled={stepD.interesesDetallados.length === 0}
          className="next-btn"
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}