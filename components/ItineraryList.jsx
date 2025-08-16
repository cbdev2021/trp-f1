import { useSelector, useDispatch } from 'react-redux'
import { aprobarRuta, resetTour } from '../store/tourSlice'

export default function ItineraryList() {
  const { rutaGenerada, rutaAprobada } = useSelector(state => state.tour)
  const dispatch = useDispatch()

  if (!rutaGenerada) return null

  const handleStartRoute = () => {
    alert('¡Comenzando tu recorrido! 🚀\n\nEn una versión completa, aquí se abriría la navegación GPS.')
  }

  const handleNewTour = () => {
    dispatch(resetTour())
  }

  return (
    <div className="itinerary-list">
      <div className="itinerary-header">
        <h2>🗺️ Tu Ruta Personalizada</h2>
        <div className="route-stats">
          <span className="stat">⏱️ {Math.floor(rutaGenerada.tiempo_total_min / 60)}h {rutaGenerada.tiempo_total_min % 60}m</span>
          <span className="stat">📍 {rutaGenerada.ruta.length} paradas</span>
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
          <p>🎯 ¡Ruta aprobada! Disfruta tu recorrido por Santiago</p>
        </div>
      )}
    </div>
  )
}