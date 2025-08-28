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
        
        const map = L.map(mapRef.current).setView([center.lat, center.lon], 13)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
        
        map.on('click', (e) => {
          if (markerRef.current) {
            map.removeLayer(markerRef.current)
          }
          
          // Efecto de surgir de color
          const ripple = L.circle([e.latlng.lat, e.latlng.lng], {
            color: '#4285f4',
            fillColor: '#4285f4',
            fillOpacity: 0.3,
            radius: 50,
            className: 'click-ripple'
          }).addTo(map)
          
          setTimeout(() => map.removeLayer(ripple), 600)
          
          // Crear marcador con animación
          setTimeout(() => {
            markerRef.current = L.marker([e.latlng.lat, e.latlng.lng], {
              icon: L.divIcon({
                className: 'custom-marker',
                html: '<div class="marker-pin"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
              })
            }).addTo(map)
          }, 200)
          
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
        })
        
        mapInstance.current = map
      }
      
      document.head.appendChild(script)
      
      // Agregar estilos CSS para el marcador
      const style = document.createElement('style')
      style.textContent = `
        .custom-marker {
          background: none;
          border: none;
        }
        .marker-pin {
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          background: #ea4335;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -15px 0 0 -10px;
          animation: bounce 0.6s ease-out;
          box-shadow: 0 2px 8px rgba(234, 67, 53, 0.4);
        }
        .marker-pin:after {
          content: '';
          width: 8px;
          height: 8px;
          margin: 6px 0 0 6px;
          background: #fff;
          position: absolute;
          border-radius: 50%;
        }
        .click-ripple {
          animation: ripple-effect 0.6s ease-out;
        }
        @keyframes bounce {
          0% { transform: rotate(-45deg) scale(0); }
          50% { transform: rotate(-45deg) scale(1.2); }
          100% { transform: rotate(-45deg) scale(1); }
        }
        @keyframes ripple-effect {
          0% { transform: scale(0); opacity: 0.6; }
          100% { transform: scale(3); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }
  }, [center, onMapClick])

  return <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '12px' }} />
}