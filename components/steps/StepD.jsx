// StepD eliminado - funcionalidad consolidada en StepC
// Este archivo se mantiene para evitar errores de importación
// pero redirige al nuevo flujo

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { nextStep } from '../../store/tourSlice'

export default function StepD() {
  const dispatch = useDispatch()
  
  useEffect(() => {
    // Auto-avanzar al siguiente paso ya que StepD se consolidó en StepC
    dispatch(nextStep())
  }, [])

  return (
    <div className="step-content">
      <p>Redirigiendo...</p>
    </div>
  )
}