import { useSelector, useDispatch } from 'react-redux'
import { eliminarPunto } from '../store/tourSlice'

export default function MapView() {
  const { rutaGenerada } = useSelector(state => state.tour)
  const dispatch = useDispatch()

  if (!rutaGenerada) return null
  
  const isMultiCiudades = rutaGenerada.tipo_tour === 'multi_ciudades'
  
  // Obtener todos los puntos según el tipo de tour
  const getAllPoints = () => {
    if (isMultiCiudades && rutaGenerada.dias) {
      return rutaGenerada.dias.flatMap(dia => 
        dia.ruta?.map(punto => ({ ...punto, dia: dia.dia, ciudad: dia.ciudad })) || []
      )
    }
    return rutaGenerada.ruta || []
  }
  
  const allPoints = getAllPoints()

  return (
    <div className="map-view">
      <h3>Mapa del Recorrido</h3>
      
      <div className="map-placeholder">
        <div className="map-info">
          📍 Mapa Interactivo
          <p>Aquí se mostraría el mapa con todos los puntos del recorrido</p>
          {isMultiCiudades && (
            <p>🌍 Tour de {rutaGenerada.duracion_dias} días</p>
          )}
        </div>
        
        <div className="map-points">
          {allPoints.map((punto, index) => (
            <div key={`${punto.dia || 1}-${punto.orden}`} className="map-point">
              <div className="point-marker">
                <span className="point-number">{punto.orden}</span>
              </div>
              <div className="point-info">
                <h4>{punto.nombre}</h4>
                {punto.dia && <p className="point-day">Día {punto.dia} - {punto.ciudad}</p>}
                <p className="point-type">{punto.tipo}</p>
                <p className="point-coords">
                  Lat: {punto.coordenadas?.lat}, Lon: {punto.coordenadas?.lon}
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
          <span>📅 {isMultiCiudades ? `${rutaGenerada.duracion_dias} días` : 'Tour de 1 día'}</span>
        </div>
        <div className="summary-item">
          <span>💰 Costo: {rutaGenerada.costo_total_estimado || 'No disponible'}</span>
        </div>
        <div className="summary-item">
          <span>🌤️ {rutaGenerada.recomendaciones_clima || 'Buen clima'}</span>
        </div>
      </div>
    </div>
  )
}