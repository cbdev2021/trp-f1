import { useSelector } from 'react-redux'
import StepA from './steps/StepA'
import StepB from './steps/StepB'
import StepC from './steps/StepC'

export default function TourStepper() {
  const { currentStep } = useSelector(state => state.tour)

  const steps = [
    { component: <StepA />, title: "Datos Básicos" },
    { component: <StepB />, title: "Preferencias" },
    { component: <StepC />, title: "Intereses y Restricciones" }
  ]

  if (currentStep > 3) return null

  return (
    <div className="stepper-container">
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={index} className="step-item">
            <div className={`step-circle ${currentStep > index ? 'completed' : currentStep === index + 1 ? 'active' : ''}`}>
              {index + 1}
            </div>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>
      
      <div className="step-content-wrapper">
        {steps[currentStep - 1]?.component}
      </div>
    </div>
  )
}