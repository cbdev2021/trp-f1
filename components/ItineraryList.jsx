import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { aprobarRuta, resetTour } from '../store/tourSlice'

export default function ItineraryList() {
  const { rutaGenerada, rutaAprobada, selectedCity, detectedCity, stepC, stepA } = useSelector(state => state.tour)
  const dispatch = useDispatch()
  const router = useRouter()
  
  const targetCity = selectedCity || detectedCity
  const isMultiCiudades = rutaGenerada?.tipo_tour === 'multi_ciudades'

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
  
  // Cálculos según tipo de tour
  const getCalculos = () => {
    if (isMultiCiudades) {
      const totalDias = rutaGenerada.duracion_dias || 1
      const costoTotal = rutaGenerada.costo_total_estimado?.replace(/[^\d]/g, '') || '0'
      return {
        tiempoVisitas: 0, // Se calcula por día
        tiempoTraslados: 0,
        tiempoTotalCalculado: totalDias * 8 * 60, // 8h por día
        costoTotal: parseInt(costoTotal),
        totalDias
      }
    } else {
      const tiempoVisitas = rutaGenerada.ruta?.reduce((acc, punto) => acc + punto.duracion_min, 0) || 0
      const tiempoTraslados = rutaGenerada.transporte_total_min || 0
      const costoTotal = rutaGenerada.costo_total_estimado?.replace(/[^\d]/g, '') || '0'
      return {
        tiempoVisitas,
        tiempoTraslados,
        tiempoTotalCalculado: tiempoVisitas + tiempoTraslados,
        costoTotal: parseInt(costoTotal),
        totalDias: 1
      }
    }
  }
  
  const { tiempoVisitas, tiempoTraslados, tiempoTotalCalculado, costoTotal, totalDias } = getCalculos()

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
              <span className="summary-icon">📅</span>
              <div className="summary-text">
                {/* <strong>{totalDias} día{totalDias > 1 ? 's' : ''}</strong> */}
                <strong> Días</strong>
                <small>{rutaGenerada.duracion || `${totalDias} día${totalDias > 1 ? 's' : ''}`}</small>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">🌍</span>
              <div className="summary-text">
                <strong>{isMultiCiudades ? 'Multi-ciudades' : 'Ciudad local'}</strong>
                <small>{isMultiCiudades ? rutaGenerada.dias?.length || 1 : 1} destino{isMultiCiudades && rutaGenerada.dias?.length > 1 ? 's' : ''}</small>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">{getTransportIcon(stepC.transporte)}</span>
              <div className="summary-text">
                <strong>{isMultiCiudades ? 'Incluido' : `${tiempoTraslados} min`}</strong>
                <small>Transporte</small>
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-icon">💰</span>
              <div className="summary-text">
                <strong>${costoTotal.toLocaleString()}</strong>
                <small>Costo total</small>
              </div>
            </div>
          </div>
          {!isMultiCiudades && rutaGenerada.dias_totales <= 1 && (
            <div className="time-breakdown">
              <span className="breakdown-item">🎯 {tiempoVisitas} min visitas</span>
              <span className="breakdown-separator">+</span>
              <span className="breakdown-item">{getTransportIcon(stepC.transporte)} {tiempoTraslados} min traslados</span>
              <span className="breakdown-separator">=</span>
              <span className="breakdown-total">⏱️ {tiempoTotalCalculado} min total</span>
            </div>
          )}
          {!isMultiCiudades && rutaGenerada.dias_totales > 1 && (
            <div className="multi-day-summary">
              <span className="summary-text">📊 {rutaGenerada.dias_totales} días • {rutaGenerada.actividades_por_dia || Math.ceil(rutaGenerada.ruta?.length / rutaGenerada.dias_totales)} actividades/día • {rutaGenerada.minutos_por_dia || Math.floor(tiempoVisitas / rutaGenerada.dias_totales)}min/día</span>
            </div>
          )}
        </div>
      </div>

      <div className="itinerary-items">
        {isMultiCiudades ? (
          rutaGenerada.dias?.map(dia => (
            <div key={dia.dia} className="day-section">
              <div className="day-header">
                <h3>📅 Día {dia.dia} - {dia.fecha}</h3>
                <div className="day-info">
                  <span className="day-city">🌍 {dia.ciudad}</span>
                  <span className="day-cost">💰 {dia.costo_dia}</span>
                </div>
              </div>
              {dia.ruta?.map(punto => (
                <div key={`${dia.dia}-${punto.orden}`} className="itinerary-item">
                  <div className="item-order">
                    <span className="order-number">{punto.orden}</span>
                  </div>
                  <div className="item-content">
                    <h4 className="item-title">{punto.nombre}</h4>
                    <p className="item-description">{punto.descripcion}</p>
                    <div className="item-details">
                      <span className="detail">⏱️ {punto.duracion_min} min</span>
                      <span className="detail">💰 {punto.costo_estimado}</span>
                      <span className="detail">🏷️ {punto.tipo}</span>
                    </div>
                  </div>
                </div>
              ))}
              {dia.alojamiento && (
                <div className="accommodation-info">
                  🏨 <strong>Alojamiento:</strong> {dia.alojamiento}
                </div>
              )}
            </div>
          ))
        ) : (
          // Renderizar con separadores de días si es multi-día
          rutaGenerada.dias_totales > 1 ? (
            Array.from({ length: rutaGenerada.dias_totales }, (_, diaIndex) => {
              const actividadesPorDia = rutaGenerada.actividades_por_dia || Math.ceil(rutaGenerada.ruta.length / rutaGenerada.dias_totales)
              const inicioIndice = diaIndex * actividadesPorDia
              const finIndice = Math.min((diaIndex + 1) * actividadesPorDia, rutaGenerada.ruta.length)
              const actividadesDia = rutaGenerada.ruta.slice(inicioIndice, finIndice)
              
              const tiempoVisitasDia = actividadesDia.reduce((acc, punto) => acc + (punto.duracion_min || 0), 0)
              const tiempoTrasladosDia = (actividadesDia.length - 1) * 15 // 15min entre actividades
              const costoTotalDia = actividadesDia.reduce((acc, punto) => {
                const costo = punto.costo_estimado?.replace(/[^\d]/g, '') || '0'
                return acc + parseInt(costo)
              }, 0)
              
              return (
                <div key={`dia-${diaIndex + 1}`}>
                  <div className="day-divider">
                    <div className="day-title">
                      <h3>📅 Día {diaIndex + 1}</h3>
                      <div className="day-metrics">
                        <span className="day-metric">🎯 {tiempoVisitasDia}min visitas</span>
                        <span className="day-metric">{getTransportIcon(stepC.transporte)} {tiempoTrasladosDia}min traslados</span>
                        <span className="day-metric">💰 ${costoTotalDia.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {actividadesDia.map(punto => (
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
              )
            })
          ) : (
            // Tour de un solo día
            rutaGenerada.ruta?.map(punto => (
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
            ))
          )
        )}
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
          <p>🎯 ¡Ruta aprobada! Disfruta tu {isMultiCiudades ? `tour de ${totalDias} días` : 'recorrido'} por {targetCity?.name || 'la ciudad'}</p>
        </div>
      )}
    </div>
  )
}