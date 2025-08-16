import { useSelector } from 'react-redux'

export const useTourData = () => {
  const tourState = useSelector(state => state.tour)
  
  const getCompleteUserData = () => ({
    ...tourState.stepA,
    ...tourState.stepB,
    ...tourState.stepC,
    ...tourState.stepD,
    ...tourState.stepE
  })
  
  const isStepComplete = (step) => {
    const stepData = tourState[`step${step}`]
    if (!stepData) return false
    
    // Validaciones específicas por paso
    switch(step) {
      case 'A':
        return stepData.demografia && stepData.presupuesto && 
               stepData.ventanaHoraria.inicio && stepData.ventanaHoraria.fin
      case 'B':
        return stepData.motivos.length > 0 && stepData.estilo
      case 'C':
        return stepData.transporte
      case 'D':
        return stepData.interesesDetallados.length > 0
      case 'E':
        return stepData.ubicacionInicio !== null
      default:
        return false
    }
  }
  
  const getProgressPercentage = () => {
    const totalSteps = 5
    const completedSteps = ['A', 'B', 'C', 'D', 'E'].filter(step => isStepComplete(step)).length
    return Math.round((completedSteps / totalSteps) * 100)
  }
  
  const canProceedToNextStep = () => {
    const currentStepLetter = String.fromCharCode(64 + tourState.currentStep) // A, B, C, D, E
    return isStepComplete(currentStepLetter)
  }
  
  const getTourSummary = () => {
    const userData = getCompleteUserData()
    return {
      tipoViajero: userData.demografia,
      presupuesto: userData.presupuesto,
      duracion: userData.ventanaHoraria ? 
        `${userData.ventanaHoraria.inicio} - ${userData.ventanaHoraria.fin}` : '',
      motivosPrincipales: userData.motivos?.slice(0, 3) || [],
      transporte: userData.transporte,
      ubicacionInicio: userData.ubicacionInicio?.direccion || ''
    }
  }
  
  return {
    ...tourState,
    getCompleteUserData,
    isStepComplete,
    getProgressPercentage,
    canProceedToNextStep,
    getTourSummary
  }
}