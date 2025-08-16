import { useSelector, useDispatch } from 'react-redux'
import { eliminarPunto } from '../store/tourSlice'

export default function MapView() {
  const { rutaGenerada } = useSelector(state => state.tour)
  const dispatch = useDispatch()

  if (!rutaGenerada) return null

  return (
    <div className="map-view">
      <h3>Mapa del Recorrido</h3>
      
      {/* Placeholder para mapa - aquí integrarías Google Maps o Leaflet */}
      <div className="map-placeholder">
        <div className="map-info">
          📍 Mapa Interactivo
          <p>Aquí se mostraría el mapa con todos los puntos del recorrido</p>
        </div>
        
        <div className="map-points">
          {rutaGenerada.ruta.map(punto => (
            <div key={punto.orden} className="map-point">
              <div className="point-marker">
                <span className="point-number">{punto.orden}</span>
              </div>
              <div className="point-info">
                <h4>{punto.nombre}</h4>
                <p className="point-type">{punto.tipo}</p>
                <p className="point-coords">
                  Lat: {punto.coordenadas.lat}, Lon: {punto.coordenadas.lon}
                </p>
                <button 
                  onClick={() => dispatch(eliminarPunto(punto.orden))}
                  className="remove-point-btn"
                >
                  ❌ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="map-summary">
        <div className="summary-item">
          <span>⏱️ Tiempo total: {rutaGenerada.tiempo_total_min} min</span>
        </div>
        <div className="summary-item">
          <span>🚶 Transporte: {rutaGenerada.transporte_total_min} min</span>
        </div>
        <div className="summary-item">
          <span>🌤️ {rutaGenerada.recomendaciones_clima}</span>
        </div>
      </div>
    </div>
  )
}