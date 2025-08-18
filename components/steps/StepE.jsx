import { useSelector, useDispatch } from 'react-redux'
import { updateStepE, prevStep, generateTour } from '../../store/tourSlice'
import { useState } from 'react'

export default function StepE() {
  const dispatch = useDispatch()
  const { stepA, stepB, stepC, stepD, stepE, loading, selectedCity, detectedCity } = useSelector(state => state.tour)
  
  const targetCity = selectedCity || detectedCity
  
  const getTransportInfo = (transporte) => {
    const transporteInfo = {
      caminata: { icon: '🚶', tiempo: '5-15 min', descripcion: 'entre puntos cercanos' },
      bicicleta: { icon: '🚴', tiempo: '3-10 min', descripcion: 'entre puntos' },
      transporte_publico: { icon: '🚌', tiempo: '10-25 min', descripcion: 'incluyendo esperas' },
      vehiculo_propio: { icon: '🚗', tiempo: '5-20 min', descripcion: 'más estacionamiento' },
      taxi_uber: { icon: '🚕', tiempo: '5-15 min', descripcion: 'directo entre puntos' }
    }
    return transporteInfo[transporte] || transporteInfo.caminata
  }
  
  const transportInfo = getTransportInfo(stepC.transporte)

  const mapCoords = stepE.ubicacionInicio?.coordenadas || {
    lat: targetCity?.lat || -33.4372,
    lon: targetCity?.lon || -70.6506
  }

  const handleGenerateTour = () => {
    const userData = {
      ...stepA,
      ...stepB,
      ...stepC,
      ...stepD,
      ...stepE,
      selectedCity,
      detectedCity
    }
    
    dispatch(generateTour(userData))
  }

  return (
    <div className="city-selector">
      <h2>📍 Ubicación de Inicio en {targetCity?.name || 'la ciudad'}</h2>
      
      {/* Mapa con puntos estratégicos */}
      <div className="map-section">
        <h2>🗺️ Puntos Estratégicos</h2>
        <div className="map-container">
          <iframe
            key={`${mapCoords.lat}-${mapCoords.lon}`}
            src={`https://maps.google.com/maps?q=${mapCoords.lat},${mapCoords.lon}&hl=es&z=15&output=embed`}
            width="100%"
            height="400"
            style={{ border: 'none', borderRadius: '12px' }}
            title={`Mapa de ${stepE.ubicacionInicio?.direccion || targetCity?.name}`}
            allowFullScreen
          />
        </div>
      </div>
      


      {/* Punto seleccionado */}
      {stepE.ubicacionInicio && (
        <div className="selected-city">
          <div className="selection-info">
            <p>📍 <strong>Punto de partida:</strong> {stepE.ubicacionInicio.direccion}</p>
            {stepE.ubicacionInicio.descripcion && (
              <p>{stepE.ubicacionInicio.descripcion}</p>
            )}
          </div>
        </div>
      )}
      
      {/* Ubicación personalizada */}
      <div className="cities-section">
        <h3>✏️ O ingresa una dirección específica</h3>
        <input
          type="text"
          placeholder="Ej: Hotel Central, Centro de la Ciudad"
          value={stepE.ubicacionInicio?.tipo === 'direccion_custom' ? stepE.ubicacionInicio?.direccion || '' : ''}
          onChange={(e) => dispatch(updateStepE({
            ubicacionInicio: {
              tipo: 'direccion_custom',
              direccion: e.target.value,
              coordenadas: { lat: targetCity?.lat || -33.4372, lon: targetCity?.lon || -70.6506 }
            }
          }))}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
      </div>
      
      {stepC.transporte && (
        <div className="transport-info">
          <h4>🚀 Información de Traslados</h4>
          <div className="transport-details">
            <span className="transport-icon">{transportInfo.icon}</span>
            <div className="transport-text">
              <strong>{stepC.transporte.replace('_', ' ').toUpperCase()}</strong>
              <p>Tiempo aproximado: <strong>{transportInfo.tiempo}</strong> {transportInfo.descripcion}</p>
              <small>💡 La ruta se optimizará en línea recta para minimizar traslados</small>
            </div>
          </div>
        </div>
      )}

      <div className="step-actions">
        <button onClick={() => dispatch(prevStep())} className="prev-btn">
          Anterior
        </button>
        <button 
          onClick={handleGenerateTour}
          disabled={!stepE.ubicacionInicio || loading}
          className="generate-btn"
        >
          {loading ? '🔄 Generando Tour...' : '🚀 Generar Mi Tour'}
        </button>
      </div>
    </div>
  )
}