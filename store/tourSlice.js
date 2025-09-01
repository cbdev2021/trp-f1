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

// Async thunk para generar tour desde StepC
export const generateTourFromCurrentState = createAsyncThunk(
  'tour/generateFromCurrentState',
  async (_, { getState }) => {
    const state = getState().tour
    const targetCity = state.selectedCity || state.detectedCity
    

    const userData = {
      ...state.stepA,
      ...state.stepB,
      ...state.stepC,
      selectedCity: state.selectedCity,
      detectedCity: state.detectedCity,
      ubicacionInicio: {
        tipo: 'coordenadas',
        direccion: state.stepE.specificLocation || state.stepE.ciudadSeleccionada || `${targetCity?.city || targetCity?.name || 'Santiago'}`,
        coordenadas: state.stepE.coordenadasSeleccionadas,
        descripcion: state.stepE.specificLocation || 'Punto seleccionado por el usuario',
        categoria: 'punto_inicio'
      }
    }
    
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
    
    // Ciudad seleccionada
    selectedCity: null,
    
    // Stepper data (5 pasos según documento)
    stepA: { 
      demografia: '', 
      presupuesto: '', 
      tipoRuta: '',
      inicioTour: '',
      finTour: ''
    },
    stepB: { 
      tipoExperiencia: [], 
      intensidad: '',
      duracionPreferida: ''
    },
    stepC: { 
      interesesEspecificos: [],
      restricciones: [], 
      transporte: '',
      preferenciaAmbiente: ''
    },

    stepE: { 
      ubicacionInicio: null,
      coordenadasSeleccionadas: null,
      ciudadSeleccionada: null,
      specificLocation: null,
      startingPointTitle: null
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

    updateStepE: (state, action) => {
      state.stepE = { ...state.stepE, ...action.payload }
    },
    nextStep: (state) => {
      if (state.currentStep < 3) state.currentStep += 1
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
    selectCity: (state, action) => {
      state.selectedCity = action.payload
    },
    setSelectedCoordinates: (state, action) => {
      state.stepE.coordenadasSeleccionadas = action.payload.coordinates
      state.stepE.ciudadSeleccionada = action.payload.city
      state.stepE.specificLocation = action.payload.specificLocation
      state.stepE.startingPointTitle = action.payload.startingPointTitle
    },
    resetTour: (state) => {
      return {
        ...state,
        stepA: { 
          demografia: '', 
          presupuesto: '', 
          tipoRuta: '',
          inicioTour: '',
          finTour: ''
        },
        stepB: { 
          tipoExperiencia: [], 
          intensidad: '',
          duracionPreferida: ''
        },
        stepC: { 
          interesesEspecificos: [],
          restricciones: [], 
          transporte: '',
          preferenciaAmbiente: ''
        },
        currentStep: 1,
        rutaGenerada: null,
        rutaAprobada: false,
        loading: false,
        error: null
      }
    },
    generateTourFromStepC: (state) => {
      state.loading = true
      state.error = null
      state.currentStep = 6 // Saltar a resultados
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
      .addCase(generateTourFromCurrentState.pending, (state) => {
        state.loading = true
        state.error = null
        state.currentStep = 6 // Saltar a resultados
      })
      .addCase(generateTourFromCurrentState.fulfilled, (state, action) => {
        state.loading = false
        state.rutaGenerada = action.payload
      })
      .addCase(generateTourFromCurrentState.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

  }
})

export const { 
  updateStepA, 
  updateStepB, 
  updateStepC, 
  updateStepE,
  nextStep, 
  prevStep, 
  aprobarRuta, 
  modificarPunto, 
  eliminarPunto,
  selectCity,
  setSelectedCoordinates,
  resetTour,
  generateTourFromStepC 
} = tourSlice.actions

export default tourSlice.reducer