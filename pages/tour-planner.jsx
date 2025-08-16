import { useSelector } from 'react-redux'
import TourStepper from '../components/TourStepper'
import MapView from '../components/MapView'
import ItineraryList from '../components/ItineraryList'

export default function TourPlanner() {
  const { currentStep, rutaGenerada, loading, error } = useSelector(state => state.tour)

  return (
    <div className="tour-planner">
      <header className="tour-header">
        <h1>🌍 Tour Planner</h1>
        <p>Crea tu recorrido personalizado por cualquier ciudad del mundo</p>
      </header>

      {/* Mostrar stepper si no hemos terminado */}
      {currentStep <= 5 && (
        <div className="stepper-section">
          <TourStepper />
        </div>
      )}

      {/* Mostrar loading */}
      {loading && (
        <div className="loading-section">
          <div className="loading-spinner">🔄</div>
          <h2>Generando tu tour personalizado...</h2>
          <p>Nuestro agente IA está creando el mejor recorrido para ti</p>
        </div>
      )}

      {/* Mostrar error */}
      {error && (
        <div className="error-section">
          <h2>❌ Error al generar el tour</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            🔄 Intentar de nuevo
          </button>
        </div>
      )}

      {/* Mostrar resultados */}
      {rutaGenerada && !loading && (
        <div className="results-section">
          <div className="results-grid">
            <div className="map-column">
              <MapView />
            </div>
            <div className="itinerary-column">
              <ItineraryList />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}