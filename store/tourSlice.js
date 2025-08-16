import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk para detectar ciudad
export const detectCity = createAsyncThunk(
  'tour/detectCity',
  async () => {
    const response = await fetch('/api/detect-city')
    return response.json()
  }
)

// Async thunk para generar tour
export const generateTour = createAsyncThunk(
  'tour/generate',
  async (userData) => {
    const response = await fetch('/api/tour-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userData,
        sessionId: `user-${Date.now()}`
      })
    })
    return response.json()
  }
)

const tourSlice = createSlice({
  name: 'tour',
  initialState: {
    // Detección de ciudad
    detectedCity: null,
    cityLoading: false,
    
    // Stepper data (5 pasos según documento)
    stepA: { 
      demografia: '', 
      presupuesto: '', 
      ventanaHoraria: { inicio: '', fin: '' } 
    },
    stepB: { 
      motivos: [], 
      estilo: '' 
    },
    stepC: { 
      restricciones: [], 
      transporte: '' 
    },
    stepD: { 
      interesesDetallados: [], 
      eventos: false 
    },
    stepE: { 
      ubicacionInicio: null 
    },
    currentStep: 1,
    
    // Respuesta del agente
    rutaGenerada: null,
    rutaAprobada: false,
    loading: false,
    error: null
  },
  reducers: {
    updateStepA: (state, action) => {
      state.stepA = { ...state.stepA, ...action.payload }
    },
    updateStepB: (state, action) => {
      state.stepB = { ...state.stepB, ...action.payload }
    },
    updateStepC: (state, action) => {
      state.stepC = { ...state.stepC, ...action.payload }
    },
    updateStepD: (state, action) => {
      state.stepD = { ...state.stepD, ...action.payload }
    },
    updateStepE: (state, action) => {
      state.stepE = { ...state.stepE, ...action.payload }
    },
    nextStep: (state) => {
      if (state.currentStep < 5) state.currentStep += 1
    },
    prevStep: (state) => {
      if (state.currentStep > 1) state.currentStep -= 1
    },
    aprobarRuta: (state) => {
      state.rutaAprobada = true
    },
    modificarPunto: (state, action) => {
      const { orden, cambios } = action.payload
      const puntoIndex = state.rutaGenerada.ruta.findIndex(p => p.orden === orden)
      if (puntoIndex !== -1) {
        state.rutaGenerada.ruta[puntoIndex] = { 
          ...state.rutaGenerada.ruta[puntoIndex], 
          ...cambios 
        }
      }
    },
    eliminarPunto: (state, action) => {
      if (state.rutaGenerada) {
        state.rutaGenerada.ruta = state.rutaGenerada.ruta.filter(p => p.orden !== action.payload)
      }
    },
    resetTour: (state) => {
      return {
        ...state,
        currentStep: 1,
        rutaGenerada: null,
        rutaAprobada: false,
        loading: false,
        error: null
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(detectCity.pending, (state) => {
        state.cityLoading = true
      })
      .addCase(detectCity.fulfilled, (state, action) => {
        state.cityLoading = false
        state.detectedCity = action.payload
      })
      .addCase(detectCity.rejected, (state) => {
        state.cityLoading = false
        state.detectedCity = { city: 'Santiago', country: 'Chile' }
      })
      .addCase(generateTour.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateTour.fulfilled, (state, action) => {
        state.loading = false
        state.rutaGenerada = action.payload
        state.currentStep = 6 // Mostrar resultados
      })
      .addCase(generateTour.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  }
})

export const { 
  updateStepA, 
  updateStepB, 
  updateStepC, 
  updateStepD, 
  updateStepE,
  nextStep, 
  prevStep, 
  aprobarRuta, 
  modificarPunto, 
  eliminarPunto,
  resetTour 
} = tourSlice.actions

export default tourSlice.reducer