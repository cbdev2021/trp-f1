import { useEffect, useRef } from 'react'

export default function ClickableMap({ center, onMapClick }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstance.current) {
      // Cargar Leaflet
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
      
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => {
        const L = window.L
        
        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([center.lat, center.lon], 15)
        
        // Usar tiles de Google Maps (Satellite + Roads)
        L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(map)
        
        // Controles personalizados estilo Google Maps
        const zoomControl = L.control.zoom({
          position: 'bottomright'
        })
        map.addControl(zoomControl)
        
        map.on('click', (e) => {
          if (markerRef.current) {
            map.removeLayer(markerRef.current)
          }
          
          // Efecto ripple estilo Google Maps
          const ripple = L.circle([e.latlng.lat, e.latlng.lng], {
            color: '#1a73e8',
            fillColor: '#1a73e8',
            fillOpacity: 0.2,
            radius: 30,
            weight: 2
          }).addTo(map)
          
          setTimeout(() => map.removeLayer(ripple), 800)
          
          // Marcador estilo Google Maps
          setTimeout(() => {
            markerRef.current = L.marker([e.latlng.lat, e.latlng.lng], {
              icon: L.divIcon({
                className: 'google-marker',
                html: '<div class="google-pin"></div>',
                iconSize: [32, 40],
                iconAnchor: [16, 40]
              })
            }).addTo(map)
          }, 200)
          
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
        })
        
        mapInstance.current = map
      }
      
      document.head.appendChild(script)
      
      // Estilos Google Maps
      const style = document.createElement('style')
      style.textContent = `
        .leaflet-container {
          font-family: 'Google Sans', Roboto, Arial, sans-serif;
          background: #e5e3df;
        }
        .leaflet-control-zoom {
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border-radius: 2px;
        }
        .leaflet-control-zoom a {
          background: #fff;
          color: #666;
          border: none;
          width: 40px;
          height: 40px;
          line-height: 40px;
          font-size: 18px;
          font-weight: 500;
        }
        .leaflet-control-zoom a:hover {
          background: #f5f5f5;
          color: #333;
        }
        .google-marker {
          background: none;
          border: none;
        }
        .google-pin {
          width: 22px;
          height: 32px;
          background: #ea4335;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          position: relative;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          animation: gmaps-drop 0.5s ease-out;
        }
        .google-pin::after {
          content: '';
          width: 10px;
          height: 10px;
          background: #fff;
          border-radius: 50%;
          position: absolute;
          top: 6px;
          left: 6px;
        }
        .leaflet-popup-content-wrapper {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        .leaflet-popup-tip {
          background: #fff;
        }
        @keyframes gmaps-drop {
          0% { transform: rotate(-45deg) translateY(-100px) scale(0.5); opacity: 0; }
          50% { transform: rotate(-45deg) translateY(0) scale(1.1); opacity: 1; }
          100% { transform: rotate(-45deg) scale(1); }
        }
      `
      document.head.appendChild(style)
    }
  }, [center, onMapClick])

  return (
    <div 
      ref={mapRef} 
      style={{ 
        width: '100%', 
        height: '300px', 
        borderRadius: '8px',
        border: '1px solid #dadce0',
        overflow: 'hidden'
      }} 
    />
  )
}