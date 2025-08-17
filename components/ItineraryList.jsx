import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { aprobarRuta, resetTour } from '../store/tourSlice'

export default function ItineraryList() {
  const { rutaGenerada, rutaAprobada, selectedCity, detectedCity, stepC } = useSelector(state => state.tour)
  const dispatch = useDispatch()
  const router = useRouter()
  
  const targetCity = selectedCity || detectedCity

  if (!rutaGenerada) return null
  
  const getTransportIcon = (transporte) => {
    const icons = {
      caminata: '🚶',
      bicicleta: '🚴', 
      transporte_publico: '🚌',
      vehiculo_propio: '🚗',
      taxi_uber: '🚕'
    }
    return icons[transporte] || '🚶'
  }
  
  const tiempoVisitas = rutaGenerada.ruta.reduce((acc, punto) => acc + punto.duracion_min, 0)
  const tiempoTraslados = rutaGenerada.transporte_total_min || 0
  const tiempoTotalCalculado = tiempoVisitas + tiempoTraslados
  const costoTotal = rutaGenerada.ruta.reduce((acc, punto) => {
    const costo = punto.costo_estimado?.replace(/[^\d]/g, '') || '0'
    return acc + parseInt(costo)
  }, 0)

  const handleStartRoute = () => {
    alert('¡Comenzando tu recorrido! 🚀\n\nEn una versión completa, aquí se abriría la navegación GPS.')
  }

  const handleNewTour = () => {
    dispatch(resetTour())
    router.push('/')
  }

  return (
    <div className="itinerary-list">
      <div className="itinerary-header">
        <h2>🗺️ Tu Ruta Personalizada</h2>
        <div className="route-summary">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-icon">⏱️</span>
              <div className="summary-text">
                <strong>{Math.floor(rutaGenerada.tiempo_total_min / 60)}h {rutaGenerada.tiempo_total_min % 60}m</strong>
                <small>Tiempo total</small>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">📍</span>
              <div className="summary-text">
                <strong>{rutaGenerada.ruta.length} paradas</strong>
                <small>Lugares a visitar</small>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">{getTransportIcon(stepC.transporte)}</span>
              <div className="summary-text">
                <strong>{tiempoTraslados} min</strong>
                <small>Traslados</small>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">💰</span>
              <div className="summary-text">
                <strong>${costoTotal.toLocaleString()}</strong>
                <small>Costo estimado</small>
              </div>
            </div>
          </div>
          <div className="time-breakdown">
            <span className="breakdown-item">🎯 {tiempoVisitas} min visitas</span>
            <span className="breakdown-separator">+</span>
            <span className="breakdown-item">{getTransportIcon(stepC.transporte)} {tiempoTraslados} min traslados</span>
            <span className="breakdown-separator">=</span>
            <span className="breakdown-total">⏱️ {tiempoTotalCalculado} min total</span>
          </div>
        </div>
      </div>

      <div className="itinerary-items">
        {rutaGenerada.ruta.map(punto => (
          <div key={punto.orden} className="itinerary-item">
            <div className="item-order">
              <span className="order-number">{punto.orden}</span>
            </div>
            <div className="item-content">
              <h3 className="item-title">{punto.nombre}</h3>
              <p className="item-description">{punto.descripcion}</p>
              <div className="item-details">
                <span className="detail">⏱️ {punto.duracion_min} min</span>
                <span className="detail">💰 {punto.costo_estimado}</span>
                <span className="detail">🏷️ {punto.tipo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rutaGenerada.sugerencias_alternativas && rutaGenerada.sugerencias_alternativas.length > 0 && (
        <div className="alternatives-section">
          <h4>💡 Alternativas sugeridas:</h4>
          <div className="alternatives-list">
            {rutaGenerada.sugerencias_alternativas.map((alt, index) => (
              <div key={index} className="alternative-item">
                <span>{alt.nombre} ({alt.tipo})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="itinerary-actions">
        {!rutaAprobada ? (
          <>
            <button 
              onClick={() => dispatch(aprobarRuta())}
              className="approve-btn"
            >
              ✅ Aprobar Ruta
            </button>
            <button 
              onClick={handleNewTour}
              className="modify-btn"
            >
              🔄 Crear Nueva Ruta
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleStartRoute}
              className="start-route-btn"
            >
              🚀 Comenzar Recorrido
            </button>
            <button 
              onClick={handleNewTour}
              className="new-tour-btn"
            >
              ➕ Nuevo Tour
            </button>
          </>
        )}
      </div>

      {rutaAprobada && (
        <div className="feedback-section">
          <p>🎯 ¡Ruta aprobada! Disfruta tu recorrido por {targetCity?.name || 'la ciudad'}</p>
        </div>
      )}
    </div>
  )
}